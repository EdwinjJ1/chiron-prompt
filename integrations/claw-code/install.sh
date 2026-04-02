#!/usr/bin/env bash
# claw-chiron: Add Chiron Ctrl+E prompt enhancement to claw-code
#
# Usage:
#   # Fresh install:
#   curl -fsSL https://raw.githubusercontent.com/EdwinjJ1/chiron-prompt/main/integrations/claw-code/install.sh | bash
#
#   # Use existing claw-code clone:
#   ./install.sh --claw-dir /path/to/claw-code
#
#   # Update (re-run after upstream changes):
#   ./install.sh --claw-dir /path/to/claw-code --update
#
set -euo pipefail

CLAW_DIR=""
INSTALL_DIR="${HOME}/.claw-chiron"
UPSTREAM_REPO="https://github.com/instructkr/claw-code.git"
PATCH_URL="https://raw.githubusercontent.com/EdwinjJ1/chiron-prompt/main/integrations/claw-code/ctrl-e-enhance.patch"
DO_UPDATE=false

for arg in "$@"; do
    case "$arg" in
        --claw-dir=*)   CLAW_DIR="${arg#*=}" ;;
        --claw-dir)     shift; CLAW_DIR="$1" ;;
        --update)       DO_UPDATE=true ;;
        --install-dir=*) INSTALL_DIR="${arg#*=}" ;;
        *) echo "Usage: $0 [--claw-dir /path/to/claw-code] [--update]"; exit 1 ;;
    esac
done

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[claw-chiron]${NC} $*"; }
ok()    { echo -e "${GREEN}[claw-chiron]${NC} $*"; }
warn()  { echo -e "${YELLOW}[claw-chiron]${NC} $*"; }
die()   { echo -e "${RED}[claw-chiron]${NC} $*" >&2; exit 1; }

# ── Preflight ──────────────────────────────────────────────
info "Checking prerequisites..."
command -v git >/dev/null   || die "git not found"
command -v cargo >/dev/null || die "cargo not found (install from https://rustup.rs)"
command -v curl >/dev/null  || die "curl not found"

# ── Locate or clone claw-code ──────────────────────────────
if [ -n "$CLAW_DIR" ]; then
    # User specified an existing clone
    [ -d "$CLAW_DIR/.git" ] || die "$CLAW_DIR is not a git repo"
    CLAW_DIR="$(cd "$CLAW_DIR" && pwd)"
    info "Using existing claw-code at: $CLAW_DIR"
elif [ -d "$INSTALL_DIR/claw-code/.git" ]; then
    CLAW_DIR="$INSTALL_DIR/claw-code"
    info "Found previous clone at: $CLAW_DIR"
else
    info "Cloning claw-code..."
    mkdir -p "$INSTALL_DIR"
    git clone --depth 1 "$UPSTREAM_REPO" "$INSTALL_DIR/claw-code" || die "Clone failed"
    CLAW_DIR="$INSTALL_DIR/claw-code"
fi

cd "$CLAW_DIR"

# ── Update if requested ────────────────────────────────────
if $DO_UPDATE || [ -n "$CLAW_DIR" ]; then
    info "Pulling latest upstream..."
    git fetch origin main 2>/dev/null || true
    git checkout main 2>/dev/null || true
    git reset --hard origin/main 2>/dev/null || warn "Could not reset to origin/main (may be local changes)"
fi

# ── Download and apply patch ────────────────────────────────
info "Downloading patch..."
PATCH_FILE="$INSTALL_DIR/ctrl-e-enhance.patch"
curl -fsSL "$PATCH_URL" -o "$PATCH_FILE" || die "Failed to download patch"

info "Applying Ctrl+E enhancement patch..."
if git apply --check "$PATCH_FILE" 2>/dev/null; then
    git apply "$PATCH_FILE" || die "Patch apply failed"
elif git apply --check --3way "$PATCH_FILE" 2>/dev/null; then
    git apply --3way "$PATCH_FILE" || die "3way merge failed"
else
    die "Patch conflicts with upstream. Check for updates at:
    https://github.com/EdwinjJ1/chiron-prompt/issues"
fi
ok "Patch applied."

# ── Patch hooks compatibility (new settings format) ─────────
CONFIG_FILE="rust/crates/runtime/src/config.rs"
if [ -f "$CONFIG_FILE" ] && grep -q "must contain only strings" "$CONFIG_FILE"; then
    info "Patching hooks compatibility for new Claude Code settings format..."
    # Replace strict string-only parser with one that silently skips objects
    if command -v python3 >/dev/null; then
        python3 - "$CONFIG_FILE" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f:
    c = f.read()
old = """            array
                .iter()
                .map(|item| {
                    item.as_str().map(ToOwned::to_owned).ok_or_else(|| {
                        ConfigError::Parse(format!(
                            "{context}: field {key} must contain only strings"
                        ))
                    })
                })
                .collect::<Result<Vec<_>, _>>()
                .map(Some)"""
new = """            // Skip non-string entries (e.g. hook objects from newer settings).
            let strings: Vec<String> = array
                .iter()
                .filter_map(|item| item.as_str().map(ToOwned::to_owned))
                .collect();
            Ok(Some(strings))"""
if old in c:
    c = c.replace(old, new)
    with open(path, 'w') as f:
        f.write(c)
    print("patched")
else:
    print("already_patched")
PYEOF
    fi
fi

# ── Build ──────────────────────────────────────────────────
info "Building claw-code (first build may take a few minutes)..."
cd rust
cargo build --package rusty-claude-cli --release 2>&1 | tail -3 || die "Build failed"
cd ..

BINARY="$CLAW_DIR/rust/target/release/claw"
[ -f "$BINARY" ] || die "Binary not found after build"
ok "Build complete: $BINARY"

# ── Install wrapper ────────────────────────────────────────
WRAPPER="$HOME/.local/bin/claw-chiron"
mkdir -p "$(dirname "$WRAPPER")"

cat > "$WRAPPER" << EOF
#!/usr/bin/env bash
# claw-chiron — claw-code with Chiron Ctrl+E prompt enhancement
set -euo pipefail
exec "$BINARY" "\$@"
EOF
chmod +x "$WRAPPER"

# ── Install updater ────────────────────────────────────────
UPDATER="$HOME/.local/bin/claw-chiron-update"
mkdir -p "$(dirname "$UPDATER")"

cat > "$UPDATER" << EOF
#!/usr/bin/env bash
# claw-chiron-update — pull upstream and rebuild
set -euo pipefail
exec "$0" --claw-dir "$CLAW_DIR" --update "\$@"
EOF
chmod +x "$UPDATER"

# ── Done ───────────────────────────────────────────────────
echo ""
ok "Done!"
echo ""
echo "  Binary:   $BINARY"
echo "  Launcher: $WRAPPER"
echo "  Updater:  $UPDATER"
echo ""
if ! command -v chiron-enhance >/dev/null 2>&1; then
    warn "chiron-enhance not in PATH. Install it first:"
    echo ""
    echo "    git clone https://github.com/EdwinjJ1/chiron-prompt.git ~/.chiron"
    echo "    cd ~/.chiron/cli && npm link"
    echo ""
fi
echo "Usage:"
echo "  claw-chiron            Start REPL with Ctrl+E enhancement"
echo "  claw-chiron-update     Re-pull upstream and rebuild"
