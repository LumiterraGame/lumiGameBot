# Repository Guidelines

## 项目定位与规划依据

本仓库 `lumiGameBot` 当前主要交付 **`apps/aiBot`**：`AIBot(机器人)` 的 Web 创建与管理（`Next.js` + `pages/api` + `PostgreSQL`）、钱包连接（`wagmi`）与领域消息类型。产品愿景与平台侧总架构仍以 **`plans/001`～`plans/005`** 为准；`plans/` 与代码不一致时，**先改 `plans/` 再改本文件**。

术语优先使用 **`AIBot(机器人)`**、**`AI Brain Service(AI大脑)`**、**`AI Gateway`**、**`AIBotPolicyState`** 等（见各 plan）。勿在新文档中沿用旧称 `brain-web`、`brain-domain`、`apps/packages` monorepo。

## 仓库边界

- **本仓库**：`apps/aiBot`（主应用）+ `apps/aiBrainService`（占位）+ `plans/`。
- **不在本仓库**：`Unity Client` / 游戏运行时（路径仍为 **`/Users/44alex/work/meland/odyssey-v2/unity-client-v2`**），勿迁入 Unity 代码。

## `apps/aiBot` 目录（以 `src/` 为中心）

路径均相对于 `apps/aiBot/`：

| 目录 | 说明 |
|------|------|
| `src/pages` | 页面与 **`pages/api`**（`/` 控制台、`/health`、`/api/bots/*`、`/api/health`、`/api/db/health`） |
| `src/message` | DTO / 领域枚举（`message.ts`、`data.ts`） |
| `src/db` | `pg`、`drizzle-orm`、`schema.ts`、**手动 SQL** `001_init_aibot_tables.sql`、`db-smoke`（健康探针） |
| `src/dbInterface` | 数据访问（`aibot.ts`、`interface.ts`） |
| `src/lib` | `env`、`api`、`http-errors`、`requestJson`、`wallet/*`（链与 `wagmi`）等 |
| `src/components` | 如 `WalletModal` |
| `tests` | Vitest：`api-bots`、`home-console` |

**已不存在的占位目录（勿再建空壳）**：`src/aibot`、`src/server`、`src/request`、`src/upstream`、`src/aiBrainService`（与 **`apps/aiBrainService`** 独立应用区分）。

**`apps/aiBrainService`**：同级占位应用，后续承接 AI Brain 相关逻辑；**不是** `apps/aiBot/src` 下的子目录。

## 当前实现要点（与 `plans/005` 一致）

- **无**服务端钱包签名会话、**无** `/api/auth/*`；`POST/PATCH /api/bots/*` 依赖请求体 **`walletAddress`**（信任前端，生产需另加鉴权）。
- 数据库：**非 Prisma**；用 `drizzle` + 手工执行/维护 SQL。
- 环境变量：`AIBOT_POSTGRES_*`；可选 `NEXT_PUBLIC_CHAIN_ID`、`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`（默认见 `src/lib/wallet/chain.ts`、`config.ts`）

## 开发、构建与数据库

在**仓库根目录**（workspace）：

```bash
yarn install
yarn dev:aiBot      # 启动 apps/aiBot
yarn build          # 构建 ai-bot
yarn lint
yarn test
```

`apps/aiBot` 内也可 `yarn dev` / `yarn build`。数据库表请按 `src/db/001_init_aibot_tables.sql` **手工执行**（或团队约定迁移流程）；**根目录未提供 `db:migrate`**。

## 编码规范

- 默认 **TypeScript**，2 空格缩进。
- 页面与 API 放 `src/pages`；DTO 放 `src/message`；DB 访问只经 **`src/dbInterface`**；勿把 DB 与 UI 状态混在同一模块。

## 测试与验收

- 自动化：`yarn test`（`apps/aiBot/tests`）。
- 业务上建议验证：连接钱包、`AIBot` 查询/创建/更新、一钱包一机器人、`/api/health` 与 `/api/db/health`。
- 数据库变更需同步 **`schema` / SQL** 与必要说明。

## 提交、PR 与安全

- 提交前缀：`docs:`、`feat:`、`fix:`、`refactor:`、`chore:` 等。
- PR 写明关联 **`plans/*`**、影响路径、接口/DB/环境变量变更与验证方式。
- **禁止**提交私钥、助记词、模型 key、数据库密码、真实 session。  
- 当前 **`create/update` 为信任前端钱包字段**；若改为强鉴权，属高风险变更，需单独设计与评审。
