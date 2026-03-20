import { injected } from "wagmi/connectors";

const ICON_PATH = "/wallet-modal/bitget-wallet.svg";

export const bitgetConnector = () => {
  const c = injected({
    target: {
      id: "com.bitget.web3",
      name: "Bitget Wallet Injected",
      // @ts-ignore browser injected wallet
      provider: () => window?.bitkeep?.ethereum
    },
    // @ts-ignore
    shimDisconnect: true
  });

  return (ctx: any) => {
    const connector = c(ctx);

    return {
      ...connector,
      getProvider: () => connector.getProvider(),
      id: "com.bitget.web3",
      name: "Bitget Wallet",
      icon: ICON_PATH,
      getWalletConnectDeeplink: null,
      // @ts-ignore
      isAuthorized: async () => {
        if (typeof window !== "undefined" && !(window as any).bitkeep) {
          return false;
        }
        return connector.isAuthorized();
      },
      get suggested() {
        return true;
      },
      get installed() {
        return typeof window !== "undefined" && !!(window as any).bitkeep;
      },
      extension: {
        instructions: {
          learnMoreUrl: "https://web3.bitget.com/en/wallet-download?type=1",
          steps: []
        }
      },
      downloadUrls: {
        get download() {
          if (typeof window === "undefined")
            return "https://web3.bitget.com/en/wallet-download?type=1";
          const isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
          if (isMobile) {
            const dappURL = window.location.href;
            return `https://bkcode.vip?action=dapp&_nobar&_needChain=monad&url=${encodeURIComponent(dappURL)}`;
          }
          return "https://web3.bitget.com/en/wallet-download?type=1";
        }
      }
    };
  };
};
