# Cell - AI Core Component

## 概览

AI Core 模块是一个用于与 AI 模型服务交互的库，提供了生成聊天响应和嵌入向量的功能。通过简单易用的 API 接口，支持消息的创建、请求的发送和响应的处理。是所有 AI 模块的基础，提供了 AI 模块通用的 API 接口。


## 特性

- 生成聊天响应
- 生成嵌入向量
- 支持流式响应
- 支持多种模型参数配置

## 安装

使用 npm 安装 AI Core 模块：

```bash
npm install @celljs/ai-core
```

或者使用 yarn：

```bash
yarn add @celljs/ai-core
```

AI Core 模块是所有 AI 模块的基础，提供了 AI 模块通用的 API 接口，包括消息的创建、请求的发送和响应的处理。所以在使用 AI Core 模块之前，需要先安装厂商对应的模型服务适配模块。例如：`@celljs/ai-ollama`。

```bash
npm install @celljs/ai-ollama
```

或者使用 yarn：

```bash
yarn add @celljs/ai-ollama
```

## 快速开始

以下是一个简单的示例，展示如何使用 AI Ollama 模块生成聊天响应和嵌入向量：

```typescript
import { AssistantMessage, PromptTemplate } from '@celljs/ai-core';
import { Component Autowired } from '@celljs/core';

@Component()
export class OllamaDemo {
    @Autowired(OllamChatModel)
    private chatModel: ChatModel;

    @Autowired(EmbeddingModel)
    private embeddingModel: EmbeddingModel;

    @Autowired(PromptTemplate)
    private promptTemplate: PromptTemplate;

    /**
     * Chat with Ollama
     */
    async chat() {
        const prompt = await this.promptTemplate.create(
            'Hello {name}',
            { 
                chatOptions: { model: 'llama3.2' },
                variables: { name: 'Ollama' }
            }
        );
        const response = await this.chatModel.call(prompt);
        console.log(response.result.output);
    }

    /**
     * Stream chat response
     */
    async stream() {
        const prompt = await this.promptTemplate.create(
            'Hello {name}',
            { 
                chatOptions: { model: 'llama3.2' },
                variables: { name: 'Ollama' }
            }
        );
        const response$ = await this.chatModel.stream(prompt);
        response$.subscribe({
            next: response => console.log(response.result.output),
            complete: () => console.log('Chat completed!')
        });
    }

    /**
     * Embed text to vector
     */
    async embed() {
        const response = await this.embeddingModel.call({
            inputs: ['text to embed'],
            options: { model: 'llama3.2' }
        });
        console.log(response.result.embeddings);
    }
}
```

## 许可证

本项目采用 MIT 许可证。
