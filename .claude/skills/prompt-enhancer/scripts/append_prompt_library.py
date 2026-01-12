#!/usr/bin/env python3

import datetime
import json
import os
import re
import sys
from typing import Any


REDACT_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    # OpenAI API keys
    (re.compile(r"sk-[A-Za-z0-9]{10,}"), "sk-[REDACTED]"),
    # Generic API key assignments
    (re.compile(r"(?i)api_key\s*=\s*['\"][^'\"]+['\"]"), 'api_key="[REDACTED]"'),
    # Bearer tokens
    (
        re.compile(r"(?i)authorization\s*:\s*bearer\s+\S+"),
        "Authorization: Bearer [REDACTED]",
    ),
    # GitHub tokens (ghp_, gho_, ghu_, ghs_, ghat_)
    (re.compile(r"ghp_[A-Za-z0-9]{36,}"), "ghp_[REDACTED]"),
    (re.compile(r"gho_[A-Za-z0-9]{36,}"), "gho_[REDACTED]"),
    (re.compile(r"ghu_[A-Za-z0-9]{36,}"), "ghu_[REDACTED]"),
    (re.compile(r"ghs_[A-Za-z0-9]{36,}"), "ghs_[REDACTED]"),
    (re.compile(r"ghat_[A-Za-z0-9]{36,}"), "ghat_[REDACTED]"),
    # AWS Access Key IDs
    (re.compile(r"AKIA[A-Z0-9]{16}"), "AKIA[REDACTED]"),
    # AWS Secret Access Keys (40 char base64)
    (re.compile(r"(?i)aws_secret_access_key\s*=\s*['\"][^'\"]{40}['\"]"), 'aws_secret_access_key="[REDACTED]"'),
    # Google API keys
    (re.compile(r"AIza[A-Za-z0-9_-]{35}"), "AIza[REDACTED]"),
    # Anthropic API keys
    (re.compile(r"sk-ant-[A-Za-z0-9_-]{40,}"), "sk-ant-[REDACTED]"),
    # Slack tokens
    (re.compile(r"xox[baprs]-[A-Za-z0-9-]+"), "xox[REDACTED]"),
    # Generic password patterns
    (re.compile(r"(?i)password\s*=\s*['\"][^'\"]+['\"]"), 'password="[REDACTED]"'),
    # MongoDB connection strings
    (re.compile(r"mongodb(\+srv)?://[^\s]+"), "mongodb://[REDACTED]"),
    # PostgreSQL/MySQL connection strings
    (re.compile(r"(?i)(postgres|mysql|mariadb)://[^\s]+"), "[DATABASE_URL_REDACTED]"),
    # Private keys (PEM format)
    (re.compile(r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----"), "[PRIVATE_KEY_REDACTED]"),
    # JWT tokens (basic pattern)
    (re.compile(r"eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*"), "[JWT_REDACTED]"),
]


def redact(text: str) -> str:
    redacted = text
    for pattern, replacement in REDACT_PATTERNS:
        redacted = pattern.sub(replacement, redacted)
    return redacted


def read_payload() -> dict[str, Any]:
    raw = sys.stdin.read()
    if not raw.strip():
        raise SystemExit("No JSON payload provided on stdin")

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON payload: {exc}")

    if not isinstance(payload, dict):
        raise SystemExit("Payload must be a JSON object")

    return payload


def ensure_list_of_strings(value: Any, field: str) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list) or not all(isinstance(x, str) for x in value):
        raise SystemExit(f"Field '{field}' must be an array of strings")
    return value


def entry_markdown(
    *,
    timestamp: str,
    original_request: str,
    upgrade_summary: list[str],
    augmented_spec: str,
    artifacts: list[str],
    result_summary: str,
) -> str:
    safe_original = redact(original_request).strip()
    safe_spec = redact(augmented_spec).strip()
    safe_result = redact(result_summary).strip()

    if "sk-" in safe_original or "sk-" in safe_spec or "sk-" in safe_result:
        raise SystemExit("Potential secret detected after redaction; refusing to log")

    lines: list[str] = []
    lines.append(f"## {timestamp}")
    lines.append("")

    lines.append("**Original request**")
    lines.append("```")
    lines.append(safe_original)
    lines.append("```")
    lines.append("")

    if upgrade_summary:
        lines.append("**Upgrade summary**")
        for item in upgrade_summary:
            lines.append(f"- {redact(item).strip()}")
        lines.append("")

    if artifacts:
        lines.append("**Artifacts**")
        for path in artifacts:
            lines.append(f"- `{redact(path).strip()}`")
        lines.append("")

    if safe_result:
        lines.append("**Result summary**")
        lines.append(safe_result)
        lines.append("")

    if safe_spec:
        lines.append("<details>")
        lines.append("<summary><strong>Augmented spec</strong></summary>")
        lines.append("")
        lines.append("```")
        lines.append(safe_spec)
        lines.append("```")
        lines.append("")
        lines.append("</details>")
        lines.append("")

    lines.append("---")
    lines.append("")

    return "\n".join(lines)


def validate_library_path(path: str) -> str:
    """Validate that the library path is safe and within allowed boundaries."""
    # Resolve to absolute path
    resolved = os.path.realpath(path)

    # Get allowed base directories
    cwd = os.path.realpath(os.getcwd())
    home = os.path.realpath(os.path.expanduser("~"))

    # Check if path is under current working directory or home directory
    if not (resolved.startswith(cwd) or resolved.startswith(home)):
        raise SystemExit(
            f"Library path must be under project root or home directory. "
            f"Got: {resolved}"
        )

    # Prevent writing to sensitive locations
    sensitive_dirs = [
        "/etc", "/usr", "/bin", "/sbin", "/var", "/tmp",
        os.path.join(home, ".ssh"),
        os.path.join(home, ".gnupg"),
        os.path.join(home, ".aws"),
    ]
    for sensitive in sensitive_dirs:
        if resolved.startswith(os.path.realpath(sensitive)):
            raise SystemExit(f"Cannot write to sensitive directory: {sensitive}")

    return resolved


def main() -> None:
    library_path = os.environ.get("PROMPT_LIBRARY_PATH")
    if not library_path:
        raise SystemExit("PROMPT_LIBRARY_PATH env var is required")

    # Validate path before use
    library_path = validate_library_path(library_path)

    payload = read_payload()

    timestamp = payload.get("timestamp")
    if not isinstance(timestamp, str) or not timestamp.strip():
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat(
            timespec="seconds"
        )

    original_request = payload.get("original_request")
    if not isinstance(original_request, str) or not original_request.strip():
        raise SystemExit("Field 'original_request' is required")

    upgrade_summary = ensure_list_of_strings(
        payload.get("upgrade_summary"), "upgrade_summary"
    )
    augmented_spec = payload.get("augmented_spec")
    if augmented_spec is None:
        augmented_spec = ""
    if not isinstance(augmented_spec, str):
        raise SystemExit("Field 'augmented_spec' must be a string")

    artifacts = ensure_list_of_strings(payload.get("artifacts"), "artifacts")

    result_summary = payload.get("result_summary")
    if result_summary is None:
        result_summary = ""
    if not isinstance(result_summary, str):
        raise SystemExit("Field 'result_summary' must be a string")

    os.makedirs(os.path.dirname(library_path), exist_ok=True)

    if not os.path.exists(library_path):
        with open(library_path, "w", encoding="utf-8") as f:
            f.write("# PROMPT LIBRARY\n\n")
            f.write("> Auto-generated by the Prompt Enhancer skill.\n")
            f.write("> Use `no-log` in your request to disable logging.\n\n")
            f.write("---\n\n")

    entry = entry_markdown(
        timestamp=timestamp,
        original_request=original_request,
        upgrade_summary=upgrade_summary,
        augmented_spec=augmented_spec,
        artifacts=artifacts,
        result_summary=result_summary,
    )

    with open(library_path, "a", encoding="utf-8") as f:
        f.write(entry)


if __name__ == "__main__":
    main()
