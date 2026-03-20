import { type HttpTransportConfig } from "viem";
import { createConfig, http } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { chains } from "./chains";
import { bitgetConnector } from "./connectors/bitget";
import { metamaskConnector } from "./connectors/metamask";
import { okxConnector } from "./connectors/okx";
import { binanceConnector } from "./connectors/binance";
import { baseAccountConnector } from "./connectors/baseAccount";
import { coinbaseConnector } from "./connectors/coinbase";
import { ChainId } from "./chain";

const commonHttpParams = [
  undefined,
  {
    batch: false,
    timeout: 120_000
  } satisfies HttpTransportConfig
] as const;

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "5a786faa6e2f1684bbb29052f91af6ef";

export const config = createConfig({
  chains,
  connectors: [
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: false,
      metadata: {
        name: "Lumi Game Bot",
        description: "Lumi Game Bot",
        url: "https://lumiterra.net",
        icons: ["https://lumiterra.net/logo.png"]
      }
    }),
    bitgetConnector(),
    metamaskConnector(),
    okxConnector(),
    binanceConnector(),
    baseAccountConnector(),
    coinbaseConnector()
  ],
  ssr: true,
  batch: {
    multicall: false
  },
  transports: {
    [ChainId.MONAD_MAINNET]: http(...commonHttpParams),
    [ChainId.MONAD_TESTNET]: http(...commonHttpParams),
    [ChainId.MONAD_TESTNET_FORK]: http(...commonHttpParams),
    [1]: http(...commonHttpParams)
  }
});
