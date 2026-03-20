import { injected } from "wagmi/connectors";

const ICON_PATH = "/wallet-modal/metamask.svg";

export const metamaskConnector = () => {
  const c = injected({
    target: {
      id: "io.metamask",
      name: "MetaMask",
      // @ts-ignore browser injected wallet
      provider: () => window?.ethereum
    },
    // @ts-ignore
    shimDisconnect: true
  });

  return (ctx: any) => {
    const connector = c(ctx);

    return {
      ...connector,
      getProvider: () => connector.getProvider(),
      id: "io.metamask",
      name: "MetaMask",
      icon: ICON_PATH,
      getWalletConnectDeeplink: null,
      getQrCode: () => null,
      // @ts-ignore
      isAuthorized: async () => {
        if (typeof window !== "undefined" && !(window as any).ethereum?.isMetaMask) {
          return false;
        }
        return connector.isAuthorized();
      },
      get installed() {
        return typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask;
      },
      get suggested() {
        return true;
      },
      extension: {
        instructions: {
          learnMoreUrl: "https://metamask.io/download/",
          steps: []
        }
      },
      downloadUrls: {
        get download() {
          if (typeof window === "undefined") return "https://metamask.io/download/";
          const isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
          if (isMobile) {
            const dappURL = window.location.href.replaceAll("https://", "");
            return `https://metamask.app.link/dapp/${dappURL}`;
          }
          return "https://metamask.io/download/";
        }
      }
    };
  };
};
