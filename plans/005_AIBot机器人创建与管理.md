## 时间: 2026-03-25 CST（按 `docs/lumiterra-aibot-product-plan.md` 重新对齐）

## 任务: 当前仓库中的 AIBot 创建与管理壳

# 最终任务包

## 目标

说明 `apps/aiBot` 当前这部分代码在整个权威产品方案中的位置。它不是最终完整产品控制台，只是当前仓库里已经存在的最小 `AIBot` 注册与管理壳。

## 本文件的权威来源

- 产品最终形态以 [docs/lumiterra-aibot-product-plan.md](/Users/44alex/work/meland/odyssey-v2/lumiGameBot/docs/lumiterra-aibot-product-plan.md) 为准。
- 如果引用 Unity 执行侧目录或执行单元，统一使用 `操作原子(Atoms)` 术语，不再使用 `Tool Catalog / *Tools`。
- 该文档定义的正式控制台形态包含：
  - Unity 内 `AIBot Panel`
  - `lumiterrator-v2` 中的 Dashboard / Strategy / Replay / Pricing / Subscription
- 本文件只描述当前 `apps/aiBot` 已实现的最小范围。

## 当前范围

当前 `apps/aiBot` 只覆盖：

- 连接钱包
- 查询当前钱包是否已有 `AIBot`
- 创建唯一 `AIBot`
- 查看 `AIBot` 摘要
- 编辑 `AIBot` 的基础配置

## 当前实现

### 页面

- 首页单页控制台 `apps/aiBot/src/pages/index.tsx`
- `Current / Create / Update` 三个 Tab
- `wagmi` 钱包连接

### API

- `GET /api/bots/query/[walletAddress]`
- `POST /api/bots/create`
- `PATCH /api/bots/update`
- `GET /api/health`
- `GET /api/db/health`

### 数据

- 当前只使用 `aibots` 表

字段：

- `wallet_address`
- `bot_name`
- `decision_type`
- `run_status`
- `description`
- `created_at`
- `updated_at`

## 当前不代表的能力

当前 `apps/aiBot` **不代表**权威文档里的这些正式能力已经完成：

- `Bot Dashboard`
- `Strategy Template`
- `Opportunity Replay`
- `Daily Profit Report`
- `Bot Pricing`
- `Bot Subscription`
- `Billing History`
- `Bot API` 完整决策接口
- `entitlement` 完整校验
- `AI Advisor`
- `Backtest and Replay`

## 与收费和授权的关系

- 当前 `aibots` 表只表示“该钱包下存在一个 `AIBot` 注册信息”。
- 它不等于：
  - Bot 已有正式使用权
  - Bot 已通过 entitlement 校验
  - Bot 已可执行自动化赚钱动作

后续至少需要补：

- `plan_id`
- `plan_name`
- `billing_mode`
- `enabled_money_loops`
- `enabled_ai_features`
- `expire_at`
- `grace_expire_at`
- `entitlement_status`

## 与权威技术框架的关系

- 当前仓库里的 `apps/aiBot` 更适合被视为：
  - 最小注册表
  - 最小 BFF
  - 临时管理壳
- 它不应再被写成“正式完整产品控制台”的唯一落点。

## 当前安全边界

- 当前仍然没有服务端钱包验签会话。
- `POST / PATCH` 仍然信任 `walletAddress` 请求体。
- 因此它只适合作为当前开发态或后续重构前的最小壳。

## 验收标准

- 本文件明确把 `apps/aiBot` 定义为“当前最小实现壳”，而不是最终完整产品形态。
- 本文件与权威文档中的 Web / Dashboard 规划不再冲突。
- 本文件明确“创建 AIBot”与“Bot 可运行”是两件事。
