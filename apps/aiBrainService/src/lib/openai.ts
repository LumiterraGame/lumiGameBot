import OpenAI from "openai";
import { getEnv } from "@/lib/env";
import { BadRequestError, UpstreamServiceError } from "@/lib/http-errors";

export interface GenerateBrainTextInput {
  model?: string;
  input: string;
  systemPrompt?: string;
  maxOutputTokens?: number;
}

export interface GenerateBrainTextResult {
  requestModel: string;
  responseId: string;
  outputText: string;
}

let cachedClient: OpenAI | null = null;

function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const env = getEnv();
  cachedClient = new OpenAI({
    apiKey: env.OPENAI_API_KEY
  });
  return cachedClient;
}

export async function generateBrainText(input: GenerateBrainTextInput): Promise<GenerateBrainTextResult> {
  const env = getEnv();
  const client = getClient();
  const requestModel = input.model ?? env.OPENAI_MODEL;

  let response: Awaited<ReturnType<typeof client.responses.create>>;

  try {
    response = await client.responses.create({
      model: requestModel,
      instructions: input.systemPrompt,
      input: input.input,
      max_output_tokens: input.maxOutputTokens ?? env.OPENAI_MAX_OUTPUT_TOKENS
    });
  } catch (error) {
    throw mapOpenAIError(error);
  }

  const outputText = response.output_text?.trim() ?? "";

  if (!outputText) {
    throw new BadRequestError("The model returned an empty response");
  }

  return {
    requestModel,
    responseId: response.id,
    outputText
  };
}

function mapOpenAIError(error: unknown): UpstreamServiceError {
  if (error instanceof OpenAI.APIError) {
    const details = {
      type: error.type ?? undefined,
      param: error.param ?? undefined,
      requestId: error.requestID ?? undefined
    };

    if (error.status === 400) {
      return new UpstreamServiceError(400, error.message, {
        code: error.code ?? "openai_bad_request",
        details
      });
    }

    if (error.status === 401 || error.status === 403) {
      return new UpstreamServiceError(error.status, "OpenAI authentication failed", {
        code: error.code ?? "openai_auth_error",
        details
      });
    }

    if (error.status === 429) {
      return new UpstreamServiceError(429, error.message, {
        code: error.code ?? "openai_rate_limited",
        details
      });
    }

    if (error.status >= 500) {
      return new UpstreamServiceError(502, "OpenAI upstream service error", {
        code: error.code ?? "openai_upstream_error",
        details
      });
    }

    return new UpstreamServiceError(error.status, error.message, {
      code: error.code ?? "openai_api_error",
      details
    });
  }

  return new UpstreamServiceError(500, "Unknown OpenAI request failure", {
    code: "openai_unknown_error"
  });
}
