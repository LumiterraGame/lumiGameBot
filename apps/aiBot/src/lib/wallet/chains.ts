import { defineChain } from "viem";
import { mainnet } from "viem/chains";
import { ChainId, DEFAULT_CHAIN_ID, chainInfos } from "@/lib/wallet/chain";

function createChain(chainId: ChainId, nativeName: string, explorerName: string) {
  const info = chainInfos[chainId];

  return defineChain({
    id: chainId,
    name: info.label,
    nativeCurrency: {
      name: nativeName,
      symbol: info.nativeCurrency,
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: [...info.rpcUrls],
        webSocket: [...info.wsUrls]
      }
    },
    blockExplorers: {
      default: {
        name: explorerName,
        url: info.explorer
      }
    },
    contracts: {},
    testnet: info.isTestnet
  });
}

export const monadTestnet = createChain(ChainId.MONAD_TESTNET, "MON", "Monad Testnet Explorer");
export const monadMainnet = createChain(ChainId.MONAD_MAINNET, "MON", "Monad Explorer");
export const monadTestnetFork = createChain(ChainId.MONAD_TESTNET_FORK, "MON", "Local RPC");

export const chains =
  DEFAULT_CHAIN_ID === ChainId.MONAD_MAINNET
    ? ([monadMainnet, monadTestnet, monadTestnetFork, mainnet] as const)
    : DEFAULT_CHAIN_ID === ChainId.MONAD_TESTNET_FORK
      ? ([monadTestnetFork, monadTestnet, monadMainnet, mainnet] as const)
      : ([monadTestnet, monadMainnet, monadTestnetFork, mainnet] as const);
