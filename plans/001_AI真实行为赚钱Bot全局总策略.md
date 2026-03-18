## 时间: 2026-03-18 17:46:03 CST

## 任务: AI真实行为赚钱Bot全局总策略

# 最终任务包

## 目标

定义 AI 真实行为赚钱 Bot 的全局总策略，明确产品最终形态、系统边界、核心能力、阶段路线与关键风险，并把“Bot 行为由 AI（GPT / Claude / 其他模型）驱动”收敛成正式前提，确保后续架构设计、Phase 0 / Phase 1 拆解和实现方向不再摇摆。

## 范围内

- 明确最终产品形态为 `Web 控制台 + Node Agent + Bot Runtime`。
- 明确 Bot 运行在用户指定机器上，统一抽象为 `Node`，覆盖：
  - 本地电脑
  - 用户自己的云服务器
- 明确 `iPad / 手机 / 浏览器` 先作为控制端，而不是正式执行端。
- 明确客户端接入方向为“网关协议优先，客户端兼容”，不把内部 service RPC 误当客户端协议。
- 明确 `Unity client` 的角色是：
  - 协议确认工具
  - 地图/寻路/行为语义参考工具
  - 高保真预览候选 sidecar
- 明确“合成业务”是混合链路，不是单一协议：
  - `已解锁配方` 当前走 game channel 的 `QueryUserRecipe`
  - `排队合成 / 查询 pending merges / 取消 / 提取 / 非同质化材料需求 / token allowance` 当前走客户端 Runtime GraphQL -> `services/graphql-service`
  - 因此 Bot 不能假设所有游戏行为都只经过网关 socket
- 明确 Bot 的行为主导权属于 AI：
  - AI 负责决定“接下来做什么”
  - 确定性 Runtime 负责决定“如何安全执行”
  - 规则和风控是护栏，不是最终行为来源
- 明确 Bot 需要具备的能力：
  - 账号与钱包
  - 世界状态建模
  - 静态知识装载
  - 游戏内执行
  - 链上与经济执行
  - 赚钱决策
  - AI 决策层
  - 拟人化行为层
  - 实时观察与人工接管
  - 多 Agent 协作
  - 风控与可运维
- 明确版本演进方向：
  - `v1` 语义直播
  - `v2` 轻量场景预览
  - `v3` 高保真场景预览
- 明确推荐阶段计划与第一版 MVP 范围。

## 范围外

- 不在本文件中细拆具体协议字段、消息包和 protobuf 对照表。
- 不在本文件中拆到仓库级开发任务、接口级任务或代码改动级任务。
- 不在本文件中决定 Unity sidecar 或专门 renderer 的具体实现方案。
- 不在本文件中决定第一条收益闭环的最终业务选择。

## 任务拆解（按顺序执行）

1. 锁定系统边界，确认 `game-services-v2`、`scene-server-v2`、`unity-client-v2`、`theweb3-v2`、`contracts-monad-v2`、`service-xlsx-tool-v2`、`services` 在方案中的职责。
2. 锁定接入原则，明确 Unity 客户端经由网关接入，`user_agent_module` 只是服务间路由记录，不是客户端入口。
3. 锁定“混合接入矩阵”，明确至少有两类正式客户端链路：
   - game channel / gateway socket
   - runtime GraphQL / `services/graphql-service`
4. 明确产品形态，确定正式方向为 `Web 控制台 + Node Agent + Bot Runtime`。
5. 明确 Bot 的完整能力清单，包括钱包、状态、AI 驱动决策、执行、风控、观察控制和多 Agent 协作。
6. 明确推荐系统结构，包括：
   - `web-control-plane`
   - `node-agent`
   - `bot-runtime`
   - `bot-session-manager`
   - `gateway-client-adapter`
   - `runtime-graphql-adapter`
   - `service-read-adapter`
   - `auth-adapter`
   - `identity-adapter`
   - `web3-adapter`
   - `world-model`
   - `planner`
   - `policy-engine`
   - `liveops-stream`
   - `preview-layer`
   - `simulator`
   - `metrics`
7. 明确产品发布方向，统一以 `Node` 为抽象，不区分“用户本地机器”和“用户自己的云服务器”的产品语义。
8. 明确版本演进：
   - `v1` 先做语义直播和基础人工控制
   - `v2` 再做轻量场景预览
   - `v3` 最后评估高保真预览
9. 明确阶段计划：
   - `Phase 0` 打通协议与状态
   - `Phase 1` 单 Node + 单 Bot MVP
   - `Phase 2` 多 Session 与轻量预览
   - `Phase 3` AI 策略层与拟人化
   - `Phase 4` 高保真观察层与多 Agent 协作
10. 明确第一版 MVP 边界：
   - 1 个 `Node`
   - 1 个 Bot
   - 1 条明确收益链
   - `v1` 级别的可观察、可暂停、可恢复

## 关键依赖（系统/服务/数据）

- `/Users/44alex/work/meland/odyssey-v2/game-services-v2`
  - 用户主数据、任务、天赋、场景切换、网关路由语义、`cli_web3_proxy`
- `/Users/44alex/work/meland/odyssey-v2/scene-server-v2`
  - `world / home / dungeon` 场景运行
- `/Users/44alex/work/meland/odyssey-v2/unity-client-v2`
  - 真实客户端网络层、GraphQL 入口、动作语义参考
  - 合成业务相关动作：
    - `QueryUserRecipeAction`
    - `UseRecipesAction`
    - `GetUserPendingMerges`
    - `CancelMergeWithBatchIdAction`
    - `ExtractMergeWithBatchIdAction`
    - `GetMergeNeedsNonFungibleAction`
    - `GetUserGameTokenAllowanceAction`
    - `GetUserGameInternalTokenAction`
- `/Users/44alex/work/meland/odyssey-v2/theweb3-v2`
  - 链相关聚合能力
- `/Users/44alex/work/meland/odyssey-v2/contracts-monad-v2`
  - 最终经济规则
- `/Users/44alex/work/meland/odyssey-v2/service-xlsx-tool-v2`
  - 静态配置与知识输入源
- `/Users/44alex/work/meland/odyssey-v2/services`
  - `graphql-service`、`user-service`、`backend-common`
  - `loginByMetamask`、`authByMetamask`、`loginByTemporaryToken`
  - `profile`、`getUserWallets`、`web3Profile`
  - 合成业务 GraphQL 入口：
    - `useRecipeMerge2Queue`
    - `getUserPendingMerges`
    - `cancelMergeWithBatchId`
    - `extractMergeWithBatchId`
    - `getMergeNeedsNonFungible`
    - `getUserUnlockedRecipes`
  - `graphql-service/recipe.service` 再通过 Dapr 调 `web3-service` 的：
    - `merge2Queue`
    - `getPendingMerges`
    - `cancelMerge`
    - `extractMerge`
    - `getMergeNeedsNonFungible`
    - `GetUserRecipes`

## 风险与缓解

- 如果误把内部 service RPC 当客户端接入协议，后续实现会偏掉。  
  缓解：坚持“网关协议优先”，后台读接口只做辅助补齐。
- 如果忽略“合成业务”的混合链路，只做 gateway socket，会导致合成、队列查询、取消、提取这条链路缺失。  
  缓解：在架构上显式加入 `runtime-graphql-adapter`，把合成视为混合接入特例。
- 如果把 Unity 当最终执行内核，后面在发布、多开、托管、扩展上会越来越重。  
  缓解：Unity 只作为参考客户端和潜在 sidecar，不作为正式运行时。
- 如果直接让 LLM 控底层动作，成本和不稳定性都会过高。  
  缓解：LLM 只输出结构化计划，执行层只接受受限 DSL。
- 如果把 AI 降级成可选项，最后很容易退化成规则脚本，不符合目标。  
  缓解：从全局策略开始就把“AI 驱动行为”写成正式前提，规则层只做边界与兜底。
- 如果没有静态配置知识库，Bot 无法判断任务、地图、副本和活动的收益性。  
  缓解：把 `service-xlsx-tool-v2` 导出的配置转成可查询索引。
- 如果没有硬风控，提现、交易、质押会放大损失。  
  缓解：预算、白名单、审批、限额、kill switch 一开始就要进入方案。
- 如果把 Web 当执行端，而不是控制端，后面会卡在浏览器权限、保活、长连接和跨设备控制上。  
  缓解：执行端统一落到 `Node Agent`。
- 如果让预览层成为状态真源，后面会出现执行与画面分裂。  
  缓解：`Bot Runtime` 永远是执行真身，`Preview` 永远只消费状态流。

## 验收标准

- 文档明确给出正式产品形态：`Web 控制台 + Node Agent + Bot Runtime`。
- 文档明确给出执行端所在位置：用户指定机器，统一抽象为 `Node`。
- 文档明确写清 `Unity client` 不是最终执行内核。
- 文档明确写清 Bot 的行为由 AI（GPT / Claude / 其他模型）驱动，而不是纯规则脚本。
- 文档明确写清“网关协议优先，客户端兼容”的接入原则。
- 文档明确写清“合成业务”是 game channel + runtime GraphQL 的混合链路。
- 文档明确覆盖 Bot 的完整能力清单，而不是只描述赚钱脚本。
- 文档明确覆盖 `v1 / v2 / v3` 的演进方向。
- 文档明确覆盖 `Phase 0` 到 `Phase 4` 的阶段路线。
- 文档明确覆盖第一版 MVP 边界。
- 文档明确保留实时观察与人工接管能力，不把它降级成可选功能。

## 待确认问题

- 第一条赚钱闭环优先验证哪条：
  - `任务/副本`
  - `equipment recovery`
  - `task pool`
  - `marketplace`
  - `puzzle stake / Lumonad`
- 第一版 headless client 是否直接从协议重写开始，还是先局部复用 Unity 网络层语义。
- 第一版节点端是否默认只支持桌面 / 云服务器，不承诺 iPad 执行。
- 高风险动作是否默认人工审批，例如提现、市场成交、大额质押。
- 第一版实时观察是否只做“语义直播”，暂不承诺高保真渲染。
- 第一版是否把“合成业务”列入 MVP 支持范围，还是先只在 plan 中预埋 `runtime-graphql-adapter`。
