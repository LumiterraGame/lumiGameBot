import { injected } from "wagmi/connectors";

const ICON_DATA =
  "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMTAyNCAxMDI0JyBmaWxsPSdub25lJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHN0eWxlPSdoZWlnaHQ6MjhweDt3aWR0aDoyOHB4Jz48cmVjdCB3aWR0aD0nMTAyNCcgaGVpZ2h0PScxMDI0JyBmaWxsPScjMDA1MkZGJyByeD0nMTAwJyByeT0nMTAwJz48L3JlY3Q+PHBhdGggZmlsbC1ydWxlPSdldmVub2RkJyBjbGlwLXJ1bGU9J2V2ZW5vZGQnIGQ9J00xNTIgNTEyQzE1MiA3MTAuODIzIDMxMy4xNzcgODcyIDUxMiA4NzJDNzEwLjgyMyA4NzIgODcyIDcxMC44MjMgODcyIDUxMkM4NzIgMzEzLjE3NyA3MTAuODIzIDE1MiA1MTIgMTUyQzMxMy4xNzcgMTUyIDE1MiAzMTMuMTc3IDE1MiA1MTJaTTQyMCAzOTZDNDA2Ljc0NSAzOTYgMzk2IDQwNi43NDUgMzk2IDQyMFY2MDRDMzk2IDYxNy4yNTUgNDA2Ljc0NSA2MjggNDIwIDYyOEg2MDRDNjE3LjI1NSA2MjggNjI4IDYxNy4yNTUgNjI4IDYwNFY0MjBDNjI4IDQwNi43NDUgNjE3LjI1NSAzOTYgNjA0IDM5Nkg0MjBaJyBmaWxsPSd3aGl0ZSc+PC9wYXRoPjwvc3ZnPg==";

export const coinbaseConnector = () => {
  const c = injected({
    target: "coinbaseWallet",
    // @ts-ignore
    shimDisconnect: true
  });

  return (ctx: any) => {
    const connector = c(ctx);

    return {
      ...connector,
      getProvider: () => connector.getProvider(),
      id: "coinbase_wallet",
      name: "Coinbase Wallet",
      icon: ICON_DATA,
      getWalletConnectDeeplink: null,
      getQrCode: () => null,
      // @ts-ignore
      isAuthorized: async () => {
        if (typeof window !== "undefined" && !(window as any).coinbaseWalletExtension) {
          return false;
        }
        return connector.isAuthorized();
      },
      get installed() {
        return typeof window !== "undefined" && !!(window as any).coinbaseWalletExtension;
      },
      get suggested() {
        return false;
      },
      get mobileDisabled() {
        return true;
      },
      extension: {
        instructions: {
          learnMoreUrl: "https://www.coinbase.com/wallet",
          steps: []
        }
      },
      downloadUrls: {
        get download() {
          if (typeof window === "undefined") return "https://www.coinbase.com/wallet";
          const isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
          if (isMobile) {
            const dappURL = window.location.href;
            return `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(dappURL)}`;
          }
          return "https://www.coinbase.com/wallet";
        }
      }
    };
  };
};
