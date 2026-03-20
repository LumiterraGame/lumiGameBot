import { coinbaseWallet } from "wagmi/connectors";

const ICON_DATA =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAALZJREFUaEPtmjEOhDAMBNc/O14GvOzys3CAKK6eAlmaVGl2Zc+kTOU685vkc9/bnD2prZK5/TZY24z9P+g4F5hNh7/GdoG37WlAA5CATwgCxHENYISwQAMQII5rACOEBRqAAHFcAxghLNAABIjjGsAIYYEGIEAc1wBGCAs0AAHiuAYwQligAQgQxzWAEcICDUCAOK4BjBAWaAACxHENYISwQAMQII6fBjr+VHkW3+u+tfyxMpJaDgYzYxb/ALZVAAAAAElFTkSuQmCC";

export const baseAccountConnector = () => {
  const c = coinbaseWallet({
    appName: "Lumi Game Bot",
    preference: "smartWalletOnly"
  });

  return (ctx: any) => {
    const connector = c(ctx);

    return {
      ...connector,
      getProvider: () => connector.getProvider(),
      id: "base_account",
      name: "Base Account",
      icon: ICON_DATA,
      getWalletConnectDeeplink: null,
      getQrCode: () => null,
      get installed() {
        return true;
      },
      get suggested() {
        return false;
      },
      get mobileDisabled() {
        return true;
      },
      downloadUrls: {
        get download() {
          return "https://www.smartwallet.dev/";
        }
      }
    };
  };
};
