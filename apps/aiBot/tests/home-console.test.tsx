import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/pages/index";
import { WalletModalProvider } from "@/components/WalletModal/WalletModalProvider";
import { useWalletModal } from "@/components/WalletModal/useWalletModal";

const wagmiState = vi.hoisted(() => ({
  address: undefined as `0x${string}` | undefined,
  isConnected: false,
  connectors: [
    { id: "io.metamask", name: "MetaMask" },
    { id: "walletConnect", name: "WalletConnect" },
    { id: "com.okex.wallet", name: "OKX Wallet" }
  ],
  connectAsync: vi.fn(async ({ connector }: { connector: { id: string } }) => {
    if (connector.id === "io.metamask") {
      wagmiState.address = "0xabc1230000000000000000000000000000000000";
      wagmiState.isConnected = true;
    }
  }),
  disconnect: vi.fn(),
  signMessageAsync: vi.fn(async () => "0xsigned-message")
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: wagmiState.address,
    isConnected: wagmiState.isConnected
  }),
  useConnect: () => ({
    connectors: wagmiState.connectors,
    connectAsync: wagmiState.connectAsync,
    isPending: false,
    variables: undefined,
    reset: vi.fn()
  }),
  useReconnect: () => ({
    reconnect: vi.fn()
  }),
  useDisconnect: () => ({
    connectors: wagmiState.connectors,
    disconnect: wagmiState.disconnect
  }),
  useSignMessage: () => ({
    signMessageAsync: wagmiState.signMessageAsync
  })
}));

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: {
        "content-type": "application/json"
      }
    })
  );
}

function buildBot(overrides?: Partial<Record<string, unknown>>) {
  return {
    walletAddress: "0xabc1230000000000000000000000000000000000",
    botName: "Alpha Bot",
    decisionType: "balanced",
    runStatus: "stopped",
    description: "",
    createdAt: "2026-03-20T00:00:00.000Z",
    updatedAt: "2026-03-20T00:00:00.000Z",
    ...overrides
  };
}

function renderPage() {
  return render(
    <WalletModalProvider>
      <HomePage />
    </WalletModalProvider>
  );
}

describe("home console page", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    wagmiState.address = undefined;
    wagmiState.isConnected = false;
    wagmiState.connectAsync.mockClear();
    wagmiState.disconnect.mockClear();
    wagmiState.signMessageAsync.mockClear();
    window.localStorage.clear();
    useWalletModal.getState().close();
  });

  it("renders the lumiterrator-style connect modal from the top-right button", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/bots/query")) {
          return jsonResponse({ bot: null });
        }

        throw new Error(`Unexpected fetch request: ${url}`);
      })
    );

    renderPage();

    expect(await screen.findByRole("heading", { level: 1, name: /^lumi game bot$/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^connect$/i }));

    expect(await screen.findByRole("dialog", { name: /connect wallet/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /metamask/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /walletconnect/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /okx wallet/i })).toBeInTheDocument();
  });

  it("loads bot panel when wallet is connected (no auth APIs)", async () => {
    wagmiState.address = "0xabc1230000000000000000000000000000000000";
    wagmiState.isConnected = true;

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/bots/query")) {
        return jsonResponse({ bot: null });
      }

      throw new Error(`Unexpected fetch request: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /current robot/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText(/connected/i).length).toBeGreaterThan(0);
  });

  it("creates a bot from the create tab", async () => {
    wagmiState.address = "0xabc1230000000000000000000000000000000000";
    wagmiState.isConnected = true;

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/api/bots/query")) {
        return jsonResponse({ bot: null });
      }

      if (url.endsWith("/api/bots/create")) {
        expect(init?.method).toBe("POST");
        const body = JSON.parse(String(init?.body));
        expect(body.walletAddress).toBe("0xabc1230000000000000000000000000000000000");
        expect(body.botName).toBe("Miner One");
        expect(body.decisionType).toBe("balanced");
        expect(body.description).toBe("");

        return jsonResponse(
          {
            bot: buildBot({
              botName: "Miner One",
              decisionType: "balanced",
              runStatus: "stopped",
              description: ""
            })
          },
          201
        );
      }

      throw new Error(`Unexpected fetch request: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    renderPage();

    fireEvent.click(await screen.findByRole("tab", { name: /^create$/i }));
    fireEvent.change(screen.getByLabelText(/create bot name/i), { target: { value: "Miner One" } });
    fireEvent.click(screen.getByRole("button", { name: /create aibot/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /current robot/i })).toBeInTheDocument();
    });
  });

  it("loads the current bot and saves updates from the update tab", async () => {
    wagmiState.address = "0xabc1230000000000000000000000000000000000";
    wagmiState.isConnected = true;

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/api/bots/query")) {
        return jsonResponse({
          bot: buildBot()
        });
      }

      if (url.endsWith("/api/bots/update")) {
        const body = JSON.parse(String(init?.body));
        expect(body.walletAddress).toBe("0xabc1230000000000000000000000000000000000");
        expect(body.botName).toBe("Alpha Bot");
        expect(body.decisionType).toBe("balanced");
        expect(body.runStatus).toBe("stopped");
        expect(body.description).toBe("");

        return jsonResponse({
          bot: buildBot({
            description: "",
            updatedAt: "2026-03-21T00:00:00.000Z"
          })
        });
      }

      throw new Error(`Unexpected fetch request: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    renderPage();

    expect(await screen.findByText(/alpha bot/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /^update$/i }));
    fireEvent.click(screen.getByRole("button", { name: /update aibot/i }));

    await waitFor(() => {
      const hitUpdate = fetchMock.mock.calls.some((c) => String(c[0]).includes("/api/bots/update"));
      expect(hitUpdate).toBe(true);
    });
  });
});
