# Chiron x Claw Code — 双击 Ctrl+E 提示词增强

将 Chiron 的提示词增强集成到 [claw-code](https://github.com/instructkr/claw-code)（开源 Claude Code 替代品）中，通过 REPL 中的**双击 Ctrl+E** 触发。

## 工作原理

```
用户在 claw REPL 中输入提示词
         │
         ├── Enter ────────────────► 直接提交
         │
         └── Ctrl+E Ctrl+E ───────► 通过 chiron-enhance 增强
                    │                   （仓库上下文 + 策略检测）
                    │
                    ▼
            增强后的提示词提交给 Claude
```

1. **第一次 Ctrl+E**：清空当前输入（与 Ctrl+C 行为一致）
2. **第二次 Ctrl+E**（500ms 内）：捕获输入文本，通过 `chiron-enhance --inline` 管道增强，然后提交增强版本

## 安装

### 前置条件

- 已克隆并构建 [claw-code](https://github.com/instructkr/claw-code)
- 已安装 [Chiron CLI](../../cli/)，且 `chiron-enhance` 在 PATH 中

### 步骤 1：安装 chiron-enhance

```bash
cd chiron-prompt/cli
npm link
# 验证：
chiron-enhance --help
```

### 步骤 2：应用补丁

```bash
cd /path/to/claw-code
git apply /path/to/chiron-prompt/integrations/claw-code/ctrl-e-enhance.patch
```

### 步骤 3：构建

```bash
cd rust
cargo build --package rusty-claude-cli --release
```

### 步骤 4：运行

```bash
./target/release/claw
# 输入提示词后，快速按两次 Ctrl+E 即可增强
```

## 配置

通过环境变量设置增强后端：

```bash
# 使用 Gemini CLI 重写（默认，推荐）
export CHIRON_ENHANCE_BACKEND=gemini

# 仅使用本地策略检测（不调用 LLM）
export CHIRON_ENHANCE_BACKEND=local
```

## 快捷键参考

| 按键 | 功能 |
|------|------|
| `Enter` | 提交提示词 |
| `Ctrl+C` | 清空输入 / 空输入时退出 |
| `Ctrl+J` / `Shift+Enter` | 插入换行 |
| `Ctrl+E` `Ctrl+E` | 用 Chiron 增强提示词 |

## 许可证

MIT — 与 Chiron 和 claw-code 相同。
