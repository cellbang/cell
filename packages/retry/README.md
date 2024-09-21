# Cell - Retry Component

这个项目为 Cell 应用程序提供了重试支持。
它在 Cell AI 和其他应用中使用。

这个库的NPM包是：

```bash
@celljs/retry
```

## 快速入门

本节提供了有关如何开始使用 Cell Retry 的快速介绍。

### 示例

以下示例展示了如何使用 Cell Retry：

```typescript

@Component()
export class Service {
    protected retryOperations: RetryOperations;

    service(): void {
        this.retryOperations.execute(async () => {
            // 做一些事情
        },
        {
            maxAttempts: 3,
            timeout: 1000,
            recoveryCallback: async () => {
                // 在这里进行恢复逻辑
            } 
        });
    }
}
```

这个示例默认最多重试三次，如果仍然失败，则尝试使用`recoveryCallback`方法。
在`execute`方法中有各种选项，可以包括或排除错误类型，限制重试次数以及设置退避策略。

## 安装

```bash
yarn add @celljs/retry # npm install @celljs/retry
```

## 功能和 API

本节讨论了 Cell Retry 的功能，并展示了如何使用其 API。

### 使用`RetryOperations`

为了使处理更加健壮且不容易失败，有时候自动重试失败的操作可能会在后续尝试中成功。
适合这种处理的错误通常是短暂的。例如，由于网络故障或数据库更新中的`DeadLockLoserError`，导致远程调用 Web 服务或 RMI 服务失败，可能会在短时间内解决。为了自动重试这种操作，Cell Retry 提供了`RetryOperations`策略。`RetryOperations`接口定义如下：

```typescript
/**
 * RetryOperations接口表示使用不同选项重试任务的操作。
 */
export interface RetryOperations {
    /**
     * 使用给定选项执行回调函数。
     *
     * @template T - 回调函数的返回值类型。
     * @param {RetryCallback<T>} callback - 要执行的回调函数。
     * @param {RetryOptions<T>} options - 重试任务的选项。
     * @returns {Promise<T>} - 回调函数的结果
     * @throws {RetryError} - 重试期间发生错误。
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // 做一些事情
     * }, { maxAttempts: 3, timeout: 1000 });
     * console.log(result);
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // 做一些事情
     * }, { maxAttempts: 3, timeout: 1000, backOffOptions: { delay: 1000 } });
     * console.log(result);
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // 做一些事情
     * }, { maxAttempts: 3, timeout: 1000, backOffOptions: { delay: 1000, multiplier: 2 } });
     * console.log(result);
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // 做一些事情
     * }, { maxAttempts: 3, timeout: 1000, backOffOptions: { delay: 1000, multiplier: 2, random: true } });
     * console.log(result);
     * @example
     * const result = await retryOperations.execute(async () => {
     *     // 做一些事情
     * }, { maxAttempts: 3, timeout: 1000, backOffOptions: { delay: 1000, multiplier: 2, random: true, maxDelay: 5000 } });
     * console.log(result);
     */
    execute<T>(callback: RetryCallback<T>, options?: RetryOptions<T>): Promise<T>;
}
```

基本的回调函数是一个简单的接口，允许您插入一些业务逻辑进行重试：

```typescript
export interface RetryCallback<T> {
    (): Promise<T>;
}
```

回调函数会被尝试执行，如果失败（抛出错误），则会重试，直到成功或实现决定中止为止。

以下示例展示了如何使用它：

```typescript
@Component()
export class Service {
    protected retryOperations: RetryOperations;

    service(): void {
        this.retryOperations.execute(async () => {
            // 做一些事情
        },
        {
            maxAttempts: 3,
            timeout: 1000,
            backOffOptions: {
                delay: 1000,
                multiplier: 2,
                random: true,
                maxDelay: 5000
            },
        });
    }
}
```

在上面的示例中，我们执行`service`方法，最多重试三次。在`execute`方法中有各种选项，可以包括或排除错误类型，限制重试次数以及设置退避策略。

### 使用`RetryContext`

`RetryCallback`的方法参数是一个`RetryContext`。
许多回调函数忽略上下文。
但是，如果需要，您可以将其用作属性包以存储迭代期间的数据。
它还具有一些有用的属性，例如`retryCount`。

### 使用`RecoveryCallback`

当重试耗尽时，`RetryOperations`可以将控制权传递给不同的回调函数：`RecoveryCallback`。为了使用这个功能，客户端可以将回调函数一起传递给同一个方法，如下面的示例所示：

```typescript
@Component()
export class Service {
    protected retryOperations: RetryOperations;

    service(): void {
        this.retryOperations.execute(async () => {
            // 做一些事情
        },
        {
            maxAttempts: 3,
            timeout: 1000,
            recoveryCallback: async () => {
                // 在这里进行恢复逻辑
            } 
        });
    }
}
```

如果业务逻辑在模板决定中止之前没有成功，客户端有机会通过恢复回调函数进行一些替代处理。

## 重试策略

在`RetryOperations`内部，`execute`方法中的重试或失败决策由`RetryPolicy`确定。`RetryOperations`负责创建`RetryContext`并在每次尝试时将其传递给`RetryCallback`。在回调函数失败后，`RetryOperations`必须调用`RetryPolicy`来要求其更新状态（存储在`RetryContext`中）。然后，它询问策略是否可以进行另一次尝试。如果不能进行另一次尝试（例如，达到了限制或检测到了超时），策略还负责识别耗尽的状态，但不负责处理异常。`RetryOperations`抛出原始异常。在这种情况下，它抛出`RetryError`。
> *提示：*
失败本质上是可重试或不可重试的 - 如果相同的异常总是从业务逻辑中抛出，重试它是没有帮助的。因此，您不应该在所有异常类型上重试。相反，尝试只关注您期望可重试的异常。对于业务逻辑来说，更积极地重试通常不会有害，但是这是浪费的，因为如果失败是确定性的，则会浪费时间重试您事先知道是致命的事情。

Cell Retry 提供了一个通用的`RetryPolicy`实现。这个实现提供了重试最大次数、超时、异常类型等选项，以控制重试行为。

## 退避策略

在暂时失败后重试时，等待一段时间再尝试通常是有帮助的，因为（通常）失败是由于某些只能通过等待解决的问题引起的。如果`RetryCallback`失败，`RetryOperations`可以根据`BackoffPolicy`暂停执行。以下清单显示了`BackoffPolicy`接口的定义：

```typescript
export interface BackOffPolicy {
    start(ctx: RetryContext): Promise<BackOffContext>;
    backOff(ctx: BackOffContext): Promise<void>;
}
```

`BackoffPolicy`可以以任何方式自由实现退避。Cell Retry 提供的策略都使用`timeout`。常见的用例是指数递增的等待周期进行退避，以避免两次重试进入锁步并且都失败（从以太网中学到的教训）。Cell Retry还提供了具有随机化的延迟策略的版本，这对于避免复杂系统中相关故障之间的共振非常有用。

