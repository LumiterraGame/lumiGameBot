# Repository Guidelines

## 项目定位与规划依据
本仓库用于承载 `Bot AI Brain` 的 `Web` 创建与管理、平台侧 `AI Brain Service`、`AI Gateway` 以及共享契约和数据层。当前正式规划以 `plans/001` 到 `plans/004` 为准：`001` 定义产品形态，`002` 定义架构边界，`003` 定义开发顺序，`004` 定义里程碑 0 的脚手架方案。

当前仓库仍以规划文档为主；在脚手架真正落地前，任何结构、命名或技术栈调整都应先同步 `plans/`，再提交代码。

## 仓库边界与目录组织
本仓库的目标形态是 `yarn workspace` monorepo，而不是 Unity 工程。`Unity Agent` 和正式游戏执行逻辑继续保留在 `/Users/44alex/work/meland/odyssey-v2/unity-client-v2`，不要把客户端运行时代码直接搬进本仓库。

计划中的主目录如下：

- `apps/brain-web`：`Next.js + React + TypeScript`，用于 `Brain` 创建、管理、复盘和 `AI` 费用展示。
- `apps/brain-service`：`NestJS + TypeScript`，承载 `brain-registry`、`brain-service`、`ai-gateway`、`session-lease-manager`、`decision-journal`、`pnl-ledger`。
- `packages/db`：`Prisma + PostgreSQL`。
- `packages/brain-domain`、`packages/brain-contracts`、`packages/ai-core`、`packages/upstream-clients`、`packages/shared-kernel`：领域模型、共享 DTO、AI 抽象、上游依赖封装和基础内核。

依赖方向保持单向：`apps -> packages`，`packages` 不反向依赖 `apps`。

## 开发、构建与测试命令
里程碑 0 落地后，统一使用 `yarn`：

- `yarn install`
- `yarn dev`
- `yarn build`
- `yarn lint`
- `yarn test`
- `yarn workspace brain-web dev`
- `yarn workspace brain-service dev`
- `yarn db:migrate`
- `yarn db:seed`

在这些脚本实际落地前，贡献主要围绕 `plans/` 文档推进，不要在 `AGENTS.md` 中虚构未实现的运行方式。

## 编码与契约规范
默认使用 `TypeScript`，统一 2 空格缩进。领域命名应与规划保持一致，例如 `Brain`、`BrainTemplate`、`PhaseRule`、`StrategyState`、`DecisionJournal`、`PnLLedger`。

共享接口、DTO、schema 放在 `packages/brain-contracts`；领域对象与策略状态放在 `packages/brain-domain`；外部系统调用统一收口到 `packages/upstream-clients`。`Web`、`brain-service` 和未来 `Unity` 联调都应优先复用共享契约，避免各写一套类型。

## 测试与验收要求
优先覆盖高价值约束：

- 一个钱包只能绑定一个长期 `Brain`
- 阶段策略状态可持久化并可演化
- `decision-journal` 与 `pnl-ledger` 可正确记录
- `session-lease-manager` 能保证单活会话
- `brain-web` 与 `brain-service` 的接口契约兼容

涉及数据库的变更必须同时提交 migration 或 schema 更新；无法自动化时，在 PR 中写清 `Web`、服务和 `PostgreSQL` 的手工验证步骤。

## 提交、PR 与安全要求
提交信息使用简洁英文前缀，如 `docs:`、`feat:`、`fix:`、`refactor:`、`chore:`。PR 需要说明关联的 `plans/*` 文档、影响的 `app/package`、接口或 schema 变更、环境变量变更以及验证结果。

禁止提交私钥、钱包导出、模型厂商 key、数据库凭据或真实 session token。涉及审批规则、风控默认值、AI 预算或链上动作的改动，默认按高风险变更处理，并在 PR 中单独说明。
