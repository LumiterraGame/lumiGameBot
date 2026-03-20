import { injected } from "wagmi/connectors";
import { DEFAULT_CHAIN_ID } from "../chain";

const ICON_URL = "https://bin.bnbstatic.com/static/images/common/favicon.ico";

function getDeepLink(url: string, chainId = 1) {
  const base = "bnc://app.binance.com/mp/app";
  const appId = "yFK5FCqYprrXDiVFbhyRx7";
  const startPagePath = window.btoa("/pages/browser/index");
  const startPageQuery = window.btoa(`url=${url}&defaultChainId=${chainId}`);
  const deeplink = `${base}?appId=${appId}&startPagePath=${startPagePath}&startPageQuery=${startPageQuery}`;
  const dp = window.btoa(deeplink);
  return `https://app.binance.com/en/download?_dp=${dp}`;
}

export const binanceConnector = () => {
  const c = injected({
    target: {
      id: "com.binance.wallet",
      name: "Binance Wallet Injected",
      // @ts-ignore browser injected wallet
      provider: () => window?.binancew3w?.ethereum
    },
    // @ts-ignore
    shimDisconnect: true
  });

  return (ctx: any) => {
    const connector = c(ctx);

    return {
      ...connector,
      getProvider: () => connector.getProvider(),
      id: "com.binance.wallet",
      name: "Binance Wallet",
      icon: ICON_URL,
      getWalletConnectDeeplink: null,
      getQrCode: () => null,
      // @ts-ignore
      isAuthorized: async () => {
        if (typeof window !== "undefined" && !(window as any).binancew3w) {
          return false;
        }
        return connector.isAuthorized();
      },
      get installed() {
        return typeof window !== "undefined" && !!(window as any).binancew3w;
      },
      get mobileDisabled() {
        return true;
      },
      get suggested() {
        return false;
      },
      extension: {
        instructions: {
          learnMoreUrl: "https://www.binance.com/en/web3wallet",
          steps: []
        }
      },
      downloadUrls: {
        get download() {
          if (typeof window === "undefined") return "https://www.binance.com/en/web3wallet";
          const isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
          if (isMobile) {
            return getDeepLink(window.location.href, DEFAULT_CHAIN_ID);
          }
          return "https://www.binance.com/en/web3wallet";
        }
      }
    };
  };
};
