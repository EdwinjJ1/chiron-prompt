# Chiron x Claw Code — Ctrl+E 提示词增强

将 Chiron 的提示词增强集成到 [claw-code](https://github.com/instructkr/claw-code)（开源 Claude Code）中，在 REPL 里按 **Ctrl+E** 即可触发。

## 工作原理

```
用户在 claw REPL 中输入提示词
         │
         ├── Enter ───────► 直接提交
         │
         └── Ctrl+E ──────► 通过 chiron-enhance 增强
                │               （仓库上下文 + 策略检测）
                ▼
        增强后的提示词回填到输入框
        用户可继续编辑 → Enter 提交
```

**单击 Ctrl+E** — 增强后的文本会回填到输入框，用户可以查看和编辑后再提交。

## 一键安装

```bash
curl -fsSL https://raw.githubusercontent.com/EdwinjJ1/chiron-prompt/main/integrations/claw-code/install.sh | bash
```

安装器会：
1. Clone claw-code（或使用已有的 clone，通过 `--claw-dir` 指定）
2. Apply Ctrl+E 增强补丁
3. Cargo build
4. 安装 `claw-chiron` 启动器到 `~/.local/bin/`

### 前置条件

- [Rust](https://rustup.rs/)（`cargo` 在 PATH 中）
- [chiron-enhance](../../cli/)（`npm link` 安装）

```bash
# 先安装 chiron-enhance
git clone https://github.com/EdwinjJ1/chiron-prompt.git ~/.chiron
cd ~/.chiron/cli && npm link
```

### 使用已有的 claw-code clone

```bash
./install.sh --claw-dir /path/to/claw-code
```

### 上游更新后重建

```bash
claw-chiron-update
# 或：
./install.sh --claw-dir /path/to/claw-code --update
```

## 使用

```bash
claw-chiron
```

REPL 内：

| 按键 | 功能 |
|------|------|
| `Enter` | 提交提示词 |
| `Ctrl+E` | 增强提示词，回填到输入框（可继续编辑） |
| `Ctrl+C` | 退出（空输入时） |
| `Ctrl+J` / `Shift+Enter` | 插入换行 |

## 配置

```bash
# 使用 Gemini CLI 重写（默认，推荐）
export CHIRON_ENHANCE_BACKEND=gemini

# 仅使用本地策略检测（不调用 LLM）
export CHIRON_ENHANCE_BACKEND=local
```

## 架构

补丁修改了三个文件：

| 文件 | 改动 |
|------|------|
| `input.rs` | 绑定 Ctrl+E → `Cmd::Interrupt`，捕获输入为 `ReadOutcome::Enhance` |
| `main.rs` | 处理 `Enhance` → 调用 `chiron-enhance --inline` → 用 `readline_with_initial` 回填输入框 |
| `config.rs` | 跳过非字符串 hook 条目（兼容新版 Claude Code settings 格式） |

集成是**松耦合**的 — claw-code 只是把 `chiron-enhance` 当作外部二进制调用。如果未安装，Ctrl+E 会 fallback 提交原文。

## 许可证

MIT — 与 Chiron 和 claw-code 相同。
