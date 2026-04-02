#!/usr/bin/env bash
# claw-chiron: Install Chiron prompt enhancement into claw-code
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/EdwinjJ1/chiron-prompt/main/integrations/claw-code/install.sh | bash
#   # or:
#   ./install.sh [--install-dir ~/claw-chiron]
#
set -euo pipefail

INSTALL_DIR="${CLAW_CHIRON_DIR:-$HOME/.claw-chiron}"
UPSTREAM_REPO="https://github.com/instructkr/claw-code.git"
BRANCH="main"
PATCH_URL="https://raw.githubusercontent.com/EdwinjJ1/chiron-prompt/main/integrations/claw-code/ctrl-e-enhance.patch"

# Parse args
for arg in "$@"; do
    case "$arg" in
        --install-dir=*) INSTALL_DIR="${arg#*=}" ;;
        --install-dir)   shift; INSTALL_DIR="$1" ;;
        *) echo "Unknown argument: $arg"; exit 1 ;;
    esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[claw-chiron]${NC} $*"; }
ok()    { echo -e "${GREEN}[claw-chiron]${NC} $*"; }
warn()  { echo -e "${YELLOW}[claw-chiron]${NC} $*"; }
error() { echo -e "${RED}[claw-chiron]${NC} $*" >&2; exit 1; }

# ── Preflight checks ─────────────────────────────────────
info "Checking prerequisites..."

command -v git >/dev/null 2>&1    || error "git is required (https://git-scm.com/)"
command -v cargo >/dev/null 2>&1  || error "cargo is required (https://rustup.rs/)"
command -v curl >/dev/null 2>&1   || error "curl is required"

CHIRON_ENHANCE=$(command -v chiron-enhance 2>/dev/null || true)
if [ -z "$CHIRON_ENHANCE" ]; then
    warn "chiron-enhance not found in PATH"
    warn "Install it first:  git clone https://github.com/EdwinjJ1/chiron-prompt.git ~/.chiron && cd ~/.chiron/cli && npm link"
    warn "Continuing anyway — Ctrl+E will fall back to original prompt until chiron-enhance is installed."
fi

# ── Clone or update claw-code ─────────────────────────────
if [ -d "$INSTALL_DIR/claw-code" ]; then
    info "Updating existing claw-code clone..."
    cd "$INSTALL_DIR/claw-code"
    git fetch origin "$BRANCH" || error "Failed to fetch upstream"
    git reset --hard "origin/$BRANCH" || error "Failed to reset to upstream"
else
    info "Cloning claw-code..."
    mkdir -p "$INSTALL_DIR"
    git clone --depth 1 --branch "$BRANCH" "$UPSTREAM_REPO" "$INSTALL_DIR/claw-code" \
        || error "Failed to clone claw-code"
    cd "$INSTALL_DIR/claw-code"
fi

# ── Apply patch ───────────────────────────────────────────
info "Applying Chiron Ctrl+E enhancement patch..."
PATCH_FILE="$INSTALL_DIR/ctrl-e-enhance.patch"
curl -fsSL "$PATCH_URL" -o "$PATCH_FILE" || error "Failed to download patch"

# Try to apply. If it fails (upstream changed), try with offset.
if ! git apply --check "$PATCH_FILE" 2>/dev/null; then
    # Try with more fuzz
    if git apply --check --3way "$PATCH_FILE" 2>/dev/null; then
        git apply --3way "$PATCH_FILE" || error "Patch failed with 3way merge"
    else
        error "Patch does not apply cleanly. Upstream may have changed significantly.
        Check https://github.com/EdwinjJ1/chiron-prompt/issues for updates."
    fi
else
    git apply "$PATCH_FILE" || error "Failed to apply patch"
fi

ok "Patch applied successfully."

# ── Also patch hooks compatibility (new Claude Code settings format) ──
info "Patching hooks compatibility for new settings format..."
HOOKS_FILE="rust/crates/runtime/src/config.rs"
if [ -f "$HOOKS_FILE" ]; then
    # Replace the strict string-array parser with one that skips objects
    sed -i.bak 's/                .iter()\n                .map(|item| {\n                    item.as_str.*//; ' "$HOOKS_FILE" 2>/dev/null || true

    # Use a more reliable approach: patch the optional_string_array function
    if grep -q "must contain only strings" "$HOOKS_FILE"; then
        # Apply the hooks compatibility inline
        python3 -c "
import re, sys
with open('$HOOKS_FILE', 'r') as f:
    content = f.read()

old = '''            array
                .iter()
                .map(|item| {
                    item.as_str().map(ToOwned::to_owned).ok_or_else(|| {
                        ConfigError::Parse(format!(
                            \"{context}: field {key} must contain only strings\"
                        ))
                    })
                })
                .collect::<Result<Vec<_>, _>>()
                .map(Some)'''

new = '''            // Skip non-string entries (e.g. hook objects from newer settings format).
            let strings: Vec<String> = array
                .iter()
                .filter_map(|item| item.as_str().map(ToOwned::to_owned))
                .collect();
            Ok(Some(strings))'''

if old in content:
    content = content.replace(old, new)
    with open('$HOOKS_FILE', 'w') as f:
        f.write(content)
    print('patched')
else:
    print('already_patched_or_changed')
" 2>/dev/null || warn "Could not patch hooks compatibility. You may need to set CLAUDE_CONFIG_HOME."
    fi
fi

# ── Build ─────────────────────────────────────────────────
info "Building claw-code (this may take a few minutes)..."
cd rust
cargo build --package rusty-claude-cli --release 2>&1 | tail -3 \
    || error "Build failed. Check Rust toolchain (rustup.rs)"

BINARY="$INSTALL_DIR/claw-code/rust/target/release/claw"
[ -f "$BINARY" ] || error "Binary not found after build"

ok "Build successful: $BINARY"

# ── Install wrapper script ────────────────────────────────
WRAPPER_BIN="$HOME/.local/bin/claw-chiron"
mkdir -p "$(dirname "$WRAPPER_BIN")"

cat > "$WRAPPER_BIN" << 'WRAPPER_EOF'
#!/usr/bin/env bash
# claw-chiron — claw-code with Chiron Ctrl+E prompt enhancement
set -euo pipefail

CLAW_CHIRON_DIR="${CLAW_CHIRON_DIR:-$HOME/.claw-chiron}"
CLAW_BIN="$CLAW_CHIRON_DIR/claw-code/rust/target/release/claw"

if [ ! -f "$CLAW_BIN" ]; then
    echo "claw-chiron: binary not found. Run the installer again:"
    echo "  curl -fsSL https://raw.githubusercontent.com/EdwinjJ1/chiron-prompt/main/integrations/claw-code/install.sh | bash"
    exit 1
fi

# Forward all arguments to claw
exec "$CLAW_BIN" "$@"
WRAPPER_EOF

chmod +x "$WRAPPER_BIN"

# ── Install update script ─────────────────────────────────
UPDATE_BIN="$HOME/.local/bin/claw-chiron-update"
cat > "$UPDATE_BIN" << UPDATE_EOF
#!/usr/bin/env bash
# claw-chiron-update — re-pull upstream and rebuild
set -euo pipefail
exec "$INSTALL_DIR/claw-code/../../../chiron-prompt/integrations/claw-code/install.sh" "\$@"
UPDATE_EOF
chmod +x "$UPDATE_BIN"

# ── Done ──────────────────────────────────────────────────
echo ""
ok "Installation complete!"
echo ""
echo "  Binary:     $BINARY"
echo "  Launcher:   $WRAPPER_BIN"
echo "  Update:     $UPDATE_BIN"
echo ""
echo "Make sure ~/.local/bin is in your PATH."
echo ""
echo "Quick start:"
echo ""
if [ -n "$CHIRON_ENHANCE" ]; then
    echo "  claw-chiron              # Start with prompt enhancement"
else
    echo "  # First install chiron-enhance:"
    echo "  git clone https://github.com/EdwinjJ1/chiron-prompt.git ~/.chiron"
    echo "  cd ~/.chiron/cli && npm link"
    echo "  claw-chiron              # Then start with prompt enhancement"
fi
echo ""
echo "Inside the REPL:"
echo "  Ctrl+E    Enhance current prompt (requires chiron-enhance)"
echo "  Enter     Submit"
echo "  Ctrl+C    Exit"
