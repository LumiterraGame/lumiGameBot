-- 一次性建库脚本（可删库后整段重跑）。

-- aibots：一钱包一机器人（主键为钱包地址）
-- bot_name / decision_type / run_status（running|paused|stopped，无 draft）/ description
CREATE TABLE IF NOT EXISTS aibots (
  wallet_address TEXT PRIMARY KEY,
  bot_name TEXT NOT NULL,
  decision_type TEXT NOT NULL,
  run_status TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
