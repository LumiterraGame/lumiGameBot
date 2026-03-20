import React, { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { useAccount, useConnect, useDisconnect, useReconnect } from "wagmi";
import { DEFAULT_CHAIN_ID } from "@/lib/wallet/chain";
import { useWalletModal } from "@/components/WalletModal/useWalletModal";

function isMobileBrowser() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
}

function openURL(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

const WALLET_CONNECT_ICON = "/wallet-modal/wallet-connect.svg";

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const { isOpen, close, open } = useWalletModal();
  const { connectors, connectAsync, isPending, variables, reset } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect, connectors: disconnectConnectors } = useDisconnect();
  const disconnectWallet = useCallback(async () => {
    for (const connector of disconnectConnectors) {
      try {
        disconnect({ connector });
      } catch (error) {
        console.error("Failed to disconnect wallet connector", error);
      }
    }
  }, [disconnect, disconnectConnectors]);
  const [showMore, setShowMore] = useState(false);
  const { reconnect } = useReconnect();
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [lastUsedId, setLastUsedId] = useState<string | null>(null);
  const mobile = isMobileBrowser();

  useEffect(() => {
    if (isConnected) {
      close();
    }
  }, [isConnected, close]);

  useEffect(() => {
    if (!isOpen) {
      setShowMore(false);
      setQrCodeUri(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setLastUsedId(window.localStorage.getItem("lastUsedConnectorId"));
    }
  }, [isOpen]);

  const closeModal = () => {
    reset();
    close();
  };

  const handleConnect = async (connector: any) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lastUsedConnectorId", connector.id);
      setLastUsedId(connector.id);
    }

    const isInstalled = connector.installed !== false;

    if (!isInstalled && connector.downloadUrls?.download) {
      openURL(connector.downloadUrls.download);
      return;
    }

    if (connector.id === "walletConnect") {
      try {
        const provider: any = await connector.getProvider();
        provider.on("display_uri", (uri: string) => {
          setQrCodeUri(uri);
          if (mobile) {
            openURL(uri);
          }
        });
      } catch (err) {
        console.error("Failed to setup WalletConnect provider", err);
      }
    }

    try {
      await connectAsync({ connector, chainId: DEFAULT_CHAIN_ID });
    } catch (err) {
      try {
        await connectAsync({ connector, chainId: DEFAULT_CHAIN_ID });
      } catch {
        // ignore fallthrough
      }
      console.error("Connection failed", err);
    }
  };

  const { mainConnectors, moreConnectors } = useMemo(() => {
    let all = connectors.filter((c: any) => {
      if (c.disabled) return false;
      if (mobile && c.mobileDisabled) return false;
      return true;
    });

    const seenIds = new Set<string>();
    all = all.filter((c) => {
      if (seenIds.has(c.id)) return false;
      seenIds.add(c.id);
      return true;
    });

    const isInstalled = (c: any) => c.installed !== false;
    const isSuggested = (c: any) => c.suggested === true;

    all = [...all].sort((a: any, b: any) => {
      if (lastUsedId) {
        if (a.id === lastUsedId) return -1;
        if (b.id === lastUsedId) return 1;
      }
      const aI = isInstalled(a);
      const bI = isInstalled(b);
      const aS = isSuggested(a);
      const bS = isSuggested(b);
      if (aI && !bI) return -1;
      if (!aI && bI) return 1;
      if (aS && !bS) return -1;
      if (!aS && bS) return 1;
      return 0;
    });

    const limit = 4;
    if (all.length <= limit) {
      return { mainConnectors: all, moreConnectors: [] as typeof all };
    }
    return {
      mainConnectors: all.slice(0, limit),
      moreConnectors: all.slice(limit)
    };
  }, [connectors, lastUsedId, mobile]);

  const pendingConnector = variables?.connector;
  const activeLoadingConnector = isPending && pendingConnector ? pendingConnector : null;
  const isLoading = !!activeLoadingConnector;

  const notDesktopInstalled = (c: any) =>
    !isPending && c.installed === false && typeof window !== "undefined" && !mobile;

  return (
    <>
      {children}
      {!isOpen ? null : (
        <div
          role="dialog"
          aria-label="Connect Wallet"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(6px)"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              width: "min(100%, 380px)",
              borderRadius: 16,
              background: "#111",
              color: "white",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.55)"
            }}
          >
            {isLoading && activeLoadingConnector ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 60,
                  paddingBottom: 40,
                  paddingLeft: 24,
                  paddingRight: 24,
                  gap: 24,
                  position: "relative"
                }}
              >
                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeModal}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: 16,
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    border: "none",
                    background: "rgba(255,255,255,0.05)",
                    color: "#666",
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>

                {(activeLoadingConnector as any).id === "walletConnect" && qrCodeUri ? (
                  <div style={{ background: "white", padding: 16, borderRadius: 16 }}>
                    <QRCode value={qrCodeUri} size={200} />
                  </div>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      width: 80,
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "3px solid rgba(255,255,255,0.1)",
                        borderTopColor: "#FFF",
                        animation: "walletModalSpin 1s linear infinite"
                      }}
                    />
                    {((activeLoadingConnector as any).icon ||
                      (activeLoadingConnector as any).id === "walletConnect") && (
                      <img
                        src={
                          (activeLoadingConnector as any).id === "walletConnect"
                            ? WALLET_CONNECT_ICON
                            : (activeLoadingConnector as any).icon
                        }
                        alt={(activeLoadingConnector as any).name}
                        style={{ width: 48, height: 48, objectFit: "contain" }}
                      />
                    )}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "white" }}>
                    {(activeLoadingConnector as any).id === "walletConnect" && qrCodeUri
                      ? "Scan with your wallet"
                      : `Waiting for ${(activeLoadingConnector as any).name}`}
                  </span>
                  <span style={{ fontSize: 14, color: "#888", lineHeight: 1.5, maxWidth: 260 }}>
                    {(activeLoadingConnector as any).id === "walletConnect" && qrCodeUri
                      ? "Scan this QR code with your wallet app to connect"
                      : "Don't see your wallet? Check your other browser windows."}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 10,
                    gap: 12,
                    position: "relative"
                  }}
                >
                  <div
                    style={{
                      overflow: "hidden",
                      marginTop: 20,
                      width: 200,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #f5c52a 0%, #ff8c00 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      Lumi Game Bot
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={closeModal}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 16,
                      width: 32,
                      height: 32,
                      borderRadius: 4,
                      border: "none",
                      background: "rgba(255,255,255,0.05)",
                      color: "#666",
                      fontSize: 16,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    maxHeight: 400,
                    overflowY: "auto",
                    padding: 0
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "0 20px 24px",
                      gap: 8
                    }}
                  >
                    {!showMore ? (
                      <>
                        {mainConnectors.map((connector: any) => (
                          <ConnectorButton
                            key={connector.uid ?? connector.id}
                            connector={connector}
                            onClick={() => void handleConnect(connector)}
                            isPending={isPending}
                            isRecent={connector.id === lastUsedId}
                            showRecent={!showMore}
                            notInstalled={notDesktopInstalled(connector)}
                          />
                        ))}
                        {moreConnectors.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowMore(true)}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              height: 56,
                              padding: "10px 12px",
                              width: "100%",
                              background: "rgba(255,255,255,0)",
                              cursor: "pointer",
                              border: "1px solid rgba(255,255,255,0.05)",
                              borderRadius: 0,
                              color: "white",
                              transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0)";
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                              >
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: 4,
                                    fontSize: 14
                                  }}
                                >
                                  ⋯
                                </div>
                              </div>
                              <span style={{ fontSize: 14, fontWeight: "normal", letterSpacing: "-0.01em" }}>
                                More options
                              </span>
                            </div>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {moreConnectors.map((connector: any) => (
                          <ConnectorButton
                            key={connector.uid ?? connector.id}
                            connector={connector}
                            onClick={() => void handleConnect(connector)}
                            isPending={isPending}
                            isRecent={false}
                            showRecent={false}
                            notInstalled={notDesktopInstalled(connector)}
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => setShowMore(false)}
                          style={{
                            position: "absolute",
                            left: 16,
                            top: 16,
                            width: 32,
                            height: 32,
                            borderRadius: 4,
                            border: "none",
                            background: "rgba(255,255,255,0.05)",
                            color: "#666",
                            fontSize: 16,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          ←
                        </button>
                      </>
                    )}
                  </div>

                  {!showMore && (
                    <div style={{ padding: "0 24px 24px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
                        By connecting, you agree to the{" "}
                        <span style={{ color: "#9CA3AF", cursor: "pointer" }}>Terms</span> &{" "}
                        <span style={{ color: "#9CA3AF", cursor: "pointer" }}>Privacy Policy</span>
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <style>{`
            @keyframes walletModalSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

function ConnectorButton(props: {
  connector: any;
  onClick: () => void;
  isPending: boolean;
  isRecent: boolean;
  showRecent: boolean;
  notInstalled: boolean;
}) {
  const { connector, onClick, isPending, isRecent, showRecent, notInstalled } = props;
  const icon = connector.id === "walletConnect" ? WALLET_CONNECT_ICON : connector.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 56,
        padding: "10px 12px",
        width: "100%",
        background: "rgba(255,255,255,0)",
        cursor: isPending ? "not-allowed" : "pointer",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 0,
        color: "white",
        transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)"
      }}
      onMouseEnter={(e) => {
        if (!isPending) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            borderRadius: 10,
            overflow: "hidden",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {icon && (
            <img src={icon} alt={connector.name} style={{ width: 24, height: 24, objectFit: "contain" }} />
          )}
        </div>
        <span style={{ fontSize: 14, fontWeight: "normal", letterSpacing: "-0.01em" }}>
          {connector.name}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isRecent && showRecent && (
          <span
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              padding: "5px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: "normal",
              letterSpacing: "0.02em"
            }}
          >
            RECENT
          </span>
        )}
        {notInstalled && (
          <span
            style={{
              background: "rgba(56, 134, 255, 0.15)",
              color: "#3886FF",
              padding: "5px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: "normal",
              letterSpacing: "0.02em"
            }}
          >
            INSTALL
          </span>
        )}
      </div>
    </button>
  );
}
