## 时间: 2026-03-27 CST

## 任务: AIBot 自动化测试落地方案

# 目标

为 `unity-client-v2` 当前已完成的 AIBot 正式原子，落一套最小可用的自动化测试骨架，支持后续持续扩充。

# 当前已落地内容

## 1. 测试目录

- `Assets/Test/AIBotAutomationShared`
- `Assets/Test/AIBotEditMode`
- `Assets/Test/AIBotPlayMode`
- `Assets/Test/AIBotEditMode/Editor`

## 2. 分层方案

- `AutomationShared`
  - 维护当前已完成正式原子总表
  - 为每个原子标记推荐自动化执行层
- `EditMode`
  - 通过 `Editor/` 目录约定进入 EditMode Test Runner
  - 负责参数校验、失败码、基础合约测试
  - 适合不依赖场景运行态的原子
- `PlayMode`
  - 通过普通测试目录进入 PlayMode Test Runner
  - 负责场景内冒烟测试骨架
  - 当前已覆盖状态门槛分支和最小网络发送链路正向冒烟

## 3. 当前首批自动化用例

- `AIBotAtomAutomationCatalogTests`
  - 校验当前归档原子总数为 `66`
  - 校验原子 id 唯一
  - 校验每个原子都分配了测试层
- `AIBotAtomContractTests`
  - `FishingAtoms` 代表性非法参数 / 未就绪校验
  - `DungeonAtoms` 代表性非法参数 / 未就绪校验
  - `TaskAtoms` 非法参数 / 未就绪校验
  - `TokenTaskAtoms` 非法参数 / 未就绪校验
  - `EquipmentStakeAtoms` 非法参数 / 未就绪校验
- `AIBotPlayModeScaffoldTests`
  - 校验 PlayMode 冒烟原子集合非空
  - 校验 PlayMode 程序集能直接调用代表性原子
  - 使用最小运行态夹具覆盖 `FishingAtoms` / `DungeonAtoms` 的状态门槛分支
  - 使用 `FakeNetworkChannel + NetMessageCenter` 最小夹具覆盖 `EquipmentStakeAtoms`
  - 已有正向冒烟：
    - `query_stake_nft_list`
    - `query_stake_nft_record`
    - `stake_equipment_nfts`
    - `smelt_staked_nfts`
  - 当前正向冒烟断言内容：
    - 原子返回 `success`
    - 请求包真实进入 `NetMsgCenter.SendMsg -> StartSendMsg -> channel.Send`
    - 请求包协议类型、序列号和关键字段正确
    - `query_stake_nft_record` 的响应回调会被触发
    - `stake_equipment_nfts` 会校验背包里的可质押 `BpNftItem` 经过客户端校验后真正发包
    - `smelt_staked_nfts` 会校验基于 `query_stake_nft_list + InitStakeNftList` 建立的快照后真正发包
  - 已有 `TokenTaskAtoms` 正向冒烟：
    - `refresh_token_task_pool`
    - `accept_token_task`
    - `submit_token_task_progress`
    - `receive_token_task_reward`
    - `abandon_token_task`
  - 当前 `TokenTaskAtoms` 冒烟依赖最小 `TaskModel` 注入夹具，直接校验任务池、任务状态和提交物会被正确编码进请求包
  - `receive_token_task_reward` 会复用 fake network 验证真实发包，并通过最小空奖励响应绕开 UI 奖励展示依赖
  - `abandon_token_task` 会注入最小 `DRGameValue(DailyTaskReceiveCD)` 测试表，验证冷却满足后真实发包

# 当前结论

- 这轮先解决“测试框架有没有、覆盖清单有没有、首批可跑用例有没有”。
- 还没有把 `plan009` 的所有人工步骤转换成全量自动化场景。
- 下一轮应优先补：
  - `TaskAtoms`
  - `FishingAtoms` 的正向状态推进
  - `DungeonAtoms` 的正向状态推进

# 后续扩充规则

- 每新增一个正式原子，先补 `AutomationShared` 清单，再补对应测试。
- 能在参数校验层稳定验证的，优先补 `EditMode`。
- 强依赖场景、实体、状态机的，优先补 `PlayMode`。
- 不要再走 `AIBotPanelController` 按钮点击做自动化入口，直接调原子接口。
