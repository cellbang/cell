import { Assert } from '@celljs/core';
import { ChatResponse, ChatResponseBuilderReference } from '../api/chat-response';
import {
    ContentBlockDeltaEvent,
    ContentBlockDeltaJson,
    ContentBlockDeltaText,
    ContentBlockStartEvent,
    ContentBlockText,
    ContentBlockToolUse,
    EventType,
    MessageDeltaEvent,
    MessageStartEvent,
    ToolUseAggregationEvent,
    AnthropicEvent
} from '../api/event';
import { ContentBlock, ContentBlockType } from '../api/content-block';

export abstract class StreamUtil {
    static isToolUseStart(event: AnthropicEvent): boolean {
        if (!event || !event.type || event.type !== EventType.CONTENT_BLOCK_START) {
            return false;
        }
        return (event as ContentBlockStartEvent).contentBlock.type === ContentBlockType.TOOL_USE;
    }

    static isToolUseFinish(event: AnthropicEvent): boolean {
        if (!event || !event.type || event.type !== EventType.CONTENT_BLOCK_STOP) {
            return false;
        }
        return true;
    }

    static mergeToolUseEvents(previousEvent: AnthropicEvent, event: AnthropicEvent): AnthropicEvent {
        if (!previousEvent || !event) {
            return event;
        }

        const eventAggregator = previousEvent as ToolUseAggregationEvent;

        if (event.type === EventType.CONTENT_BLOCK_START) {
            const contentBlockStart = event as ContentBlockStartEvent;

            if (contentBlockStart.contentBlock.type === ContentBlockType.TOOL_USE) {
                const cbToolUse = contentBlockStart.contentBlock as ContentBlockToolUse;

                eventAggregator.id = cbToolUse.id;
                eventAggregator.name = cbToolUse.name;
                eventAggregator.index = contentBlockStart.index;
                eventAggregator.partialJson = '';
            }
        } else if (event.type === EventType.CONTENT_BLOCK_DELTA) {
            const contentBlockDelta = event as ContentBlockDeltaEvent;
            Assert.isTrue(
                contentBlockDelta.delta.type === ContentBlockType.INPUT_JSON_DELTA,
                'The json content block delta should have been aggregated. Unsupported content block type: ' + contentBlockDelta.delta.type
            );

            if (contentBlockDelta.delta.type === ContentBlockType.INPUT_JSON_DELTA) {
                return eventAggregator.appendPartialJson((contentBlockDelta.delta as ContentBlockDeltaJson).partialJson);
            }
        } else if (event.type === EventType.CONTENT_BLOCK_STOP) {
            if (!eventAggregator.isEmpty()) {
                eventAggregator.squashIntoContentBlock();
                return eventAggregator;
            }
        }

        return event;
    }

    static eventToChatResponse(event: AnthropicEvent): ChatResponse {
        if (event.type === EventType.MESSAGE_START) {
            ChatResponseBuilderReference.reset();
            const messageStartEvent = event as MessageStartEvent;
            ChatResponseBuilderReference.get()
                .withType(event.type)
                .withId(messageStartEvent.message.id)
                .withRole(messageStartEvent.message.role)
                .withModel(messageStartEvent.message.model)
                .withUsage(messageStartEvent.message.usage)
                .withContent([]);

        } else if (event.type === EventType.TOOL_USE_AGGREGATE) {
            const eventToolUseBuilder = event as ToolUseAggregationEvent;

            if (eventToolUseBuilder.toolContentBlocks && eventToolUseBuilder.toolContentBlocks.length > 0) {
                const content = eventToolUseBuilder.toolContentBlocks.map(
                    toolToUse => new ContentBlock(ContentBlockType.TOOL_USE, undefined, undefined, undefined, toolToUse.id, toolToUse.name, toolToUse.input)
                );
                ChatResponseBuilderReference.get().withContent(content);

            }
        } else if (event.type === EventType.CONTENT_BLOCK_START) {
            const contentBlockStartEvent = event as ContentBlockStartEvent;

            Assert.isTrue(
                contentBlockStartEvent.contentBlock.type === ContentBlockType.TEXT,
                'The json content block should have been aggregated. Unsupported content block type: ' + contentBlockStartEvent.contentBlock.type
            );

            if (contentBlockStartEvent.contentBlock.type === ContentBlockType.TEXT) {
                const contentBlockText = contentBlockStartEvent.contentBlock as ContentBlockText;
                ChatResponseBuilderReference
                    .get()
                    .withType(event.type)
                    .withContent([new ContentBlock(ContentBlockType.TEXT, undefined, contentBlockText.text, contentBlockStartEvent.index)]);
            }
        } else if (event.type === EventType.CONTENT_BLOCK_DELTA) {
            const contentBlockDeltaEvent = event as ContentBlockDeltaEvent;

            if (contentBlockDeltaEvent.delta.type === ContentBlockType.TEXT_DELTA) {
                const deltaTxt = contentBlockDeltaEvent.delta as ContentBlockDeltaText;
                ChatResponseBuilderReference
                    .get()
                    .withType(event.type)
                    .withContent([new ContentBlock(ContentBlockType.TEXT_DELTA, undefined, deltaTxt.text, contentBlockDeltaEvent.index)]);
            }
        } else if (event.type === EventType.MESSAGE_DELTA) {
            ChatResponseBuilderReference.get().withType(event.type);

            const messageDeltaEvent = event as MessageDeltaEvent;

            if (messageDeltaEvent.delta.stopReason) {
                ChatResponseBuilderReference.get().withStopReason(messageDeltaEvent.delta.stopReason);
            }

            if (messageDeltaEvent.delta.stopSequence) {
                ChatResponseBuilderReference.get().withStopSequence(messageDeltaEvent.delta.stopSequence);
            }

            if (messageDeltaEvent.usage) {
                ChatResponseBuilderReference.get().withOutputTokens(messageDeltaEvent.usage.outputTokens);
            }
        } else if (event.type === EventType.MESSAGE_STOP) {
            // pass through
        } else {
            ChatResponseBuilderReference.get().withType(event.type).withContent([]);
        }

        return ChatResponseBuilderReference.get().build();
    }
}
