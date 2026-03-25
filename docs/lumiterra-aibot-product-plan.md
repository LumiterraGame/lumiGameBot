# Lumiterra AI 收益机器人产品规划与开发计划

## 1. 项目定位

这个项目不应该被定义成“保证赚钱”的黑盒外挂，而应该被定义成官方可控的：

- `AI 驱动收益优化机器人`
- `可被 Unity 客户端集成的托管系统`
- `可解释、可灰度、可回放、可风控的自动化收益引擎`

目标是让机器人在玩家授权下，自动判断当前账号最优收益路径，并执行低风险、可重复、可验证的游戏内与链上收益动作。

## 2. 产品目标

### 2.1 业务目标

- 自动识别当前账号最优收益机会
- 自动执行任务、农场、回收等收益行为
- 把收益行为统一纳入客户端执行链路和链上结算闭环
- 直接集成到 Unity Client 中，玩家可在游戏内查看、启停、接管

### 2.2 产品原则

- 优先做稳定收益，不优先做高波动投机
- AI 负责决策增强，不直接裸控底层游戏指令
- 只对不可逆、链上、高成本或明显异常的动作做必要限制，常规低风险收益动作默认允许 AI 自主执行
- 每个动作都必须能记录“预期收益”和“实际收益”
- Bot 的游戏观测面只来自 `Unity 客户端可观测状态`
- Bot 不直接读取 `game-services` 或 `scene-server` 的私有实时状态
- 如确实需要新的游戏状态，先把它做成官方客户端可见能力，再由 Bot 采集
- 玩家默认以观察和必要接管为主，而不是全程审批

### 2.3 商业化前提

产品侧已经明确有 `按 Bot 收费` 的方向，因此这不是后置运营问题，而是基础平台能力。

当前先不锁价格，但必须提前预留：

- `Bot Entitlement`
- `Plan / Tier`
- `Billing State`
- `Feature Gate`

结论：

- 第一版就应该把“bot 是否可运行”做成服务端授权判断
- Unity 客户端不能只看本地开关，必须看服务端计费状态
- 后续价格即使变化，客户端和策略服务也不用重构

### 2.4 数据边界原则

状态输入统一指：

`客户端可观测状态 + 链上/公共 API 状态`

允许：

- Unity 客户端本地可见状态
- Unity 通过正常玩家链路拿到的客户端响应数据
- 链上公开数据、公共配置、计费授权、静态表数据

不允许：

- Bot 直接查询 `game-services` 私有玩家状态
- Bot 直接依赖 `scene-server` 内部实体快照

## 3. 代码库依赖与职责规划

### 3.1 Unity 客户端

仓库：

- `/Users/44alex/work/meland/odyssey-v2/unity-client-v2-aibot`

职责：

- 机器人 UI 面板
- 客户端状态采集
- 动作执行器
- 手动接管
- 行为日志回传

### 3.2 Game Services

仓库：

- `/Users/44alex/work/meland/odyssey-v2/game-services-v2`
- `/Users/44alex/work/meland/odyssey-v2/scene-server-v2`
- `/Users/44alex/work/meland/odyssey-v2/services`

职责：

- 游戏动作的最终业务校验与执行后端
- 场景、任务、实体、掉落、进度等事件分发

边界说明：

- `game-services` 属于 `执行与校验层`
- 不应被当成 Bot 的 `直接观测层`

### 3.3 Web3 与合约

仓库：

- `/Users/44alex/work/meland/odyssey-v2/theweb3-v2`
- `/Users/44alex/work/meland/odyssey-v2/contracts-monad-v2`

职责：

- 读取链上奖池、回收池、资金状态
- 执行链上回收、奖励领取等收益相关动作

### 3.4 数据与配置

仓库：

- `/Users/44alex/work/meland/odyssey-v2/service-xlsx-tool-v2`

职责：

- 导出任务、物品、资源、成长、收益参数
- 支撑回测与策略评分

### 3.5 Web / Bot 控制台

仓库：

- `/Users/44alex/work/meland/odyssey-v2/lumiterrator-v2`

建议职责：

- Bot 配置页面
- 策略模板页
- 收益日报与行为回放页
- 套餐购买页与 Bot 授权页

### 3.6 外部参考项目

参考项目：

- [minecraft-mcp-server](https://github.com/yuniko-software/minecraft-mcp-server)

借鉴重点：

- 工具目录
- 连接管理器
- 消息存储
- 主程序只做装配

## 4. 产品形态规划

### 4.1 Unity 内产品形态

Unity 客户端增加 `AIBot` 面板，包含：

1. `Bot Status`
2. `AI Decision Feed`
3. `Money Loop Panel`
4. `Risk Guard`
5. `Manual Override`
6. `Entitlement State`

### 4.2 Web 管理台产品形态

建议在 `lumiterrator-v2` 增加：

- `Bot Dashboard`
- `Strategy Template`
- `Opportunity Replay`
- `Daily Profit Report`

后续增加：

- `Bot Pricing`
- `Bot Subscription`
- `Billing History`

### 4.3 收费规划

当前不定价，但产品架构必须按“按 Bot 收费”设计。

建议的收费抽象：

- `per_bot`
- `per_tier`
- `hybrid`

第一版先预留的字段：

- `plan_id`
- `plan_name`
- `billing_mode`
- `max_bot_count`
- `enabled_money_loops`
- `enabled_ai_features`
- `expire_at`
- `grace_expire_at`
- `entitlement_status`

### 推荐的初始能力分层

- `Free Trial`
- `Basic Bot`
- `Pro Bot`
- `Advanced AI`

## 5. 赚钱项规划

### 5.1 第一期

- `Token Task Pool`
- `Farming / Harvest`
- `Equipment Recovery`

### 5.2 第二期

- `Crafting Profit Loop`
- `Ticket / Lottery Loop`
- `Market Opportunity Scanner`

### 5.3 第三期

- `Cross-loop Optimizer`
- `Capital Allocation Bot`

## 6. AI 决策规划

### 6.1 原则

- 不建议纯 LLM 直接控游戏
- AI 不直接发网络包，不直接发链上交易

### 6.2 推荐的 AI 决策架构

采用：

- `规则引擎 + 评分模型 + AI 顾问层`

决策层分工：

1. `State Layer`
2. `Opportunity Miner`
3. `Policy Engine`
4. `AI Advisor`
5. `Execution Planner`
6. `Safety Guard`

### 6.3 AI 决策输出结构

- `top_opportunity`
- `top_3_ranked_opportunities`
- `why_chosen`
- `why_not_others`
- `expected_profit`
- `expected_duration`
- `risk_level`
- `required_budget`
- `fallback_plan`

### 6.4 AI 决策输入边界

允许：

- Unity 本地缓存与当前场景状态
- Unity 已拿到的任务、背包、钱包、建筑、玩家可见进度
- 链上公开池子数据
- entitlement、套餐、公共配置
- xlsx 静态数值和收益参数

不允许：

- `game-services` 内部私有玩家状态表
- `scene-server` 内部实体快照
- 后台独享且客户端不可见的数据

## 7. 流程与架构

### 7.1 AI 决策流程

`Collect Client State -> Pull Chain/Public State -> Generate Opportunities -> Rule Filters -> Score Engine -> AI Advisor -> Build Execution Plan -> Safety Guard -> Execute in Unity -> Profit Attribution -> Telemetry`

### 7.2 系统架构

`Unity Client + AIBot Panel + Bot Runtime + State Collector + Action Executor + Safety Guard + Bot API + Billing and Entitlement + Strategy Engine + Backtest and Replay + lumiterrator dashboard`

## 8. 进化路线

- `V1: Rule-based Auto Profit`
- `V2: Policy-assisted Optimization`
- `V3: Portfolio-style Yield Bot`
- `V4: Self-improving Bot Platform`

## 9. 开发计划

- `Phase 0: Discovery 与埋点`
- `Phase 1: Bot Runtime Shell`
- `Phase 2: Bot API 与策略服务`
- `Phase 3: Token Task Bot MVP`
- `Phase 4: Farming / Harvest Bot`
- `Phase 5: Equipment Recovery Bot`
- `Phase 6: AI Advisor 与回测系统`
- `Phase 7: 风控与灰度`

## 10. 风控规划

必要介入场景：

- 不执行未知合约动作
- 对疑似高价值或缺少价值判断的回收动作做额外校验
- 不在明显高风险战斗状态下切链上动作
- 玩家手动操作时 bot 让权
- 连续异常失败时优先降级、切换策略或暂停，而不是默认把所有失败都变成立即强停
- entitlement 过期时立即停止收费能力对应的自动化动作
- 宽限期内优先保留低风险动作或观察模式
- 日预算、单动作支出阈值、白名单/黑名单应作为可配置策略，而不是默认锁死所有常规动作
- 对低风险、可重复、可验证的常规收益动作，默认应允许 AI 自主决策执行

## 11. MVP 路径

推荐顺序：

1. `Unity AIBot 面板 + BotRuntime 空壳`
2. `Bot API`
3. `Token Task Bot`
4. `Harvest Bot`
5. `Equipment Recovery Bot`
6. `AI 决策增强`

## 12. 里程碑

- `M1`
  - Unity 内启停 bot
  - 看到 bot 状态和今日收益
  - 自动跑 Token Task
- `M2`
  - 自动跑 Harvest
  - 在任务与收获之间切换
- `M3`
  - 执行 Equipment Recovery
  - 有完整收益归因
- `M4`
  - 有 AI 决策解释
  - 有策略模板
  - 有回放系统

## 13. 最终建议

这件事应该按“官方托管系统”来做，而不是按“外挂脚本”来做。

推荐最终方案：

- Unity 负责实时执行和玩家交互
- Bot API 负责配置、状态、遥测、授权校验
- Strategy Engine 负责 AI 决策和赚钱项排序
- game-services 负责业务执行与校验，但不作为 Bot 的直接状态输入层
- theweb3 + contracts 负责链上收益闭环

补充前提：

- 商业化默认按 `Bot` 收费设计
- entitlement、套餐分层、功能 gating 必须在第一版架构里预留
- 数据面默认采用 `client-observable-first` 原则
- 玩家只做必要介入，不做全程陪跑式审批
