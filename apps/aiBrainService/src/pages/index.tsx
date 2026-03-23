import { useState } from "react";

interface ResponseData {
  model: string;
  responseId: string;
  outputText: string;
}

interface ErrorPayload {
  error?: string;
  code?: string;
  details?: {
    requestId?: string;
    type?: string;
    param?: string | null;
  };
}

const modelOptions = [
  { label: "GPT-5.4", value: "gpt-5.4" },
  { label: "GPT-5.2", value: "gpt-5.2" },
  { label: "GPT-5", value: "gpt-5" },
  { label: "GPT-5 mini", value: "gpt-5-mini" },
  { label: "Custom", value: "__custom__" }
] as const;

export default function HomePage() {
  const [selectedModel, setSelectedModel] = useState("gpt-5.4");
  const [customModel, setCustomModel] = useState("");
  const [input, setInput] = useState("Say hello from GPT-5.4.");
  const [systemPrompt, setSystemPrompt] = useState("You are the AI Brain Service for Lumi Game Bot.");
  const [result, setResult] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestModel = selectedModel === "__custom__" ? customModel.trim() : selectedModel;

      const response = await fetch("/api/brain/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: requestModel || undefined,
          input,
          systemPrompt
        })
      });

      const payload = (await response.json()) as ErrorPayload & { data?: ResponseData };
      if (!response.ok) {
        throw new Error(formatErrorMessage(response.status, payload));
      }

      if (!payload.data) {
        throw new Error("Response data is missing.");
      }

      setResult(payload.data);
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : "Unknown request error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        background: "#0d1117",
        color: "#f5f7fa"
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          display: "grid",
          gap: 24
        }}
      >
        <section>
          <h1 style={{ margin: 0, fontSize: 42 }}>AI Brain Service</h1>
          <p style={{ marginTop: 12, color: "#a7b2c3", lineHeight: 1.6 }}>
            Minimal GPT integration for Postman and browser testing. The main HTTP endpoint is
            <code style={{ marginLeft: 8 }}>/api/brain/respond</code>.
          </p>
        </section>

        <section
          style={{
            border: "1px solid #1f2937",
            borderRadius: 18,
            padding: 24,
            background: "#111827"
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Model</span>
              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #374151",
                  background: "#0b1220",
                  color: "#f5f7fa"
                }}
              >
                {modelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {selectedModel === "__custom__" ? (
              <label style={{ display: "grid", gap: 8 }}>
                <span>Custom Model ID</span>
                <input
                  value={customModel}
                  onChange={(event) => setCustomModel(event.target.value)}
                  placeholder="Enter a model id, for example gpt-5.4"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #374151",
                    background: "#0b1220",
                    color: "#f5f7fa"
                  }}
                />
              </label>
            ) : null}

            <label style={{ display: "grid", gap: 8 }}>
              <span>System Prompt</span>
              <textarea
                value={systemPrompt}
                onChange={(event) => setSystemPrompt(event.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #374151",
                  background: "#0b1220",
                  color: "#f5f7fa"
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span>Input</span>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={6}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #374151",
                  background: "#0b1220",
                  color: "#f5f7fa"
                }}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: 180,
                height: 48,
                border: 0,
                borderRadius: 999,
                background: loading ? "#9ca3af" : "#f8c22b",
                color: "#0f172a",
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Calling GPT..." : "Send Request"}
            </button>
          </form>
        </section>

        <section
          style={{
            border: "1px solid #1f2937",
            borderRadius: 18,
            padding: 24,
            background: "#111827"
          }}
        >
          <h2 style={{ marginTop: 0 }}>Response</h2>
          {error ? (
            <pre style={{ whiteSpace: "pre-wrap", color: "#fca5a5" }}>{error}</pre>
          ) : result ? (
            <pre style={{ whiteSpace: "pre-wrap", color: "#d1d5db" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p style={{ color: "#9ca3af" }}>No response yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function formatErrorMessage(statusCode: number, payload: ErrorPayload) {
  const requestId = payload.details?.requestId ? ` Request ID: ${payload.details.requestId}.` : "";

  if (statusCode === 429) {
    return `OpenAI quota exceeded for the current project. Check billing, usage limits, or replace the API key with one from a funded project.${requestId}`;
  }

  if (statusCode === 401 || statusCode === 403) {
    return `OpenAI authentication failed. Check whether OPENAI_API_KEY is valid and whether the current project can use the selected model.${requestId}`;
  }

  if (statusCode === 400) {
    return payload.error ?? "Invalid request body.";
  }

  if (statusCode >= 500) {
    return `OpenAI upstream request failed.${requestId}`;
  }

  return payload.error ?? "Request failed.";
}
