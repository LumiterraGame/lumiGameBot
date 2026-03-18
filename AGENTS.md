# Repository Guidelines

## 项目结构与模块组织
当前仓库仍处于“规划优先”阶段，现有内容集中在 `plans/` 目录，核心文档为 `plans/001_AI真实行为赚钱Bot全局总策略.md`。提交实现代码前，先以该文档作为范围、模块边界和术语定义的依据。

后续落地时，建议按职责拆分目录，例如：`bot-orchestrator/`、`gateway-client-adapter/`、`auth-adapter/`、`world-model/`、`planner/`、`policy-engine/`、`executor/`、`metrics/`。测试文件应与模块同级，或放在模块内的 `tests/` 目录。

## 构建、测试与开发命令
仓库当前没有已提交的统一构建入口，也没有 `package.json`、`Makefile`、`go.mod` 等工程文件。因此本仓库现阶段常用命令主要是查看规划内容：

- `rg --files plans`：快速列出规划文档。
- `sed -n '1,160p' plans/001_AI真实行为赚钱Bot全局总策略.md`：查看主策略文档。

如果你新增可运行模块，必须同时补充该模块的 `build`、`test`、`dev` 命令说明，并同步更新本文件。

## 编码风格与命名规范
目录名使用 kebab-case，例如 `world-model`、`gateway-client-adapter`。模块职责保持单一，不要把策略、执行、风控、钱包逻辑混在同一个包里。

Markdown、YAML、JSON 统一使用 2 空格缩进。代码格式化优先使用各语言官方或主流格式化工具。公开接口名称应表达业务意图，例如 `Planner`、`RiskPolicy`、`WalletSigner`；只有在对齐外部接口时，才直接使用 `loginByMetamask` 这类上游命名。

## 测试要求
当前仓库尚未建立统一测试框架。新增代码时，应按所用语言采用原生主流约定命名测试，如 `*_test.go`、`*.spec.ts`、`test_*.py`。

优先覆盖登录链路、钱包与会话状态、网关协议处理、风控规则、收益计算等高风险逻辑。若暂时无法自动化，PR 中必须写明手工验证步骤和结果。

## 提交与合并请求规范
当前目录下没有可用 Git 历史，因此不要伪造既有提交风格。默认使用简洁的 imperative + scope 格式，例如：`docs: add repo guide`、`planner: define roi scoring interface`。

PR 应包含变更目的、影响模块、验证方式，以及关联的规划文档或任务链接。凡涉及私钥、签名、链上交易、提现或资产流转的改动，必须单独说明风险与保护措施。

## 安全与配置提示
禁止提交私钥、助记词、token、钱包导出文件或真实生产凭据。敏感配置只允许放在本地忽略文件中。任何高风险链上动作都应优先支持 `dry-run`、模拟执行或显式开关控制。
