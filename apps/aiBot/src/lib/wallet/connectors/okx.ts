import { injected } from "wagmi/connectors";

const ICON_PATH = "/wallet-modal/okx-wallet.svg";

export const okxConnector = () => {
  const c = injected({
    target: {
      id: "com.okex.wallet",
      name: "OKX Wallet Injected",
      // @ts-ignore browser injected wallet
      provider: () => window?.okxwallet
    },
    // @ts-ignore
    shimDisconnect: true
  });

  return (ctx: any) => {
    const connector = c(ctx);

    return {
      ...connector,
      id: "com.okex.wallet",
      name: "OKX Wallet",
      icon: ICON_PATH,
      getWalletConnectDeeplink: null,
      getProvider: () => connector.getProvider(),
      getQrCode: () => null,
      // @ts-ignore
      isAuthorized: async () => {
        if (typeof window !== "undefined" && !(window as any).okxwallet) {
          return false;
        }
        return connector.isAuthorized();
      },
      async disconnect() {
        await (window as any).okxwallet?.disconnect?.();
        ctx.emitter.emit("disconnect");
      },
      get installed() {
        return typeof window !== "undefined" && !!(window as any).okxwallet;
      },
      get suggested() {
        return false;
      },
      extension: {
        instructions: {
          learnMoreUrl: "https://www.okx.com/web3",
          steps: []
        }
      },
      downloadUrls: {
        get download() {
          if (typeof window === "undefined") return "https://www.okx.com/download";
          const isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
          if (isMobile) {
            const dappURL = window.location.href;
            const deeplink = `okx://wallet/dapp/url?dappUrl=${encodeURIComponent(dappURL)}`;
            return `https://www.okx.com/download?deeplink=${encodeURIComponent(deeplink)}`;
          }
          return "https://www.okx.com/download";
        }
      }
    };
  };
};
