export interface BrainHealthResponse {
  ok: true;
  service: "ai-brain-service";
}

export interface GenerateBrainResponseRequest {
  model?: string;
  input: string;
  systemPrompt?: string;
  maxOutputTokens?: number;
}

export interface GenerateBrainResponseData {
  model: string;
  responseId: string;
  outputText: string;
}

export interface GenerateBrainResponse {
  data: GenerateBrainResponseData;
}
