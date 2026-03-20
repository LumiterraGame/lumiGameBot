# Repository Guidelines

## 项目定位与规划依据
本仓库当前承载 `AIBot(机器人)` 的 `Web` 创建与管理、`AI Brain Service(AI大脑)` 相关逻辑模块、`AI Gateway`、数据库访问层以及共享消息结构。术语、边界和开发顺序以 `plans/001` 到 `plans/005` 为准；如果 `plans/` 更新了命名或目录结论，`AGENTS.md` 也必须同步更新。

当前正式术语优先使用 `AIBot(机器人)`、`AI Brain Service(AI大脑)`、`AI Gateway`、`AuthSession`、`AIBotPolicyState`。不要继续在新文档或新代码中沿用旧的 `Bot AI Brain`、`brain-web`、`brain-domain`、`apps/packages` monorepo 说法。

## 仓库边界与目录组织
当前仓库优先采用类似 `lumiterrator-v2` 的单应用工程形态，而不是多应用 monorepo。正式游戏执行和 `Unity Agent` 仍在 `/Users/44alex/work/meland/odyssey-v2/unity-client-v2`，不要把 Unity 运行时代码直接迁入本仓库。

当前目标目录以 `src/` 为中心：

- `src/pages`：页面入口，同时包含 `pages/api`
- `src/message`：request / response / DTO / shared message types
- `src/db`：`Prisma` 初始化、`PostgreSQL` 连接与健康探针
- `src/dbInterface`：数据访问封装
- `src/aibot`：钱包登录、`AIBot(机器人)` 创建与管理逻辑
- `src/aiBrainService`：`AI Brain Service(AI大脑)` 逻辑模块
- `src/ai`：provider 抽象、`ai-gateway`、cost governor
- `src/lib`：logger、env、errors、ids
- `src/components`、`src/hooks`、`src/styles`
- `prisma/`、`scripts/`、`plans/`

## 开发、构建与数据库命令
统一使用 `yarn`：

- `yarn install`
- `yarn dev`
- `yarn build`
- `yarn lint`
- `yarn test`
- `yarn db:migrate`
- `yarn db:seed`

目标开发体验是一条 `yarn dev` 同时支撑页面、`pages/api` 和数据库连接。若脚本语义变更，先改 `plans/003` 或 `plans/004`，再更新本文件。

## 编码与命名规范
默认使用 `TypeScript`，统一 2 空格缩进。命名应与最新 plans 保持一致，例如 `AIBot`、`AIBotPolicyState`、`AuthSession`、`DecisionJournal`、`PnLLedger`。

页面和 API 放在 `src/pages`；DTO 和消息定义放在 `src/message`；数据库访问统一收口到 `src/dbInterface`；`AIBot(机器人)` 业务逻辑放在 `src/aibot`；`AI Brain Service(AI大脑)` 相关逻辑放在 `src/aiBrainService`。不要把数据访问、页面状态和 AI 逻辑混写在同一个模块里。

## 测试与验收要求
优先覆盖以下约束：

- 钱包签名登录和 `AuthSession` 建立
- 当前钱包查询、创建、更新自己的 `AIBot(机器人)`
- 一钱包只能存在一个 `AIBot(机器人)`
- `AIBotPolicyState` 持久化正确
- `/api/health` 与数据库健康探针可用

涉及数据库改动时，必须同时提交 `prisma` schema、migration 或 seed 更新。若暂时没有自动化测试，PR 中必须写明钱包登录、`AIBot(机器人)` 创建/编辑、API 鉴权和数据库连接的手工验证步骤。

## 提交、PR 与安全要求
提交信息继续使用简洁英文前缀，如 `docs:`、`feat:`、`fix:`、`refactor:`、`chore:`。PR 需要写清关联的 `plans/*` 文档、影响的 `src/*` 目录、接口或数据库变更、环境变量变更以及验证结果。

禁止提交私钥、钱包导出、模型厂商 key、数据库凭据或真实 session token。所有 `AIBot(机器人)` 相关 API 默认依赖当前钱包登录态，不允许匿名访问；涉及审批规则、AI 预算、风控默认值或链上动作的改动，按高风险变更处理。
