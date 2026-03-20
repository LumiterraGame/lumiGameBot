export enum ChainName {
  MONAD = "Monad",
  MONAD_TESTNET = "Monad Testnet",
  MONAD_TESTNET_FORK = "Monad Testnet Fork"
}

export enum ChainId {
  MONAD_TESTNET = 10143,
  MONAD_MAINNET = 143,
  MONAD_TESTNET_FORK = 31337
}

export const DEFAULT_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || "10143"
) as ChainId;

const chainIdToChainName: Record<ChainId, ChainName> = {
  [ChainId.MONAD_MAINNET]: ChainName.MONAD,
  [ChainId.MONAD_TESTNET]: ChainName.MONAD_TESTNET,
  [ChainId.MONAD_TESTNET_FORK]: ChainName.MONAD_TESTNET_FORK
};

export const getChainName = (chainId: ChainId): ChainName => {
  return chainIdToChainName[chainId];
};

const explorers: Record<ChainId, string> = {
  [ChainId.MONAD_MAINNET]: "https://monadexplorer.com/",
  [ChainId.MONAD_TESTNET]: "https://testnet.monadexplorer.com/",
  [ChainId.MONAD_TESTNET_FORK]: "http://192.168.50.193:8545"
};

export const chainInfos = {
  [ChainId.MONAD_MAINNET]: {
    isTestnet: false,
    chainId: ChainId.MONAD_MAINNET,
    label: "Monad Mainnet",
    explorer: explorers[ChainId.MONAD_MAINNET],
    rpcUrls: ["https://monad-mainnet.g.alchemy.com/v2/g7Po4ajNgATAYLnFxvkmM"],
    wsUrls: [""],
    nativeCurrency: "MON",
    icon: "/images/monad-chain.svg"
  },
  [ChainId.MONAD_TESTNET]: {
    isTestnet: true,
    chainId: ChainId.MONAD_TESTNET,
    label: "Monad Testnet",
    explorer: explorers[ChainId.MONAD_TESTNET],
    rpcUrls: ["https://testnet-rpc.monad.xyz"],
    wsUrls: ["wss://monad-testnet.g.alchemy.com/v2/IyI-OISQ-bRNF0i7gyVew"],
    nativeCurrency: "MON",
    icon: "/images/monad-chain.svg"
  },
  [ChainId.MONAD_TESTNET_FORK]: {
    isTestnet: true,
    chainId: ChainId.MONAD_TESTNET_FORK,
    label: "Monad Testnet Fork (Local)",
    explorer: explorers[ChainId.MONAD_TESTNET_FORK],
    rpcUrls: ["http://192.168.50.193:8545"],
    wsUrls: [""],
    nativeCurrency: "MON",
    icon: "/images/monad-chain.svg"
  }
} satisfies Record<
  ChainId,
  {
    chainId: ChainId;
    label: string;
    rpcUrls: string[];
    wsUrls: string[];
    nativeCurrency: string;
    isTestnet: boolean;
    explorer: string;
    icon: string;
  }
>;

export const getIsTestnet = (chainId: ChainId) => {
  return chainInfos[chainId].isTestnet;
};

export const getChainInfo = (chainId: ChainId) => {
  return chainInfos[chainId];
};
