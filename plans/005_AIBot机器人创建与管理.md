## 时间: 2026-03-20 19:08:00 CST（2026-03-20 同步代码：单页控制台、无 templates API、无 `/api/auth/*`）

## 任务: AIBot(机器人)创建管理与前端钱包

# 最终任务包

## 目标

完成 `apps/aiBot` 侧「连接钱包 + AIBot(机器人)创建与管理」的第一版可用能力，让用户可以：

- 连接钱包（`wagmi`，无独立服务端登录验签）
- 查询当前钱包是否已有 `AIBot(机器人)`
- 创建唯一 `AIBot(机器人)`
- 查看 `AIBot(机器人)` 摘要
- 编辑 `AIBot(机器人)` 的基础配置

## 范围内

- 前端页面：首页单页控制台 `apps/aiBot/src/pages/index.tsx`（`wagmi` 连接钱包；**Current / Create / Update** 三 Tab；Create 在已有机器人时禁用；表单内决策类型为下拉框，默认平衡型）
- 辅助页面：`/health` 说明文案页（`pages/health.tsx`）
- 后端 API：
  - `GET /api/bots/query/[walletAddress]`（仅校验地址格式，无会话）
  - `POST /api/bots/create`、`PATCH /api/bots/update`：**请求体携带 `walletAddress`**，服务端校验地址格式后操作数据库（**信任调用方声明的钱包**，不做 EIP-191 验签）
- 数据存储：仅 `aibots` 表
- 前后端代码按 `apps/aiBot` 应用结构落地
- `apps/aiBrainService` 仅保留同级目录占位

## 范围外

- 不在本里程碑内实现真实 `AI` 决策
- 不在本里程碑内实现与 `Unity Client` 的正式对接
- 不在本里程碑内实现正式 `AI Brain Service(AI大脑)` 业务逻辑
- 不提供 `login_nonces`、HMAC 会话 cookie、`/api/auth/*`

## 页面与 API 规划（当前实现）

### API（已实现）

- `GET /api/bots/query/[walletAddress].ts`
- `POST /api/bots/create.ts`
- `PATCH /api/bots/update.ts`
- `GET /api/health.ts`、`GET /api/db/health.ts`

### 目录落点

- `apps/aiBot/src/pages/index.tsx`（主控制台）
- `apps/aiBot/src/pages/_app.tsx`（`WagmiProvider`、钱包弹层）
- `apps/aiBot/src/components/WalletModal/*`（连接钱包 UI）
- `apps/aiBot/src/lib/wallet/*`（链配置、`wagmi` config、连接器）
- `apps/aiBot/src/message/message.ts`（机器人创建/查询/更新 DTO）
- `apps/aiBot/src/message/data.ts`（领域枚举与 `AIBot` 实体）
- `apps/aiBot/src/dbInterface/aibot.ts`、`interface.ts`
- `apps/aiBot/src/db/schema.ts`、`types.ts`、`pgdb.ts`、`db-smoke.ts`
- `apps/aiBot/src/db/001_init_aibot_tables.sql`（仅 `aibots`）
- `apps/aiBot/.env.example`：`AIBOT_POSTGRES_*`；可选 `NEXT_PUBLIC_CHAIN_ID`、`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`（默认见 `lib/wallet/chain.ts`、`config.ts`）

### 自动化测试

- `apps/aiBot/tests/api-bots.test.ts`（bots API）
- `apps/aiBot/tests/home-console.test.tsx`（首页与 Tab）

## 数据模型规划

### `AIBot`（表 `aibots`）

- `wallet_address`（主键，一钱包一行）
- `bot_name`
- `decision_type`（`profit` | `growth` | `balanced`）
- `run_status`（`running` | `paused` | `stopped`；新建默认 `stopped`）
- `description`（预留描述，默认空串）
- `created_at` / `updated_at`

## 安全说明（与旧版对比）

- **旧版**：钱包签名 + HMAC cookie 会话；`create/update` 依赖会话中的钱包。
- **当前**：无服务端会话；`POST/PATCH` 以 `body.walletAddress` 为准（**仅适合开发/内网或后续再接入鉴权**）。

## 验收标准

- 当前钱包无 `AIBot(机器人)` 时可完成创建（请求体含 `walletAddress`）
- 当前钱包有 `AIBot(机器人)` 时可读取和编辑
- 一个钱包只能创建一个 `AIBot(机器人)`
- 当前代码目录与本计划中的 `apps/aiBot` 口径一致

## 待确认问题

- 当前围绕 `apps/aiBot` 交付范围，无新增待确认问题
