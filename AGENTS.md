# Repository Guidelines

## 项目定位与规划依据

本仓库 `lumiGameBot` 当前主要交付 **`apps/aiBot`**：`AIBot(机器人)` 的当前最小管理壳（`Next.js` + `pages/api` + `PostgreSQL`）、钱包连接（`wagmi`）与领域消息类型。产品定位与技术框架以 **`docs/lumiterra-aibot-product-plan.md`** 为唯一事实源；`plans/` 负责把该文档拆成产品/架构/阶段计划。`docs/`、`plans/` 与代码不一致时，**先改 `docs/` 或 `plans/`，再改本文件**。

术语优先使用 **`AIBot(机器人)`**、**`AI Brain Service(AI大脑)`**、**`AI Gateway`**、**`AIBotPolicyState`** 等（见各 plan）。勿在新文档中沿用旧称 `brain-web`、`brain-domain`、`apps/packages` monorepo。

## 仓库边界

- **本仓库**：`apps/aiBot`（主应用）+ `apps/aiBrainService`（占位）+ `plans/`。
- **不在本仓库**：`Unity Client` / 游戏运行时（当前权威参考路径为 **`/Users/44alex/work/meland/odyssey-v2/unity-client-v2-aibot`**，见 `docs/lumiterra-aibot-product-plan.md`），勿迁入 Unity 代码。

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

**决策/任务流水（journal）**：写入主体为 **`apps/aiBrainService`**（沿 Decision 路径落库）；`apps/aiBot` **不**重复实现大脑侧业务库写入；经 BFF 转发时仍由 Brain 写入。详见 **`plans/006_AI大脑服务与决策分层落地.md` §4.2**。

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

## 执行原则（固化）

- 当用户明确给出对标项目或参考实现（例如 `lumiterrator-v2`）时，**优先按参考项目的真实实现复用与对齐**，不要先做自定义简化版或“更优雅”的重写。
- 当用户要求“全部按照某项目实现”时，默认含义是：
  - 先对齐流程
  - 再对齐状态模型
  - 再对齐组件边界
  - 最后才考虑抽象与优化
- 优先减少无必要的目录层级、服务层跳转、表拆分和接口绕转；若一个实现可以直接放在 API 文件中且不会明显损害可读性，则优先选择更短的阅读路径。
- 默认不做过度开发；实现以“满足当前需求的最小充分方案”为优先，避免为假设中的未来需求提前引入复杂抽象、额外泛化或预优化。代码需要在性能与可读性之间取得最佳平衡，优先选择易读、稳定、性能足够且后续容易演进的方案。
- 页面默认以**正式操作页面**为目标，不使用测试导航页、占位链接页或“临时可用页”作为交付形态，除非用户明确要求。
- 钱包连接、登录、状态切换这类关键链路，若仓库已存在明确参考实现，必须先逐文件核对再动手实现，不能凭记忆近似复刻。
- `plans/` 中的产品层、架构层、开发计划层必须严格分离；实现时不得把产品判断、架构假设、临时实现细节混写在同一层文档中。

## 测试与验收

- 自动化：`yarn test`（`apps/aiBot/tests`）。
- 业务上建议验证：连接钱包、`AIBot` 查询/创建/更新、一钱包一机器人、`/api/health` 与 `/api/db/health`。
- 数据库变更需同步 **`schema` / SQL** 与必要说明。

## 提交、PR 与安全

- 提交前缀：`docs:`、`feat:`、`fix:`、`refactor:`、`chore:` 等。
- PR 写明关联 **`plans/*`**、影响路径、接口/DB/环境变量变更与验证方式。
- **禁止**提交私钥、助记词、模型 key、数据库密码、真实 session。  
- 当前 **`create/update` 为信任前端钱包字段**；若改为强鉴权，属高风险变更，需单独设计与评审。
