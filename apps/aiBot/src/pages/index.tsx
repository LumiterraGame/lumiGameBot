import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAccount, useDisconnect } from "wagmi";
import { useWalletModal } from "@/components/WalletModal/useWalletModal";
import { requestJson } from "@/lib/requestJson";
import { getWalletAvatar } from "@/lib/walletAvatar";
import {
  runStatusLabels,
  templateOptions,
  type AIBot,
  type AIBotRunStatus,
  type AIBotTemplate
} from "@/message/data";

type ConsoleTab = "current" | "create" | "update";

type CreateFormState = {
  botName: string;
  description: string;
  decisionType: AIBotTemplate;
};

type UpdateFormState = {
  botName: string;
  description: string;
  decisionType: AIBotTemplate | null;
  runStatus: AIBotRunStatus | null;
};

const colors = {
  pageBg:
    "radial-gradient(circle at top left, rgba(27, 60, 102, 0.35), transparent 28%), radial-gradient(circle at top right, rgba(94, 61, 14, 0.18), transparent 22%), linear-gradient(180deg, #04060b 0%, #070a11 45%, #05070d 100%)",
  surface: "rgba(14, 18, 27, 0.9)",
  surfaceSoft: "rgba(15, 19, 29, 0.84)",
  surfaceMute: "rgba(255, 255, 255, 0.035)",
  border: "rgba(255, 255, 255, 0.09)",
  borderStrong: "rgba(255, 255, 255, 0.14)",
  textPrimary: "#eef1f6",
  textSecondary: "rgba(231, 235, 242, 0.68)",
  textSoft: "rgba(231, 235, 242, 0.42)",
  gold: "#f5c52a",
  goldSoft: "rgba(245, 197, 42, 0.12)",
  blue: "#8ac5ff",
  blueSoft: "rgba(138, 197, 255, 0.12)",
  green: "#43d18f",
  greenSoft: "rgba(67, 209, 143, 0.14)",
  red: "#ff6f7d"
};

function createCreateDefaults(): CreateFormState {
  return {
    botName: "",
    description: "",
    decisionType: "balanced"
  };
}

function createUpdateDefaults(): UpdateFormState {
  return {
    botName: "",
    description: "",
    decisionType: null,
    runStatus: null
  };
}

function mapBotToUpdateForm(bot: AIBot): UpdateFormState {
  return {
    botName: bot.botName,
    description: bot.description,
    decisionType: bot.decisionType,
    runStatus: bot.runStatus
  };
}

function shortWallet(walletAddress: string | null | undefined) {
  if (!walletAddress) {
    return "Not connected";
  }

  if (walletAddress.length <= 12) {
    return walletAddress;
  }

  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

function formatDecisionLabel(template: AIBotTemplate) {
  const option = templateOptions.find((item) => item.key === template);
  return option ? option.label : template;
}

function ActionButton(props: {
  label: string;
  onClick: () => void | Promise<void>;
  primary?: boolean;
  disabled?: boolean;
  busy?: boolean;
}) {
  const { label, onClick, primary = false, disabled = false, busy = false } = props;
  const inactive = disabled || busy;

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={inactive}
      style={{
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 16,
        border: primary ? "none" : `1px solid ${colors.border}`,
        background: primary ? colors.gold : "rgba(255,255,255,0.04)",
        color: primary ? "#11131b" : colors.textPrimary,
        fontSize: 15,
        fontWeight: 900,
        cursor: inactive ? "not-allowed" : "pointer",
        opacity: inactive ? 0.45 : 1,
        boxShadow: primary ? "0 16px 28px rgba(245, 197, 42, 0.24)" : "none"
      }}
    >
      {busy ? `${label}...` : label}
    </button>
  );
}

function TabButton(props: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { label, active, disabled = false, onClick } = props;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 48,
        padding: "0 18px",
        borderRadius: 16,
        border: `1px solid ${active ? "rgba(245, 197, 42, 0.5)" : colors.border}`,
        background: active ? colors.goldSoft : colors.surfaceMute,
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1
      }}
    >
      {label}
    </button>
  );
}

const inputBaseStyle: React.CSSProperties = {
  minHeight: 54,
  borderRadius: 16,
  border: `1px solid ${colors.border}`,
  padding: "0 16px",
  background: colors.surfaceMute,
  color: colors.textPrimary,
  fontSize: 15,
  width: "100%",
  boxSizing: "border-box"
};

function DecisionTypeSelect(props: {
  "aria-label": string;
  value: AIBotTemplate;
  onChange: (v: AIBotTemplate) => void;
  disabled?: boolean;
}) {
  const { value, onChange, disabled } = props;

  return (
    <select
      aria-label={props["aria-label"]}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as AIBotTemplate)}
      style={{
        ...inputBaseStyle,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1
      }}
    >
      {templateOptions.map((o) => (
        <option key={o.key} value={o.key}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function WalletTrigger(props: {
  walletAddress: string | null;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void | Promise<void>;
}) {
  const { walletAddress, connected, onConnect, onDisconnect } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  }, [walletAddress]);

  const explorerUrl = useMemo(() => {
    if (!walletAddress) return null;
    return `https://monadvision.com/address/${walletAddress}`;
  }, [walletAddress]);

  if (!connected || !walletAddress) {
    return (
      <button
        type="button"
        onClick={onConnect}
        style={{
          minWidth: 214,
          minHeight: 72,
          padding: "0 22px",
          borderRadius: 22,
          border: "none",
          background: colors.gold,
          color: "#11131b",
          fontSize: 20,
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: "0 14px 26px rgba(245, 197, 42, 0.24)"
        }}
      >
        Connect
      </button>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 52,
          padding: "0 12px 0 8px",
          borderRadius: 24,
          border: `1px solid ${colors.borderStrong}`,
          background: "rgba(255, 255, 255, 0.08)",
          color: colors.textPrimary,
          cursor: "pointer"
        }}
      >
        <Image
          src={getWalletAvatar(walletAddress)}
          alt=""
          width={30}
          height={30}
          unoptimized
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
        <span style={{ fontSize: 16, fontWeight: 800 }}>{shortWallet(walletAddress)}</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 82,
            minHeight: 28,
            borderRadius: 999,
            background: colors.greenSoft,
            color: colors.green,
            fontSize: 12,
            fontWeight: 900
          }}
        >
          Connected
        </span>
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 260,
            borderRadius: 16,
            border: `1px solid ${colors.borderStrong}`,
            background: "#111",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            overflow: "hidden",
            zIndex: 100
          }}
        >
          <div
            style={{
              padding: "16px 18px 12px",
              borderBottom: `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 800, color: colors.textPrimary }}>
              {shortWallet(walletAddress)}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <button
              type="button"
              onClick={() => { void handleCopy(); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: "transparent",
                border: "none",
                color: colors.textPrimary,
                fontSize: 14,
                cursor: "pointer",
                width: "100%",
                textAlign: "left"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? "Copied!" : "Copy Address"}
            </button>

            <a
              href={explorerUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: "transparent",
                border: "none",
                color: colors.textPrimary,
                fontSize: 14,
                cursor: "pointer",
                textDecoration: "none",
                width: "100%"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View in Explorer
            </a>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                void onDisconnect();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: "transparent",
                border: "none",
                color: colors.red,
                fontSize: 14,
                cursor: "pointer",
                width: "100%",
                textAlign: "left"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ConsoleTab>("current");
  const [bot, setBot] = useState<AIBot | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>(() => createCreateDefaults());
  const [updateForm, setUpdateForm] = useState<UpdateFormState>(() => createUpdateDefaults());
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const { address } = useAccount();
  const { disconnect, connectors } = useDisconnect();
  const { open } = useWalletModal();

  const disconnectWallet = useCallback(async () => {
    for (const connector of connectors) {
      try {
        disconnect({ connector });
      } catch (error) {
        console.error("Failed to disconnect wallet connector", error);
      }
    }
  }, [connectors, disconnect]);

  const connectedWalletAddress = address ?? null;
  const walletAddress = connectedWalletAddress;
  const isWalletConnected = Boolean(connectedWalletAddress);
  const canCreate =
    isWalletConnected && !bot && createForm.botName.trim().length >= 2;
  const canSaveStrategy =
    isWalletConnected &&
    Boolean(bot) &&
    Boolean(updateForm.botName?.trim()) &&
    Boolean(updateForm.decisionType);

  const resetForms = useCallback(() => {
    setCreateForm(createCreateDefaults());
    setUpdateForm(createUpdateDefaults());
  }, []);

  const clearRuntime = useCallback(() => {
    setBot(null);
    resetForms();
  }, [resetForms]);

  const loadCurrentBot = useCallback(async (walletAddress: string | null | undefined) => {
    if (!walletAddress?.trim()) {
      setBot(null);
      setUpdateForm(createUpdateDefaults());
      return;
    }

    const response = await requestJson<{ bot: AIBot | null }>(
      `/api/bots/query/${encodeURIComponent(walletAddress.trim())}`
    );

    if (!response.bot) {
      setBot(null);
      setUpdateForm(createUpdateDefaults());
      return;
    }

    setBot(response.bot);
    setUpdateForm(mapBotToUpdateForm(response.bot));
  }, []);

  const reloadState = useCallback(async () => {
    try {
      if (!connectedWalletAddress?.trim()) {
        clearRuntime();
        return;
      }

      await loadCurrentBot(connectedWalletAddress);
    } catch {
      clearRuntime();
    }
  }, [clearRuntime, connectedWalletAddress, loadCurrentBot]);

  useEffect(() => {
    void reloadState();
  }, [reloadState]);

  async function signOut() {
    setBusyAction("logout");

    try {
      clearRuntime();
      await disconnectWallet();
    } finally {
      setBusyAction(null);
    }
  }

  async function createBot() {
    if (!canCreate) {
      return;
    }

    setBusyAction("create");

    try {
      const response = await requestJson<{ bot: AIBot }>("/api/bots/create", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          walletAddress: connectedWalletAddress,
          botName: createForm.botName.trim(),
          decisionType: createForm.decisionType,
          description: createForm.description.trim()
        })
      });

      setBot(response.bot);
      setUpdateForm(mapBotToUpdateForm(response.bot));
      setCreateForm(createCreateDefaults());
      setActiveTab("current");
    } catch {
      /* requestJson surfaces error to user via throw */
    } finally {
      setBusyAction(null);
    }
  }

  async function saveStrategy() {
    if (!canSaveStrategy || !updateForm.decisionType || !bot) {
      return;
    }

    setBusyAction("save");

    try {
      const response = await requestJson<{ bot: AIBot }>("/api/bots/update", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          walletAddress: connectedWalletAddress,
          botName: updateForm.botName.trim(),
          decisionType: updateForm.decisionType,
          runStatus: updateForm.runStatus ?? bot.runStatus,
          description: updateForm.description.trim()
        })
      });

      setBot(response.bot);
      setUpdateForm(mapBotToUpdateForm(response.bot));
      setActiveTab("current");
    } catch {
      /* requestJson surfaces error */
    } finally {
      setBusyAction(null);
    }
  }

  useEffect(() => {
    if (bot && activeTab === "create") {
      setActiveTab("current");
    }
  }, [bot, activeTab]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const rawTab = router.query.tab;
    const tab = typeof rawTab === "string" ? rawTab : Array.isArray(rawTab) ? rawTab[0] : null;
    if (tab === "current" || tab === "create" || tab === "update") {
      setActiveTab(tab);
    }
  }, [router.isReady, router.query.tab]);

  function renderCurrentPanel() {
    const rows: Array<{ label: string; value: string; empty: boolean }> = [
      { label: "机器人名称", value: bot?.botName ?? "—", empty: !bot?.botName },
      { label: "决策类型", value: bot ? formatDecisionLabel(bot.decisionType) : "—", empty: !bot },
      { label: "运行状态", value: bot ? runStatusLabels[bot.runStatus] : "—", empty: !bot },
      { label: "描述", value: bot?.description?.trim() ? bot.description : "—", empty: !bot?.description?.trim() },
      { label: "创建时间", value: bot?.createdAt ? new Date(bot.createdAt).toLocaleString() : "—", empty: !bot?.createdAt }
    ];

    return (
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: colors.textPrimary }}>Current robot</h2>
          <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.7 }}>
            当前钱包下的 AIBot 摘要（不含钱包地址）。
          </p>
        </div>

        <div style={{ display: "grid", gap: 0 }}>
          {rows.map((item, index) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                minHeight: 54,
                borderBottom: index < rows.length - 1 ? `1px solid ${colors.border}` : "none",
                paddingBottom: index < rows.length - 1 ? 14 : 0,
                marginBottom: index < rows.length - 1 ? 14 : 0
              }}
            >
              <span style={{ minWidth: 140, fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>{item.label}</span>
              <span
                style={{
                  flex: 1,
                  minWidth: 200,
                  fontSize: 15,
                  color: item.empty ? colors.textSoft : colors.textPrimary,
                  wordBreak: "break-word"
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderCreatePanel() {
    const formDisabled = Boolean(bot);

    return (
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: colors.textPrimary }}>Create robot</h2>
          <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.7 }}>
            为当前钱包创建 AIBot；若已存在机器人，请使用 Current / Update。
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ minWidth: 140, fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>机器人名称</span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <input
              aria-label="Create bot name"
              value={createForm.botName}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  botName: event.target.value
                }))
              }
              disabled={formDisabled}
              placeholder="为此钱包机器人命名"
              style={{
                ...inputBaseStyle,
                opacity: formDisabled ? 0.45 : 1,
                cursor: formDisabled ? "not-allowed" : "text"
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ minWidth: 140, fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>决策类型</span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <DecisionTypeSelect
              aria-label="Create decision type"
              value={createForm.decisionType}
              disabled={formDisabled}
              onChange={(v) => setCreateForm((c) => ({ ...c, decisionType: v }))}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <span style={{ minWidth: 140, paddingTop: 14, fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>
            描述（可选）
          </span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <textarea
              aria-label="Create bot description"
              value={createForm.description}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              disabled={formDisabled}
              placeholder="预留说明，例如策略备注、对接计划等"
              rows={4}
              style={{
                borderRadius: 16,
                border: `1px solid ${colors.border}`,
                padding: 14,
                background: colors.surfaceMute,
                color: colors.textPrimary,
                fontSize: 15,
                resize: "vertical",
                width: "100%",
                boxSizing: "border-box",
                opacity: formDisabled ? 0.45 : 1,
                cursor: formDisabled ? "not-allowed" : "text"
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <ActionButton
            label="Create AIBot"
            onClick={createBot}
            primary
            disabled={!canCreate}
            busy={busyAction === "create"}
          />
        </div>
      </div>
    );
  }

  function renderUpdatePanel() {
    const formDisabled = !bot;

    return (
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: colors.textPrimary }}>Update robot</h2>
          <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.7 }}>
            {formDisabled
              ? "更新当前钱包的 AIBot；若尚未创建，请先在 Create 中创建。"
              : "编辑当前钱包的机器人名称、决策类型与描述。"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ minWidth: 140, fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>机器人名称</span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <input
              aria-label="Update bot name"
              value={updateForm.botName}
              onChange={(event) =>
                setUpdateForm((current) => ({
                  ...current,
                  botName: event.target.value
                }))
              }
              disabled={formDisabled}
              placeholder="为此钱包机器人命名"
              style={{
                ...inputBaseStyle,
                opacity: formDisabled ? 0.45 : 1,
                cursor: formDisabled ? "not-allowed" : "text"
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ minWidth: 140, fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>决策类型</span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <DecisionTypeSelect
              aria-label="Update decision type"
              value={updateForm.decisionType ?? "balanced"}
              disabled={formDisabled}
              onChange={(v) => setUpdateForm((c) => ({ ...c, decisionType: v }))}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <span style={{ minWidth: 140, paddingTop: 14, fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>
            描述（可选）
          </span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <textarea
              aria-label="Update bot description"
              value={updateForm.description}
              onChange={(event) =>
                setUpdateForm((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              disabled={formDisabled}
              placeholder="预留说明，例如策略备注、对接计划等"
              rows={4}
              style={{
                borderRadius: 16,
                border: `1px solid ${colors.border}`,
                padding: 14,
                background: colors.surfaceMute,
                color: colors.textPrimary,
                fontSize: 15,
                resize: "vertical",
                width: "100%",
                boxSizing: "border-box",
                opacity: formDisabled ? 0.45 : 1,
                cursor: formDisabled ? "not-allowed" : "text"
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <ActionButton
            label="Update AIBot"
            onClick={saveStrategy}
            primary
            disabled={!canSaveStrategy}
            busy={busyAction === "save"}
          />
        </div>
      </div>
    );
  }

  const showingAuth = !isWalletConnected;
  const showMainTabs = isWalletConnected;

  const content = showingAuth
    ? (
      <div style={{ color: colors.textSecondary, lineHeight: 1.8 }}>
        <p style={{ margin: "0 0 12px", color: colors.textPrimary, fontSize: 18, fontWeight: 800 }}>
          连接钱包
        </p>
        <p style={{ margin: 0 }}>
          请先点击右上角 <strong style={{ color: colors.gold }}>Connect</strong> 连接钱包，即可查询、创建与更新当前地址下的 AIBot（服务端信任请求中的钱包字段，不做额外验签）。
        </p>
      </div>
    )
    : activeTab === "current"
      ? renderCurrentPanel()
      : activeTab === "create"
        ? renderCreatePanel()
        : renderUpdatePanel();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.pageBg,
        color: colors.textPrimary
      }}
    >
      <div
        style={{
          width: "min(1180px, calc(100% - 40px))",
          margin: "0 auto",
          padding: "28px 0 48px",
          display: "grid",
          gap: 24
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "22px 24px",
            borderRadius: 28,
            border: `1px solid ${colors.border}`,
            background: colors.surface
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 44, letterSpacing: "-0.04em" }}>Lumi Game Bot</h1>
            <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.7 }}>
              连接钱包后即可在同一页面管理当前地址下的 AIBot（创建/更新请求需携带钱包地址）。
            </p>
          </div>
          <WalletTrigger
            walletAddress={walletAddress}
            connected={isWalletConnected}
            onConnect={open}
            onDisconnect={signOut}
          />
        </header>

        <section
          style={{
            display: "grid",
            gap: 18,
            padding: "22px 24px",
            borderRadius: 28,
            border: `1px solid ${colors.border}`,
            background: colors.surfaceSoft
          }}
        >
          {showMainTabs ? (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }} role="tablist" aria-label="AIBot sections">
              <TabButton
                label="Current"
                active={activeTab === "current"}
                onClick={() => setActiveTab("current")}
              />
              <TabButton
                label="Create"
                active={activeTab === "create"}
                disabled={Boolean(bot)}
                onClick={() => setActiveTab("create")}
              />
              <TabButton
                label="Update"
                active={activeTab === "update"}
                onClick={() => setActiveTab("update")}
              />
            </div>
          ) : null}

          <div
            style={{
              minHeight: 420,
              display: "grid",
              gap: 20,
              padding: "24px",
              borderRadius: 24,
              border: `1px solid ${colors.border}`,
              background: "rgba(255,255,255,0.02)"
            }}
          >
            {content}
          </div>
        </section>
      </div>
    </div>
  );
}
