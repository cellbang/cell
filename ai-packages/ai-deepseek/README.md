# Cell - AI DeepSeek Component

## 概览

AI DeepSeek 模块是一个用于与 DeepSeek API 交互的库，提供了生成聊天响应和嵌入向量的功能。通过简单易用的 API 接口，支持消息的创建、请求的发送和响应的处理。是 @celljs/ai-core 模块中所有模型服务接口抽象的一种实现。

## 特性

- 生成聊天响应
- 生成嵌入向量
- 支持流式响应
- 支持多种模型参数配置

## 安装

使用 npm 安装 AI DeepSeek 模块：

```bash
npm install @celljs/ai-deepseek
```

或者使用 yarn：

```bash
yarn add @celljs/ai-deepseek
```

## 快速开始

以下是一个简单的示例，展示如何使用 AI DeepSeek 模块生成聊天响应和嵌入向量：

```typescript
import { AssistantMessage, PromptTemplate } from '@celljs/ai-core';
import { DeepSeekChatModel, DeepSeekModel, } from '@celljs/ai-deepseek';
import { Component Autowired } from '@celljs/core';

@Component()
export class DeepSeekDemo {
    @Autowired(DeepSeekChatModel)
    private deepSeekChatModel: DeepSeekChatModel;

    @Autowired(DeepSeekEmbeddingModel)
    private deepSeekEmbeddingModel: DeepSeekEmbeddingModel;

    @Autowired(PromptTemplate)
    private promptTemplate: PromptTemplate;

    /**
     * Chat with DeepSeek
     */
    async chat() {
        const prompt = await this.promptTemplate.create(
            'Hello {name}',
            { 
                chatOptions: { model: DeepSeekModel.DEEPSEEK_CHAT },
                variables: { name: 'DeepSeek' }
            }
        );
        const response = await this.deepSeekChatModel.call(prompt);
        console.log(response.result.output);
    }

    /**
     * Stream chat response
     */
    async stream() {
        const prompt = await this.promptTemplate.create(
            'Hello {name}',
            { 
                chatOptions: { model: DeepSeekModel.DEEPSEEK_CHAT },
                variables: { name: 'DeepSeek' }
            }
        );
        const response$ = await this.deepSeekChatModel.stream(prompt);
        response$.subscribe({
            next: response => console.log(response.result.output),
            complete: () => console.log('Chat completed!')
        });
    }

    /**
     * Embed text to vector
     */
    async embed() {
        const response = await this.deepSeekEmbeddingModel.call({
            inputs: ['text to embed'],
            options: { model: DeepSeekModel.XXX }
        });
        console.log(response.result.embeddings);
    }
}
```

## 许可证

本项目采用 MIT 许可证。
