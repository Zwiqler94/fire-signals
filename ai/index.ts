import {
  getAI as _getAI,
  getGenerativeModel as _getGenerativeModel,
  getImagenModel as _getImagenModel,
  getLiveGenerativeModel as _getLiveGenerativeModel,
  getTemplateGenerativeModel as _getTemplateGenerativeModel,
  getTemplateImagenModel as _getTemplateImagenModel,
  startAudioConversation as _startAudioConversation,
} from 'firebase/ai';
import {FireSignal, FireSignalOptions} from '../core';
import {
  fromAsyncIterableSignal,
  fromAsyncSignal,
  fromSyncSignal,
} from '../signal-helpers';

type AI = import('firebase/ai').AI;
type AIOptions = import('firebase/ai').AIOptions;
type AudioConversationController = import('firebase/ai').AudioConversationController;
type CountTokensResponse = import('firebase/ai').CountTokensResponse;
type FirebaseApp = import('firebase/app').FirebaseApp;
type GenerateContentResult = import('firebase/ai').GenerateContentResult;
type GenerateContentStreamResult = import('firebase/ai').GenerateContentStreamResult;
type GenerativeContentBlob = import('firebase/ai').GenerativeContentBlob;
type GenerativeModel = import('firebase/ai').GenerativeModel;
type ImagenGenerationResponse<T extends ImagenInlineImage> = import('firebase/ai').ImagenGenerationResponse<T>;
type ImagenInlineImage = import('firebase/ai').ImagenInlineImage;
type ImagenModel = import('firebase/ai').ImagenModel;
type LiveGenerativeModel = import('firebase/ai').LiveGenerativeModel;
type LiveServerContent = import('firebase/ai').LiveServerContent;
type LiveServerGoingAwayNotice = import('firebase/ai').LiveServerGoingAwayNotice;
type LiveServerToolCall = import('firebase/ai').LiveServerToolCall;
type LiveServerToolCallCancellation = import('firebase/ai').LiveServerToolCallCancellation;
type LiveSession = import('firebase/ai').LiveSession;
type LiveSessionResumptionUpdate = import('firebase/ai').LiveSessionResumptionUpdate;
type TemplateChatSession = import('firebase/ai').TemplateChatSession;
type TemplateGenerativeModel = import('firebase/ai').TemplateGenerativeModel;
type TemplateImagenModel = import('firebase/ai').TemplateImagenModel;

type LiveSessionResponse =
  LiveServerContent |
  LiveServerToolCall |
  LiveServerToolCallCancellation |
  LiveServerGoingAwayNotice |
  LiveSessionResumptionUpdate;

export function getAISignal(
    app?: FirebaseApp,
    options?: AIOptions,
    signalOptions: FireSignalOptions<AI> = {},
): FireSignal<AI> {
  return fromSyncSignal(() => _getAI(app, options), signalOptions);
}

export function getGenerativeModelSignal(
    ai: AI,
    modelParams: Parameters<typeof _getGenerativeModel>[1],
    requestOptions?: Parameters<typeof _getGenerativeModel>[2],
    signalOptions: FireSignalOptions<GenerativeModel> = {},
): FireSignal<GenerativeModel> {
  return fromSyncSignal(() => _getGenerativeModel(ai, modelParams, requestOptions), signalOptions);
}

export function getImagenModelSignal(
    ai: AI,
    modelParams: Parameters<typeof _getImagenModel>[1],
    requestOptions?: Parameters<typeof _getImagenModel>[2],
    signalOptions: FireSignalOptions<ImagenModel> = {},
): FireSignal<ImagenModel> {
  return fromSyncSignal(() => _getImagenModel(ai, modelParams, requestOptions), signalOptions);
}

export function getLiveGenerativeModelSignal(
    ai: AI,
    modelParams: Parameters<typeof _getLiveGenerativeModel>[1],
    options: FireSignalOptions<LiveGenerativeModel> = {},
): FireSignal<LiveGenerativeModel> {
  return fromSyncSignal(() => _getLiveGenerativeModel(ai, modelParams), options);
}

export function getTemplateGenerativeModelSignal(
    ai: AI,
    requestOptions?: Parameters<typeof _getTemplateGenerativeModel>[1],
    signalOptions: FireSignalOptions<TemplateGenerativeModel> = {},
): FireSignal<TemplateGenerativeModel> {
  return fromSyncSignal(() => _getTemplateGenerativeModel(ai, requestOptions), signalOptions);
}

export function getTemplateImagenModelSignal(
    ai: AI,
    requestOptions?: Parameters<typeof _getTemplateImagenModel>[1],
    signalOptions: FireSignalOptions<TemplateImagenModel> = {},
): FireSignal<TemplateImagenModel> {
  return fromSyncSignal(() => _getTemplateImagenModel(ai, requestOptions), signalOptions);
}

export function initializeDeviceModelSignal(
    model: GenerativeModel,
    onDownloadProgress?: Parameters<GenerativeModel['initializeDeviceModel']>[0],
    signalOptions: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => model.initializeDeviceModel(onDownloadProgress), signalOptions);
}

export function generateContentSignal(
    model: GenerativeModel,
    request: Parameters<GenerativeModel['generateContent']>[0],
    requestOptions?: Parameters<GenerativeModel['generateContent']>[1],
    signalOptions: FireSignalOptions<GenerateContentResult> = {},
): FireSignal<GenerateContentResult> {
  return fromAsyncSignal(() => model.generateContent(request, requestOptions), signalOptions);
}

export function generateContentStreamSignal(
    model: GenerativeModel,
    request: Parameters<GenerativeModel['generateContentStream']>[0],
    requestOptions?: Parameters<GenerativeModel['generateContentStream']>[1],
    signalOptions: FireSignalOptions<GenerateContentStreamResult> = {},
): FireSignal<GenerateContentStreamResult> {
  return fromAsyncSignal(() => model.generateContentStream(request, requestOptions), signalOptions);
}

export function startChatSignal(
    model: GenerativeModel,
    startChatParams?: Parameters<GenerativeModel['startChat']>[0],
    signalOptions: FireSignalOptions<ReturnType<GenerativeModel['startChat']>> = {},
): FireSignal<ReturnType<GenerativeModel['startChat']>> {
  return fromSyncSignal(() => model.startChat(startChatParams), signalOptions);
}

export function countTokensSignal(
    model: GenerativeModel,
    request: Parameters<GenerativeModel['countTokens']>[0],
    requestOptions?: Parameters<GenerativeModel['countTokens']>[1],
    signalOptions: FireSignalOptions<CountTokensResponse> = {},
): FireSignal<CountTokensResponse> {
  return fromAsyncSignal(() => model.countTokens(request, requestOptions), signalOptions);
}

export function generateImagesSignal(
    model: ImagenModel,
    prompt: Parameters<ImagenModel['generateImages']>[0],
    requestOptions?: Parameters<ImagenModel['generateImages']>[1],
    signalOptions: FireSignalOptions<ImagenGenerationResponse<ImagenInlineImage>> = {},
): FireSignal<ImagenGenerationResponse<ImagenInlineImage>> {
  return fromAsyncSignal(() => model.generateImages(prompt, requestOptions), signalOptions);
}

export function connectLiveSessionSignal(
    model: LiveGenerativeModel,
    sessionResumption?: Parameters<LiveGenerativeModel['connect']>[0],
    signalOptions: FireSignalOptions<LiveSession> = {},
): FireSignal<LiveSession> {
  return fromAsyncSignal(() => model.connect(sessionResumption), signalOptions);
}

export function sendSignal(
    session: LiveSession,
    request: Parameters<LiveSession['send']>[0],
    turnComplete?: Parameters<LiveSession['send']>[1],
    signalOptions: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => session.send(request, turnComplete), signalOptions);
}

export function sendTextRealtimeSignal(
    session: LiveSession,
    text: Parameters<LiveSession['sendTextRealtime']>[0],
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => session.sendTextRealtime(text), options);
}

export function sendAudioRealtimeSignal(
    session: LiveSession,
    blob: GenerativeContentBlob,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => session.sendAudioRealtime(blob), options);
}

export function sendVideoRealtimeSignal(
    session: LiveSession,
    blob: GenerativeContentBlob,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => session.sendVideoRealtime(blob), options);
}

export function sendFunctionResponsesSignal(
    session: LiveSession,
    functionResponses: Parameters<LiveSession['sendFunctionResponses']>[0],
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => session.sendFunctionResponses(functionResponses), options);
}

export function receiveSignal(
    session: LiveSession,
    options: FireSignalOptions<LiveSessionResponse> = {},
): FireSignal<LiveSessionResponse> {
  return fromAsyncIterableSignal(() => session.receive(), options);
}

export function closeLiveSessionSignal(
    session: LiveSession,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => session.close(), options);
}

export function sendMediaChunksSignal(
    session: LiveSession,
    mediaChunks: Parameters<LiveSession['sendMediaChunks']>[0],
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => session.sendMediaChunks(mediaChunks), options);
}

export function sendMediaStreamSignal(
    session: LiveSession,
    mediaChunkStream: Parameters<LiveSession['sendMediaStream']>[0],
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => session.sendMediaStream(mediaChunkStream), options);
}

export function startAudioConversationSignal(
    liveSession: Parameters<typeof _startAudioConversation>[0],
    options?: Parameters<typeof _startAudioConversation>[1],
    signalOptions: FireSignalOptions<AudioConversationController> = {},
): FireSignal<AudioConversationController> {
  return fromAsyncSignal(() => _startAudioConversation(liveSession, options), signalOptions);
}

export function generateTemplateContentSignal(
    model: TemplateGenerativeModel,
    templateId: Parameters<TemplateGenerativeModel['generateContent']>[0],
    templateVariables: Parameters<TemplateGenerativeModel['generateContent']>[1],
    requestOptions?: Parameters<TemplateGenerativeModel['generateContent']>[2],
    templateToolConfig?: Parameters<TemplateGenerativeModel['generateContent']>[3],
    signalOptions: FireSignalOptions<GenerateContentResult> = {},
): FireSignal<GenerateContentResult> {
  return fromAsyncSignal(
      () => model.generateContent(templateId, templateVariables, requestOptions, templateToolConfig),
      signalOptions,
  );
}

export function generateTemplateContentStreamSignal(
    model: TemplateGenerativeModel,
    templateId: Parameters<TemplateGenerativeModel['generateContentStream']>[0],
    templateVariables: Parameters<TemplateGenerativeModel['generateContentStream']>[1],
    requestOptions?: Parameters<TemplateGenerativeModel['generateContentStream']>[2],
    templateToolConfig?: Parameters<TemplateGenerativeModel['generateContentStream']>[3],
    signalOptions: FireSignalOptions<GenerateContentStreamResult> = {},
): FireSignal<GenerateContentStreamResult> {
  return fromAsyncSignal(
      () => model.generateContentStream(templateId, templateVariables, requestOptions, templateToolConfig),
      signalOptions,
  );
}

export function startTemplateChatSignal(
    model: TemplateGenerativeModel,
    params: Parameters<TemplateGenerativeModel['startChat']>[0],
    options: FireSignalOptions<TemplateChatSession> = {},
): FireSignal<TemplateChatSession> {
  return fromSyncSignal(() => model.startChat(params), options);
}

export function generateTemplateImagesSignal(
    model: TemplateImagenModel,
    templateId: Parameters<TemplateImagenModel['generateImages']>[0],
    templateVariables: Parameters<TemplateImagenModel['generateImages']>[1],
    requestOptions?: Parameters<TemplateImagenModel['generateImages']>[2],
    signalOptions: FireSignalOptions<ImagenGenerationResponse<ImagenInlineImage>> = {},
): FireSignal<ImagenGenerationResponse<ImagenInlineImage>> {
  return fromAsyncSignal(
      () => model.generateImages(templateId, templateVariables, requestOptions),
      signalOptions,
  );
}
