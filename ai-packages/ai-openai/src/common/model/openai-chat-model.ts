// /*
//  * Copyright 2023-2024 the original author or authors.
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *      https://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// package org.springframework.ai.openai;

// import java.util.ArrayList;
// import java.util.Base64;
// import java.util.HashMap;
// import java.util.HashSet;
// import java.util.List;
// import java.util.Map;
// import java.util.Set;
// import java.util.concurrent.ConcurrentHashMap;
// import java.util.stream.Collectors;

// import io.micrometer.observation.Observation;
// import io.micrometer.observation.ObservationRegistry;
// import io.micrometer.observation.contextpropagation.ObservationThreadLocalAccessor;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import reactor.core.publisher.Flux;
// import reactor.core.publisher.Mono;

// import org.springframework.ai.chat.messages.AssistantMessage;
// import org.springframework.ai.chat.messages.MessageType;
// import org.springframework.ai.chat.messages.ToolResponseMessage;
// import org.springframework.ai.chat.messages.UserMessage;
// import org.springframework.ai.chat.metadata.ChatGenerationMetadata;
// import org.springframework.ai.chat.metadata.ChatResponseMetadata;
// import org.springframework.ai.chat.metadata.EmptyUsage;
// import org.springframework.ai.chat.metadata.RateLimit;
// import org.springframework.ai.chat.metadata.Usage;
// import org.springframework.ai.chat.metadata.UsageUtils;
// import org.springframework.ai.chat.model.AbstractToolCallSupport;
// import org.springframework.ai.chat.model.ChatModel;
// import org.springframework.ai.chat.model.ChatResponse;
// import org.springframework.ai.chat.model.Generation;
// import org.springframework.ai.chat.model.MessageAggregator;
// import org.springframework.ai.chat.model.StreamingChatModel;
// import org.springframework.ai.chat.observation.ChatModelObservationContext;
// import org.springframework.ai.chat.observation.ChatModelObservationConvention;
// import org.springframework.ai.chat.observation.ChatModelObservationDocumentation;
// import org.springframework.ai.chat.observation.DefaultChatModelObservationConvention;
// import org.springframework.ai.chat.prompt.ChatOptions;
// import org.springframework.ai.chat.prompt.Prompt;
// import org.springframework.ai.model.Media;
// import org.springframework.ai.model.ModelOptionsUtils;
// import org.springframework.ai.model.function.FunctionCallback;
// import org.springframework.ai.model.function.FunctionCallbackResolver;
// import org.springframework.ai.model.function.FunctionCallingOptions;
// import org.springframework.ai.openai.api.OpenAiApi;
// import org.springframework.ai.openai.api.OpenAiApi.ChatCompletion;
// import org.springframework.ai.openai.api.OpenAiApi.ChatCompletion.Choice;
// import org.springframework.ai.openai.api.OpenAiApi.ChatCompletionMessage;
// import org.springframework.ai.openai.api.OpenAiApi.ChatCompletionMessage.AudioOutput;
// import org.springframework.ai.openai.api.OpenAiApi.ChatCompletionMessage.ChatCompletionFunction;
// import org.springframework.ai.openai.api.OpenAiApi.ChatCompletionMessage.MediaContent;
// import org.springframework.ai.openai.api.OpenAiApi.ChatCompletionMessage.ToolCall;
// import org.springframework.ai.openai.api.OpenAiApi.ChatCompletionRequest;
// import org.springframework.ai.openai.api.common.OpenAiApiConstants;
// import org.springframework.ai.openai.metadata.OpenAiUsage;
// import org.springframework.ai.openai.metadata.support.OpenAiResponseHeaderExtractor;
// import org.springframework.ai.retry.RetryUtils;
// import org.springframework.core.io.ByteArrayResource;
// import org.springframework.core.io.Resource;
// import org.springframework.http.ResponseEntity;
// import org.springframework.retry.support.RetryTemplate;
// import org.springframework.util.Assert;
// import org.springframework.util.CollectionUtils;
// import org.springframework.util.MimeType;
// import org.springframework.util.MimeTypeUtils;
// import org.springframework.util.MultiValueMap;
// import org.springframework.util.StringUtils;

// /**
//  * {@link ChatModel} and {@link StreamingChatModel} implementation for {@literal OpenAI}
//  * backed by {@link OpenAiApi}.
//  *
//  * @author Mark Pollack
//  * @author Christian Tzolov
//  * @author Ueibin Kim
//  * @author John Blum
//  * @author Josh Long
//  * @author Jemin Huh
//  * @author Grogdunn
//  * @author Hyunjoon Choi
//  * @author Mariusz Bernacki
//  * @author luocongqiu
//  * @author Thomas Vitale
//  * @author Ilayaperumal Gopinathan
//  * @author Alexandros Pappas
//  * @see ChatModel
//  * @see StreamingChatModel
//  * @see OpenAiApi
//  */
// public class OpenAiChatModel extends AbstractToolCallSupport implements ChatModel {

// 	private static final Logger logger = LoggerFactory.getLogger(OpenAiChatModel.class);

// 	private static final ChatModelObservationConvention DEFAULT_OBSERVATION_CONVENTION = new DefaultChatModelObservationConvention();

// 	/**
// 	 * The default options used for the chat completion requests.
// 	 */
// 	private final OpenAiChatOptions defaultOptions;

// 	/**
// 	 * The retry template used to retry the OpenAI API calls.
// 	 */
// 	private final RetryTemplate retryTemplate;

// 	/**
// 	 * Low-level access to the OpenAI API.
// 	 */
// 	private final OpenAiApi openAiApi;

// 	/**
// 	 * Observation registry used for instrumentation.
// 	 */
// 	private final ObservationRegistry observationRegistry;

// 	/**
// 	 * Conventions to use for generating observations.
// 	 */
// 	private ChatModelObservationConvention observationConvention = DEFAULT_OBSERVATION_CONVENTION;

// 	/**
// 	 * Creates an instance of the OpenAiChatModel.
// 	 * @param openAiApi The OpenAiApi instance to be used for interacting with the OpenAI
// 	 * Chat API.
// 	 * @throws IllegalArgumentException if openAiApi is null
// 	 */
// 	public OpenAiChatModel(OpenAiApi openAiApi) {
// 		this(openAiApi, OpenAiChatOptions.builder().model(OpenAiApi.DEFAULT_CHAT_MODEL).temperature(0.7).build());
// 	}

// 	/**
// 	 * Initializes an instance of the OpenAiChatModel.
// 	 * @param openAiApi The OpenAiApi instance to be used for interacting with the OpenAI
// 	 * Chat API.
// 	 * @param options The OpenAiChatOptions to configure the chat model.
// 	 */
// 	public OpenAiChatModel(OpenAiApi openAiApi, OpenAiChatOptions options) {
// 		this(openAiApi, options, null, RetryUtils.DEFAULT_RETRY_TEMPLATE);
// 	}

// 	/**
// 	 * Initializes a new instance of the OpenAiChatModel.
// 	 * @param openAiApi The OpenAiApi instance to be used for interacting with the OpenAI
// 	 * Chat API.
// 	 * @param options The OpenAiChatOptions to configure the chat model.
// 	 * @param functionCallbackResolver The function callback resolver.
// 	 * @param retryTemplate The retry template.
// 	 */
// 	public OpenAiChatModel(OpenAiApi openAiApi, OpenAiChatOptions options,
// 			FunctionCallbackResolver functionCallbackResolver, RetryTemplate retryTemplate) {
// 		this(openAiApi, options, functionCallbackResolver, List.of(), retryTemplate);
// 	}

// 	/**
// 	 * Initializes a new instance of the OpenAiChatModel.
// 	 * @param openAiApi The OpenAiApi instance to be used for interacting with the OpenAI
// 	 * Chat API.
// 	 * @param options The OpenAiChatOptions to configure the chat model.
// 	 * @param functionCallbackResolver The function callback resolver.
// 	 * @param toolFunctionCallbacks The tool function callbacks.
// 	 * @param retryTemplate The retry template.
// 	 */
// 	public OpenAiChatModel(OpenAiApi openAiApi, OpenAiChatOptions options,
// 			FunctionCallbackResolver functionCallbackResolver, List<FunctionCallback> toolFunctionCallbacks,
// 			RetryTemplate retryTemplate) {
// 		this(openAiApi, options, functionCallbackResolver, toolFunctionCallbacks, retryTemplate,
// 				ObservationRegistry.NOOP);
// 	}

// 	/**
// 	 * Initializes a new instance of the OpenAiChatModel.
// 	 * @param openAiApi The OpenAiApi instance to be used for interacting with the OpenAI
// 	 * Chat API.
// 	 * @param options The OpenAiChatOptions to configure the chat model.
// 	 * @param functionCallbackResolver The function callback resolver.
// 	 * @param toolFunctionCallbacks The tool function callbacks.
// 	 * @param retryTemplate The retry template.
// 	 * @param observationRegistry The ObservationRegistry used for instrumentation.
// 	 */
// 	public OpenAiChatModel(OpenAiApi openAiApi, OpenAiChatOptions options,
// 			FunctionCallbackResolver functionCallbackResolver, List<FunctionCallback> toolFunctionCallbacks,
// 			RetryTemplate retryTemplate, ObservationRegistry observationRegistry) {

// 		super(functionCallbackResolver, options, toolFunctionCallbacks);

// 		Assert.notNull(openAiApi, "OpenAiApi must not be null");
// 		Assert.notNull(options, "Options must not be null");
// 		Assert.notNull(retryTemplate, "RetryTemplate must not be null");
// 		Assert.isTrue(CollectionUtils.isEmpty(options.getFunctionCallbacks()),
// 				"The default function callbacks must be set via the toolFunctionCallbacks constructor parameter");
// 		Assert.notNull(observationRegistry, "ObservationRegistry must not be null");

// 		this.openAiApi = openAiApi;
// 		this.defaultOptions = options;
// 		this.retryTemplate = retryTemplate;
// 		this.observationRegistry = observationRegistry;
// 	}

// 	@Override
// 	public ChatResponse call(Prompt prompt) {
// 		return this.internalCall(prompt, null);
// 	}

// 	public ChatResponse internalCall(Prompt prompt, ChatResponse previousChatResponse) {

// 		ChatCompletionRequest request = createRequest(prompt, false);

// 		ChatModelObservationContext observationContext = ChatModelObservationContext.builder()
// 			.prompt(prompt)
// 			.provider(OpenAiApiConstants.PROVIDER_NAME)
// 			.requestOptions(buildRequestOptions(request))
// 			.build();

// 		ChatResponse response = ChatModelObservationDocumentation.CHAT_MODEL_OPERATION
// 			.observation(this.observationConvention, DEFAULT_OBSERVATION_CONVENTION, () -> observationContext,
// 					this.observationRegistry)
// 			.observe(() -> {

// 				ResponseEntity<ChatCompletion> completionEntity = this.retryTemplate
// 					.execute(ctx -> this.openAiApi.chatCompletionEntity(request, getAdditionalHttpHeaders(prompt)));

// 				var chatCompletion = completionEntity.getBody();

// 				if (chatCompletion == null) {
// 					logger.warn("No chat completion returned for prompt: {}", prompt);
// 					return new ChatResponse(List.of());
// 				}

// 				List<Choice> choices = chatCompletion.choices();
// 				if (choices == null) {
// 					logger.warn("No choices returned for prompt: {}", prompt);
// 					return new ChatResponse(List.of());
// 				}

// 				List<Generation> generations = choices.stream().map(choice -> {
// 			// @formatter:off
// 					Map<String, Object> metadata = Map.of(
// 							"id", chatCompletion.id() != null ? chatCompletion.id() : "",
// 							"role", choice.message().role() != null ? choice.message().role().name() : "",
// 							"index", choice.index(),
// 							"finishReason", choice.finishReason() != null ? choice.finishReason().name() : "",
// 							"refusal", StringUtils.hasText(choice.message().refusal()) ? choice.message().refusal() : "");
// 					// @formatter:on
// 					return buildGeneration(choice, metadata, request);
// 				}).toList();

// 				// Non function calling.
// 				RateLimit rateLimit = OpenAiResponseHeaderExtractor.extractAiResponseHeaders(completionEntity);
// 				// Current usage
// 				OpenAiApi.Usage usage = completionEntity.getBody().usage();
// 				Usage currentChatResponseUsage = usage != null ? OpenAiUsage.from(usage) : new EmptyUsage();
// 				Usage accumulatedUsage = UsageUtils.getCumulativeUsage(currentChatResponseUsage, previousChatResponse);
// 				ChatResponse chatResponse = new ChatResponse(generations,
// 						from(completionEntity.getBody(), rateLimit, accumulatedUsage));

// 				observationContext.setResponse(chatResponse);

// 				return chatResponse;

// 			});

// 		if (!isProxyToolCalls(prompt, this.defaultOptions)
// 				&& isToolCall(response, Set.of(OpenAiApi.ChatCompletionFinishReason.TOOL_CALLS.name(),
// 						OpenAiApi.ChatCompletionFinishReason.STOP.name()))) {
// 			var toolCallConversation = handleToolCalls(prompt, response);
// 			// Recursively call the call method with the tool call message
// 			// conversation that contains the call responses.
// 			return this.internalCall(new Prompt(toolCallConversation, prompt.getOptions()), response);
// 		}

// 		return response;
// 	}

// 	@Override
// 	public Flux<ChatResponse> stream(Prompt prompt) {
// 		return internalStream(prompt, null);
// 	}

// 	public Flux<ChatResponse> internalStream(Prompt prompt, ChatResponse previousChatResponse) {
// 		return Flux.deferContextual(contextView -> {
// 			ChatCompletionRequest request = createRequest(prompt, true);

// 			if (request.outputModalities() != null) {
// 				if (request.outputModalities().stream().anyMatch(m -> m.equals("audio"))) {
// 					logger.warn("Audio output is not supported for streaming requests. Removing audio output.");
// 					throw new IllegalArgumentException("Audio output is not supported for streaming requests.");
// 				}
// 			}
// 			if (request.audioParameters() != null) {
// 				logger.warn("Audio parameters are not supported for streaming requests. Removing audio parameters.");
// 				throw new IllegalArgumentException("Audio parameters are not supported for streaming requests.");
// 			}

// 			Flux<OpenAiApi.ChatCompletionChunk> completionChunks = this.openAiApi.chatCompletionStream(request,
// 					getAdditionalHttpHeaders(prompt));

// 			// For chunked responses, only the first chunk contains the choice role.
// 			// The rest of the chunks with same ID share the same role.
// 			ConcurrentHashMap<String, String> roleMap = new ConcurrentHashMap<>();

// 			final ChatModelObservationContext observationContext = ChatModelObservationContext.builder()
// 				.prompt(prompt)
// 				.provider(OpenAiApiConstants.PROVIDER_NAME)
// 				.requestOptions(buildRequestOptions(request))
// 				.build();

// 			Observation observation = ChatModelObservationDocumentation.CHAT_MODEL_OPERATION.observation(
// 					this.observationConvention, DEFAULT_OBSERVATION_CONVENTION, () -> observationContext,
// 					this.observationRegistry);

// 			observation.parentObservation(contextView.getOrDefault(ObservationThreadLocalAccessor.KEY, null)).start();

// 			// Convert the ChatCompletionChunk into a ChatCompletion to be able to reuse
// 			// the function call handling logic.
// 			Flux<ChatResponse> chatResponse = completionChunks.map(this::chunkToChatCompletion)
// 				.switchMap(chatCompletion -> Mono.just(chatCompletion).map(chatCompletion2 -> {
// 					try {
// 						@SuppressWarnings("null")
// 						String id = chatCompletion2.id();

// 						List<Generation> generations = chatCompletion2.choices().stream().map(choice -> { // @formatter:off
// 							if (choice.message().role() != null) {
// 								roleMap.putIfAbsent(id, choice.message().role().name());
// 							}
// 							Map<String, Object> metadata = Map.of(
// 									"id", chatCompletion2.id(),
// 									"role", roleMap.getOrDefault(id, ""),
// 									"index", choice.index(),
// 									"finishReason", choice.finishReason() != null ? choice.finishReason().name() : "",
// 									"refusal", StringUtils.hasText(choice.message().refusal()) ? choice.message().refusal() : "");

// 							return buildGeneration(choice, metadata, request);
// 						}).toList();
// 						// @formatter:on
// 						OpenAiApi.Usage usage = chatCompletion2.usage();
// 						Usage currentChatResponseUsage = usage != null ? OpenAiUsage.from(usage) : new EmptyUsage();
// 						Usage accumulatedUsage = UsageUtils.getCumulativeUsage(currentChatResponseUsage,
// 								previousChatResponse);
// 						return new ChatResponse(generations, from(chatCompletion2, null, accumulatedUsage));
// 					}
// 					catch (Exception e) {
// 						logger.error("Error processing chat completion", e);
// 						return new ChatResponse(List.of());
// 					}
// 					// When in stream mode and enabled to include the usage, the OpenAI
// 					// Chat completion response would have the usage set only in its
// 					// final response. Hence, the following overlapping buffer is
// 					// created to store both the current and the subsequent response
// 					// to accumulate the usage from the subsequent response.
// 				}))
// 				.buffer(2, 1)
// 				.map(bufferList -> {
// 					ChatResponse firstResponse = bufferList.get(0);
// 					if (request.streamOptions() != null && request.streamOptions().includeUsage()) {
// 						if (bufferList.size() == 2) {
// 							ChatResponse secondResponse = bufferList.get(1);
// 							if (secondResponse != null && secondResponse.getMetadata() != null) {
// 								// This is the usage from the final Chat response for a
// 								// given Chat request.
// 								Usage usage = secondResponse.getMetadata().getUsage();
// 								if (!UsageUtils.isEmpty(usage)) {
// 									// Store the usage from the final response to the
// 									// penultimate response for accumulation.
// 									return new ChatResponse(firstResponse.getResults(),
// 											from(firstResponse.getMetadata(), usage));
// 								}
// 							}
// 						}
// 					}
// 					return firstResponse;
// 				});

// 			// @formatter:off
// 			Flux<ChatResponse> flux = chatResponse.flatMap(response -> {

// 				if (!isProxyToolCalls(prompt, this.defaultOptions) && isToolCall(response, Set.of(OpenAiApi.ChatCompletionFinishReason.TOOL_CALLS.name(),
// 						OpenAiApi.ChatCompletionFinishReason.STOP.name()))) {
// 					var toolCallConversation = handleToolCalls(prompt, response);
// 					// Recursively call the stream method with the tool call message
// 					// conversation that contains the call responses.
// 					return this.internalStream(new Prompt(toolCallConversation, prompt.getOptions()), response);
// 				}
// 				else {
// 					return Flux.just(response);
// 				}
// 			})
// 			.doOnError(observation::error)
// 			.doFinally(s -> observation.stop())
// 			.contextWrite(ctx -> ctx.put(ObservationThreadLocalAccessor.KEY, observation));
// 			// @formatter:on

// 			return new MessageAggregator().aggregate(flux, observationContext::setResponse);

// 		});
// 	}

// 	private MultiValueMap<String, String> getAdditionalHttpHeaders(Prompt prompt) {

// 		Map<String, String> headers = new HashMap<>(this.defaultOptions.getHttpHeaders());
// 		if (prompt.getOptions() != null && prompt.getOptions() instanceof OpenAiChatOptions chatOptions) {
// 			headers.putAll(chatOptions.getHttpHeaders());
// 		}
// 		return CollectionUtils.toMultiValueMap(
// 				headers.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, e -> List.of(e.getValue()))));
// 	}

// 	private Generation buildGeneration(Choice choice, Map<String, Object> metadata, ChatCompletionRequest request) {
// 		List<AssistantMessage.ToolCall> toolCalls = choice.message().toolCalls() == null ? List.of()
// 				: choice.message()
// 					.toolCalls()
// 					.stream()
// 					.map(toolCall -> new AssistantMessage.ToolCall(toolCall.id(), "function",
// 							toolCall.function().name(), toolCall.function().arguments()))
// 					.toList();

// 		String finishReason = (choice.finishReason() != null ? choice.finishReason().name() : "");
// 		var generationMetadataBuilder = ChatGenerationMetadata.builder().finishReason(finishReason);

// 		List<Media> media = new ArrayList<>();
// 		String textContent = choice.message().content();
// 		var audioOutput = choice.message().audioOutput();
// 		if (audioOutput != null) {
// 			String mimeType = String.format("audio/%s", request.audioParameters().format().name().toLowerCase());
// 			byte[] audioData = Base64.getDecoder().decode(audioOutput.data());
// 			Resource resource = new ByteArrayResource(audioData);
// 			Media.builder().mimeType(MimeTypeUtils.parseMimeType(mimeType)).data(resource).id(audioOutput.id()).build();
// 			media.add(Media.builder()
// 				.mimeType(MimeTypeUtils.parseMimeType(mimeType))
// 				.data(resource)
// 				.id(audioOutput.id())
// 				.build());
// 			if (!StringUtils.hasText(textContent)) {
// 				textContent = audioOutput.transcript();
// 			}
// 			generationMetadataBuilder.metadata("audioId", audioOutput.id());
// 			generationMetadataBuilder.metadata("audioExpiresAt", audioOutput.expiresAt());
// 		}

// 		var assistantMessage = new AssistantMessage(textContent, metadata, toolCalls, media);
// 		return new Generation(assistantMessage, generationMetadataBuilder.build());
// 	}

// 	private ChatResponseMetadata from(OpenAiApi.ChatCompletion result, RateLimit rateLimit, Usage usage) {
// 		Assert.notNull(result, "OpenAI ChatCompletionResult must not be null");
// 		var builder = ChatResponseMetadata.builder()
// 			.id(result.id() != null ? result.id() : "")
// 			.usage(usage)
// 			.model(result.model() != null ? result.model() : "")
// 			.keyValue("created", result.created() != null ? result.created() : 0L)
// 			.keyValue("system-fingerprint", result.systemFingerprint() != null ? result.systemFingerprint() : "");
// 		if (rateLimit != null) {
// 			builder.rateLimit(rateLimit);
// 		}
// 		return builder.build();
// 	}

// 	private ChatResponseMetadata from(ChatResponseMetadata chatResponseMetadata, Usage usage) {
// 		Assert.notNull(chatResponseMetadata, "OpenAI ChatResponseMetadata must not be null");
// 		var builder = ChatResponseMetadata.builder()
// 			.id(chatResponseMetadata.getId() != null ? chatResponseMetadata.getId() : "")
// 			.usage(usage)
// 			.model(chatResponseMetadata.getModel() != null ? chatResponseMetadata.getModel() : "");
// 		if (chatResponseMetadata.getRateLimit() != null) {
// 			builder.rateLimit(chatResponseMetadata.getRateLimit());
// 		}
// 		return builder.build();
// 	}

// 	/**
// 	 * Convert the ChatCompletionChunk into a ChatCompletion. The Usage is set to null.
// 	 * @param chunk the ChatCompletionChunk to convert
// 	 * @return the ChatCompletion
// 	 */
// 	private OpenAiApi.ChatCompletion chunkToChatCompletion(OpenAiApi.ChatCompletionChunk chunk) {
// 		List<Choice> choices = chunk.choices()
// 			.stream()
// 			.map(chunkChoice -> new Choice(chunkChoice.finishReason(), chunkChoice.index(), chunkChoice.delta(),
// 					chunkChoice.logprobs()))
// 			.toList();

// 		return new OpenAiApi.ChatCompletion(chunk.id(), choices, chunk.created(), chunk.model(), chunk.serviceTier(),
// 				chunk.systemFingerprint(), "chat.completion", chunk.usage());
// 	}

// 	/**
// 	 * Accessible for testing.
// 	 */
// 	ChatCompletionRequest createRequest(Prompt prompt, boolean stream) {

// 		List<ChatCompletionMessage> chatCompletionMessages = prompt.getInstructions().stream().map(message -> {
// 			if (message.getMessageType() == MessageType.USER || message.getMessageType() == MessageType.SYSTEM) {
// 				Object content = message.getText();
// 				if (message instanceof UserMessage userMessage) {
// 					if (!CollectionUtils.isEmpty(userMessage.getMedia())) {
// 						List<MediaContent> contentList = new ArrayList<>(List.of(new MediaContent(message.getText())));

// 						contentList.addAll(userMessage.getMedia().stream().map(this::mapToMediaContent).toList());

// 						content = contentList;
// 					}
// 				}

// 				return List.of(new ChatCompletionMessage(content,
// 						ChatCompletionMessage.Role.valueOf(message.getMessageType().name())));
// 			}
// 			else if (message.getMessageType() == MessageType.ASSISTANT) {
// 				var assistantMessage = (AssistantMessage) message;
// 				List<ToolCall> toolCalls = null;
// 				if (!CollectionUtils.isEmpty(assistantMessage.getToolCalls())) {
// 					toolCalls = assistantMessage.getToolCalls().stream().map(toolCall -> {
// 						var function = new ChatCompletionFunction(toolCall.name(), toolCall.arguments());
// 						return new ToolCall(toolCall.id(), toolCall.type(), function);
// 					}).toList();
// 				}
// 				AudioOutput audioOutput = null;
// 				if (!CollectionUtils.isEmpty(assistantMessage.getMedia())) {
// 					Assert.isTrue(assistantMessage.getMedia().size() == 1,
// 							"Only one media content is supported for assistant messages");
// 					audioOutput = new AudioOutput(assistantMessage.getMedia().get(0).getId(), null, null, null);

// 				}
// 				return List.of(new ChatCompletionMessage(assistantMessage.getText(),
// 						ChatCompletionMessage.Role.ASSISTANT, null, null, toolCalls, null, audioOutput));
// 			}
// 			else if (message.getMessageType() == MessageType.TOOL) {
// 				ToolResponseMessage toolMessage = (ToolResponseMessage) message;

// 				toolMessage.getResponses()
// 					.forEach(response -> Assert.isTrue(response.id() != null, "ToolResponseMessage must have an id"));
// 				return toolMessage.getResponses()
// 					.stream()
// 					.map(tr -> new ChatCompletionMessage(tr.responseData(), ChatCompletionMessage.Role.TOOL, tr.name(),
// 							tr.id(), null, null, null))
// 					.toList();
// 			}
// 			else {
// 				throw new IllegalArgumentException("Unsupported message type: " + message.getMessageType());
// 			}
// 		}).flatMap(List::stream).toList();

// 		ChatCompletionRequest request = new ChatCompletionRequest(chatCompletionMessages, stream);

// 		Set<String> enabledToolsToUse = new HashSet<>();

// 		if (prompt.getOptions() != null) {
// 			OpenAiChatOptions updatedRuntimeOptions = null;

// 			if (prompt.getOptions() instanceof FunctionCallingOptions) {
// 				updatedRuntimeOptions = ModelOptionsUtils.copyToTarget(((FunctionCallingOptions) prompt.getOptions()),
// 						FunctionCallingOptions.class, OpenAiChatOptions.class);
// 			}
// 			else {
// 				updatedRuntimeOptions = ModelOptionsUtils.copyToTarget(prompt.getOptions(), ChatOptions.class,
// 						OpenAiChatOptions.class);
// 			}

// 			enabledToolsToUse.addAll(this.runtimeFunctionCallbackConfigurations(updatedRuntimeOptions));

// 			request = ModelOptionsUtils.merge(updatedRuntimeOptions, request, ChatCompletionRequest.class);
// 		}

// 		if (!CollectionUtils.isEmpty(this.defaultOptions.getFunctions())) {
// 			enabledToolsToUse.addAll(this.defaultOptions.getFunctions());
// 		}

// 		request = ModelOptionsUtils.merge(request, this.defaultOptions, ChatCompletionRequest.class);

// 		// Add the enabled functions definitions to the request's tools parameter.
// 		if (!CollectionUtils.isEmpty(enabledToolsToUse)) {

// 			request = ModelOptionsUtils.merge(
// 					OpenAiChatOptions.builder().tools(this.getFunctionTools(enabledToolsToUse)).build(), request,
// 					ChatCompletionRequest.class);
// 		}
// 		// Remove `streamOptions` from the request if it is not a streaming request
// 		if (request.streamOptions() != null && !stream) {
// 			logger.warn("Removing streamOptions from the request as it is not a streaming request!");
// 			request = request.streamOptions(null);
// 		}

// 		return request;
// 	}

// 	private MediaContent mapToMediaContent(Media media) {
// 		var mimeType = media.getMimeType();
// 		if (MimeTypeUtils.parseMimeType("audio/mp3").equals(mimeType)) {
// 			return new MediaContent(
// 					new MediaContent.InputAudio(fromAudioData(media.getData()), MediaContent.InputAudio.Format.MP3));
// 		}
// 		if (MimeTypeUtils.parseMimeType("audio/wav").equals(mimeType)) {
// 			return new MediaContent(
// 					new MediaContent.InputAudio(fromAudioData(media.getData()), MediaContent.InputAudio.Format.WAV));
// 		}
// 		else {
// 			return new MediaContent(
// 					new MediaContent.ImageUrl(this.fromMediaData(media.getMimeType(), media.getData())));
// 		}
// 	}

// 	private String fromAudioData(Object audioData) {
// 		if (audioData instanceof byte[] bytes) {
// 			return Base64.getEncoder().encodeToString(bytes);
// 		}
// 		throw new IllegalArgumentException("Unsupported audio data type: " + audioData.getClass().getSimpleName());
// 	}

// 	private String fromMediaData(MimeType mimeType, Object mediaContentData) {
// 		if (mediaContentData instanceof byte[] bytes) {
// 			// Assume the bytes are an image. So, convert the bytes to a base64 encoded
// 			// following the prefix pattern.
// 			return String.format("data:%s;base64,%s", mimeType.toString(), Base64.getEncoder().encodeToString(bytes));
// 		}
// 		else if (mediaContentData instanceof String text) {
// 			// Assume the text is a URLs or a base64 encoded image prefixed by the user.
// 			return text;
// 		}
// 		else {
// 			throw new IllegalArgumentException(
// 					"Unsupported media data type: " + mediaContentData.getClass().getSimpleName());
// 		}
// 	}

// 	private List<OpenAiApi.FunctionTool> getFunctionTools(Set<String> functionNames) {
// 		return this.resolveFunctionCallbacks(functionNames).stream().map(functionCallback -> {
// 			var function = new OpenAiApi.FunctionTool.Function(functionCallback.getDescription(),
// 					functionCallback.getName(), functionCallback.getInputTypeSchema());
// 			return new OpenAiApi.FunctionTool(function);
// 		}).toList();
// 	}

// 	private ChatOptions buildRequestOptions(OpenAiApi.ChatCompletionRequest request) {
// 		return ChatOptions.builder()
// 			.model(request.model())
// 			.frequencyPenalty(request.frequencyPenalty())
// 			.maxTokens(request.maxTokens())
// 			.presencePenalty(request.presencePenalty())
// 			.stopSequences(request.stop())
// 			.temperature(request.temperature())
// 			.topP(request.topP())
// 			.build();
// 	}

// 	@Override
// 	public ChatOptions getDefaultOptions() {
// 		return OpenAiChatOptions.fromOptions(this.defaultOptions);
// 	}

// 	@Override
// 	public String toString() {
// 		return "OpenAiChatModel [defaultOptions=" + this.defaultOptions + "]";
// 	}

// 	/**
// 	 * Use the provided convention for reporting observation data
// 	 * @param observationConvention The provided convention
// 	 */
// 	public void setObservationConvention(ChatModelObservationConvention observationConvention) {
// 		Assert.notNull(observationConvention, "observationConvention cannot be null");
// 		this.observationConvention = observationConvention;
// 	}

// }

import {
    AssistantMessage,
    ChatGenerationMetadata, 
    ChatModel,
    ChatResponse,
    ChatResponseMetadata,
    Generation,
    Media,
    Prompt,
    RateLimit,
    SystemMessage,
    ToolResponseMessage,
    UserMessage } from '@celljs/ai-core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    ChatCompletionRequest,
    ChatCompletion,
    ChatCompletionMessage,
    Role,
    ToolCall as OpenAIToolCall,
    OpenAIAPI,
    Choice,
    MediaContent,
    Format
} from '../api';
import { Autowired, ByteUtil, Component, IllegalArgumentError, Logger, MimeTypeUtils } from '@celljs/core';
import { OpenAIChatOptions } from './openai-chat-options';
import { OpenAIResponseHeaderExtractor } from '../support';
import { Usage } from '../api/usage';

/**
 * {@link ChatModel} implementation for {@literal OpenAI} 
 * backed by {@link OpenAIAPI}.
 */
@Component(ChatModel)
export class OpenAIChatModel implements ChatModel {

    /**
     * The default options used for the chat completion requests.
     */
    @Autowired(OpenAIChatOptions)
    protected readonly defaultOptions: OpenAIChatOptions;

    /**
     * Low-level access to the OpenAI API.
     */
    @Autowired(OpenAIAPI)
    protected readonly chatApi: OpenAIAPI;

    @Autowired(Logger)
    protected readonly logger: Logger;

    protected fromAudioData(audioData: any): string {
        if (audioData instanceof Uint8Array) {
            return ByteUtil.encodeBase64(audioData);
        } else {
            throw new IllegalArgumentError(`Unsupported audio data type: ${audioData.constructor.name}`);
        }
    }

    protected fromMediaData(mimeType: MimeType, mediaContentData: any): string {
        if (mediaContentData instanceof Uint8Array) {
            return `data:${mimeType.toString()};base64,${ByteUtil.encodeBase64(mediaContentData)}`;
        } else if (typeof mediaContentData === 'string') {
            return mediaContentData;
        } else {
            throw new IllegalArgumentError(`Unsupported media data type: ${mediaContentData.constructor.name}`);
        }
    }

    protected mapToMediaContent(media: Media): MediaContent {
        const mimeType = media.mimeType.toString();
        if (mimeType === 'audio/mp3') {
            return MediaContent.createInputAudio(this.fromAudioData(media.data), Format.MP3));
        }
        if (mimeType === 'audio/wav') {
            return MediaContent.createInputAudio(this.fromAudioData(media.data), Format.WAV));
        } else {
            return MediaContent.createImageUrl(this.fromMediaData(media.mimeType, media.data)));
        }
    }

    protected createRequest(prompt: Prompt, stream: boolean): ChatCompletionRequest {
        const chatCompletionMessages = prompt.instructions.map(message => {
            if (message instanceof UserMessage || message instanceof SystemMessage) {
                const content = message.content;
                if (message instanceof UserMessage) {
                    if (message.media?.length > 0) {
                        const contentList = [MediaContent.createText(message.content), ...message.media.map(media => MediaContent.(media))];
                        return contentList;
                    }
                }
                return [new ChatCompletionMessage(content, Role[message.messageType])];
            } else if (message instanceof AssistantMessage) {
                const assistantMessage = message;
                let toolCalls: OpenAIToolCall[] = [];
                if (assistantMessage.toolCalls.length > 0) {
                    toolCalls = assistantMessage.toolCalls.map(toolCall => ({
                        id: toolCall.id,
                        type: 'function',
                        function: {
                            name: toolCall.name,
                            arguments: toolCall.arguments
                        }
                    }));
                }
                let audioOutput: AudioOutput | undefined;
                if (assistantMessage.media.length > 0) {
                    if (assistantMessage.media.length !== 1) {
                        throw new IllegalArgumentError('Only one media content is supported for assistant messages');
                    }
                    const media = assistantMessage.media[0];
                    audioOutput = new AudioOutput(media.id, null, null, null);
                }
                return [new ChatCompletionMessage(assistantMessage.text, Role.ASSISTANT, undefined, undefined, toolCalls, undefined, audioOutput)];
            } else if (message instanceof ToolResponseMessage) {
                message.responses.forEach(response => {
                    if (!response.id) {
                        throw new IllegalArgumentError('ToolResponseMessage must have an id');
                    }
                });
                return message.responses.map(tr => new ChatCompletionMessage(tr.responseData, Role.TOOL, tr.name, tr.id, undefined, undefined, undefined));
            } else {
                throw new IllegalArgumentError(`Unsupported message type: ${message.messageType}`);
            }
        }).flat();

        let request = new ChatCompletionRequest(chatCompletionMessages, stream);

        const enabledToolsToUse = new Set<string>();
        if (prompt.options) {
            let updatedRuntimeOptions: OpenAIChatOptions | undefined = undefined;
            if (prompt.options instanceof FunctionCallingOptions) {
                updatedRuntimeOptions = ModelOptionsUtils.copyToTarget(prompt.options, FunctionCallingOptions, OpenAIChatOptions);
            } else {
                updatedRuntimeOptions = ModelOptions
            }
        }
    }


    protected buildGeneration(choice: Choice, metadata: Record<string, any>, request: ChatCompletionRequest): Generation {
        const toolCalls = choice.message.toolCalls?.map(toolCall => ({
            id: toolCall.id ?? '',
            type: 'function',
            name: toolCall.function.name,
            arguments: JSON.stringify(toolCall.function.arguments)
        })) ?? [];

        const finishReason = choice.finishReason ?? '';
        const generationMetadata = ChatGenerationMetadata.from(finishReason);

        const media: Media[] = [];
        let textContent = choice.message.content;
        const audioOutput = choice.message.audioOutput;
        if (audioOutput) {
            const mimeType = `audio/${request.audioParameters?.format?.toLowerCase()}`;
            const audioData = ByteUtil.decodeBase64(audioOutput.data);
            media.push({
                mimeType: MimeTypeUtils.parseMimeType(mimeType),
                data: audioData,
                id: audioOutput.id
            });
            if (!textContent) {
                textContent = audioOutput.transcript;
            }
            generationMetadata.metadata.audioId = audioOutput.id;
            generationMetadata.metadata.audioExpiresAt = audioOutput.expiresAt;
        }

        const assistantMessage = new AssistantMessage(textContent, media, metadata, toolCalls);
        return {
            output: assistantMessage,
            metadata: generationMetadata
        };
    }

    protected from(result: ChatCompletion, rateLimit: RateLimit, usage: Usage): ChatResponseMetadata {
        return ChatResponseMetadata.builder()
            .id(result.id ?? '')
            .usage(usage)
            .model(result.model ?? '')
            .keyValue('created', result.created ?? 0)
            .keyValue('system-fingerprint', result.systemFingerprint ?? '')
            .rateLimit(rateLimit)
            .build();
    }

    public async call(prompt: Prompt): Promise<ChatResponse> {
        const request: ChatCompletionRequest = this.parseChatCompletionRequest(prompt, false);

        const completionEntity = await this.chatApi.chat(request);
        const chatCompletion = completionEntity.body;
        if (!chatCompletion) {
            this.logger.warn(`No chat completion returned for prompt: ${prompt}`);
            return ChatResponse.from([]);
        }

        const choices = chatCompletion.choices;
        if (!choices || choices.length === 0) {
            this.logger.warn(`No choices returned for prompt: ${prompt}`);
            return ChatResponse.from([]);
        }

        const generations = choices.map(choice => {
            const metadata = {
                id: chatCompletion.id ?? '',
                role: choice.message.role ?? '',
                index: choice.index,
                finishReason: choice.finishReason ?? '',
                refusal: choice.message.refusal ?? ''
            };
            return this.buildGeneration(choice, metadata, request);
        });

        const rateLimit = OpenAIResponseHeaderExtractor.extractAIResponseHeaders(completionEntity);
        const usage = chatCompletion.usage ?? {};

        return ChatResponse.from(generations, this.from(chatCompletion, rateLimit, usage));
    }

    async stream(prompt: Prompt): Promise<Observable<ChatResponse>> {
        const request: ChatCompletionRequest = this.parseChatCompletionRequest(prompt, true);
        const openAIResponse = await this.chatApi.streamingChat(request);
        const chatResponse = openAIResponse.pipe(
            map(chunk => {
                const content = chunk.message.content ?? '';
                const toolCalls = chunk.message.toolCalls?.map(toolCall => ({
                    id: '',
                    type: 'function',
                    name: toolCall.function.name,
                    arguments: JSON.stringify(toolCall.function.arguments)
                })) ?? [];
                const assistantMessage: AssistantMessage = new AssistantMessage(
                    content,
                    [],
                    toolCalls
                );
                let generationMetadata = ChatGenerationMetadata.EMPTY;
                if (chunk.promptEvalCount && chunk.evalCount) {
                    generationMetadata = ChatGenerationMetadata.from(chunk.doneReason);
                }
                const generator = {
                    output: assistantMessage,
                    metadata: generationMetadata
                };

                return <ChatResponse>{
                    result: generator,
                    results: [generator],
                    metadata: this.parseChatResponseMetadata(chunk)
                };
            })
        );
        return chatResponse;

    }

    /**
     * Parse OpenAI chat response into ChatResponseMetadata.
     * @param response - The OpenAI chat response
     * @returns ChatResponseMetadata containing usage and other metadata
     */
    protected parseChatResponseMetadata(response: OpenAIChatResponse): ChatResponseMetadata {

        const promptTokens = response.promptEvalCount ?? 0;
        const generationTokens = response.evalCount ?? 0;
        const totalTokens = promptTokens + generationTokens;
        return {
            id: '',
            model: response.model,
            rateLimit: ChatResponseMetadata.EMPTY.rateLimit,
            usage: {
                promptTokens,
                generationTokens,
                totalTokens
            },
            promptMetadata: ChatResponseMetadata.EMPTY.promptMetadata,
            extra: {
                'eval-count': response.evalCount,
                'load-duration': response.loadDuration,
                'prompt_eval_duration': response.promptEvalDuration,
                'prompt_eval_count': response.promptEvalCount,
                'total_duration': response.totalDuration,
                'done': response.done
            }
        };
    }

    /**
     * Generates an OpenAI chat request from a given prompt.
     * @param prompt - The prompt containing instructions and messages.
     * @param stream - Indicates whether the response should be streamed.
     * @returns An instance of OpenAIApi.ChatRequest.
     * @throws Will throw an error if the model is not set.
     */
    protected parseChatCompletionRequest(prompt: Prompt, stream: boolean): ChatCompletionRequest {
        const openAIMessages: ChatCompletionMessage[] = prompt.instructions.map(message => {
            if (message instanceof UserMessage) {
                const messageBuilder = ChatCompletionMessage.builder(Role.USER).withContent(message.content);
                if (message.media && message.media.length > 0) {
                    messageBuilder.withImages(
                        message.media.map(media => this.fromMediaData(media.data))
                    );
                }
                return [messageBuilder.build()];
            } else if (message instanceof SystemMessage) {
                return [ChatCompletionMessage.builder(Role.SYSTEM).withContent(message.content).build()];
            } else if (message instanceof AssistantMessage) {
                let toolCalls: OpenAIToolCall[] = [];
                if (message.toolCalls.length > 0) {
                    toolCalls = message.toolCalls.map(toolCall => {
                        const func = new ToolCallFunction(toolCall.name, JSON.parse(toolCall.arguments));
                        return new OpenAIToolCall(func);
                    });
                }
                return [
                    ChatCompletionMessage.builder(Role.ASSISTANT)
                        .withContent(message.content)
                        .withToolCalls(toolCalls)
                        .build()
                ];
            } else if (message instanceof ToolResponseMessage) {
                return message.responses.map(tr =>
                    ChatCompletionMessage.builder(Role.TOOL).withContent(tr.responseData).build()
                );
            }
            throw new IllegalArgumentError(`Unsupported message type: ${message.messageType}`);
        }).flat();

        const functionsForThisRequest: Set<string> = new Set();

        // Runtime options
        let runtimeOptions: OpenAIChatOptions | undefined = undefined;
        if (prompt.options) {
            runtimeOptions = Object.assign(OpenAIChatOptions.builder().build(), prompt.options);
        }

        if (this.defaultOptions.functions.size > 0) {
            this.defaultOptions.functions.forEach(func => functionsForThisRequest.add(func));
        }

        const openAIOptions: OpenAIChatOptions = runtimeOptions ?? this.defaultOptions;

        // Override the model.
        if (!openAIOptions.model) {
            throw new IllegalArgumentError('Model is not set!');
        }

        const model = openAIOptions.model;
        const requestBuilder: ChatCompletionRequestBuilder = ChatCompletionRequest.builder(model)
            .withStream(stream)
            .withMessages(openAIMessages)
            .withOptions(openAIOptions);

        if (openAIOptions.format) {
            requestBuilder.withFormat(openAIOptions.format);
        }

        if (openAIOptions.keepAlive) {
            requestBuilder.withKeepAlive(openAIOptions.keepAlive);
        }

        // Add the enabled functions definitions to the request's tools parameter.
        // if (functionsForThisRequest.size > 0) {
        //     requestBuilder.withTools(this.getFunctionTools([...functionsForThisRequest]));
        // }

        return requestBuilder.build();
    }

    /**
     * Helper method to convert media data to Base64 string format.
     * @param mediaData - The media data to convert
     * @returns Base64 encoded string 
     */
    private fromMediaData(mediaData?: Buffer): string {
        if (typeof mediaData === 'string') {
            return mediaData;
        }
        return ByteUtil.encodeBase64(mediaData);
    }

}
