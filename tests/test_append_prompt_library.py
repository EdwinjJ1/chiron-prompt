"""Tests for append_prompt_library.py."""

import gzip
import json
import os
import sys
import tempfile
from unittest import mock

import pytest

# Add the scripts directory to the path
sys.path.insert(
    0,
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".claude",
        "skills",
        "prompt-enhancer",
        "scripts",
    ),
)

from append_prompt_library import (
    MAX_BACKUP_COUNT,
    MAX_FIELD_LENGTH,
    MAX_LOG_SIZE_BYTES,
    ensure_list_of_strings,
    entry_markdown,
    read_payload,
    redact,
    rotate_log_if_needed,
    truncate,
    validate_library_path,
)


class TestTruncate:
    """Tests for the truncate function."""

    def test_short_text_unchanged(self):
        text = "Short text"
        assert truncate(text, max_len=100) == text

    def test_exact_length_unchanged(self):
        text = "x" * 100
        assert truncate(text, max_len=100) == text

    def test_truncation_adds_suffix(self):
        text = "x" * 150
        truncated = truncate(text, max_len=100)
        assert len(truncated) == 100 + len("\n... [TRUNCATED]")
        assert truncated.startswith("x" * 100)
        assert truncated.endswith("\n... [TRUNCATED]")

    def test_default_max_len(self):
        text = "x" * (MAX_FIELD_LENGTH + 100)
        truncated = truncate(text)
        assert len(truncated) == MAX_FIELD_LENGTH + len("\n... [TRUNCATED]")


class TestRedact:
    """Tests for the redact function."""

    def test_redact_openai_key(self):
        text = "my key is sk-1234567890abcdef"
        assert "sk-[REDACTED]" in redact(text)
        assert "1234567890" not in redact(text)

    def test_redact_github_token_ghp(self):
        text = "token: ghp_abcdefghijklmnopqrstuvwxyz1234567890"
        assert "ghp_[REDACTED]" in redact(text)

    def test_redact_github_token_gho(self):
        text = "token: gho_abcdefghijklmnopqrstuvwxyz1234567890"
        assert "gho_[REDACTED]" in redact(text)

    def test_redact_aws_access_key(self):
        text = "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE"
        assert "AKIA[REDACTED]" in redact(text)

    def test_redact_google_api_key(self):
        text = "api_key: AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe"
        assert "AIza[REDACTED]" in redact(text)

    def test_redact_anthropic_key(self):
        text = "ANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890abcd"
        assert "sk-ant-[REDACTED]" in redact(text)

    def test_redact_slack_token(self):
        text = "SLACK_TOKEN=xoxb-EXAMPLE-TOKEN-12345"
        assert "xox[REDACTED]" in redact(text)

    def test_redact_bearer_token(self):
        text = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        assert "Authorization: Bearer [REDACTED]" in redact(text)

    def test_redact_password(self):
        text = 'password = "mysecretpassword123"'
        assert 'password="[REDACTED]"' in redact(text)

    def test_redact_mongodb_uri(self):
        text = "mongodb+srv://user:pass@cluster.mongodb.net/db"
        assert "mongodb://[REDACTED]" in redact(text)

    def test_redact_postgres_uri(self):
        text = "postgres://user:pass@localhost:5432/mydb"
        assert "[DATABASE_URL_REDACTED]" in redact(text)

    def test_redact_jwt(self):
        text = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        assert "[JWT_REDACTED]" in redact(text)

    def test_redact_private_key(self):
        text = """-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...
-----END PRIVATE KEY-----"""
        assert "[PRIVATE_KEY_REDACTED]" in redact(text)

    def test_no_redaction_for_safe_text(self):
        text = "This is a normal prompt with no secrets"
        assert redact(text) == text


class TestEnsureListOfStrings:
    """Tests for ensure_list_of_strings function."""

    def test_valid_list(self):
        assert ensure_list_of_strings(["a", "b", "c"], "test") == ["a", "b", "c"]

    def test_none_returns_empty_list(self):
        assert ensure_list_of_strings(None, "test") == []

    def test_invalid_type_string(self):
        with pytest.raises(SystemExit):
            ensure_list_of_strings("not a list", "test")

    def test_invalid_type_int(self):
        with pytest.raises(SystemExit):
            ensure_list_of_strings(123, "test")

    def test_list_with_non_strings(self):
        with pytest.raises(SystemExit):
            ensure_list_of_strings(["a", 1, "b"], "test")


class TestEntryMarkdown:
    """Tests for entry_markdown function."""

    def test_basic_entry(self):
        result = entry_markdown(
            timestamp="2024-01-01T00:00:00Z",
            original_request="Write a function",
            upgrade_summary=["Added type hints", "Added docstring"],
            augmented_spec="def func(): pass",
            artifacts=["main.py"],
            result_summary="Created function",
        )
        assert "## 2024-01-01T00:00:00Z" in result
        assert "Write a function" in result
        assert "Added type hints" in result
        assert "main.py" in result
        assert "Created function" in result

    def test_entry_with_secrets_fails(self):
        with pytest.raises(SystemExit) as exc_info:
            entry_markdown(
                timestamp="2024-01-01T00:00:00Z",
                original_request="My API key is sk-live-notaredacted",
                upgrade_summary=[],
                augmented_spec="",
                artifacts=[],
                result_summary="",
            )
        assert "secret detected" in str(exc_info.value).lower()

    def test_entry_with_github_token_fails(self):
        with pytest.raises(SystemExit) as exc_info:
            entry_markdown(
                timestamp="2024-01-01T00:00:00Z",
                original_request="token ghp_shorttoken",
                upgrade_summary=[],
                augmented_spec="",
                artifacts=[],
                result_summary="",
            )
        assert "secret detected" in str(exc_info.value).lower()

    def test_entry_with_redacted_prefix_passes(self):
        """Redacted tokens like ghp_[REDACTED] should not trigger rejection."""
        result = entry_markdown(
            timestamp="2024-01-01T00:00:00Z",
            original_request="token: ghp_abcdefghijklmnopqrstuvwxyz1234567890",
            upgrade_summary=[],
            augmented_spec="",
            artifacts=[],
            result_summary="",
        )
        assert "ghp_[REDACTED]" in result

    def test_empty_optional_fields(self):
        result = entry_markdown(
            timestamp="2024-01-01T00:00:00Z",
            original_request="Test request",
            upgrade_summary=[],
            augmented_spec="",
            artifacts=[],
            result_summary="",
        )
        assert "Test request" in result
        assert "**Upgrade summary**" not in result
        assert "**Artifacts**" not in result


class TestReadPayload:
    """Tests for read_payload function."""

    def test_valid_json(self):
        payload = '{"key": "value"}'
        with mock.patch("sys.stdin.read", return_value=payload):
            result = read_payload()
            assert result == {"key": "value"}

    def test_empty_stdin(self):
        with mock.patch("sys.stdin.read", return_value=""):
            with pytest.raises(SystemExit) as exc_info:
                read_payload()
            assert "No JSON payload" in str(exc_info.value)

    def test_invalid_json(self):
        with mock.patch("sys.stdin.read", return_value="{not valid json}"):
            with pytest.raises(SystemExit) as exc_info:
                read_payload()
            assert "Invalid JSON" in str(exc_info.value)

    def test_non_object_json(self):
        with mock.patch("sys.stdin.read", return_value='["array"]'):
            with pytest.raises(SystemExit) as exc_info:
                read_payload()
            assert "must be a JSON object" in str(exc_info.value)


class TestValidateLibraryPath:
    """Tests for validate_library_path function."""

    def test_valid_path_in_cwd(self):
        # Use home directory subdirectory to avoid macOS /var symlink issues
        home = os.path.expanduser("~")
        test_dir = os.path.join(home, ".chiron-test-temp")
        os.makedirs(test_dir, exist_ok=True)
        try:
            with mock.patch("os.getcwd", return_value=test_dir):
                path = os.path.join(test_dir, "prompt-history", "PROMPT_LIBRARY.md")
                result = validate_library_path(path)
                assert result == os.path.realpath(path)
        finally:
            os.rmdir(test_dir)

    def test_valid_path_in_home(self):
        home = os.path.expanduser("~")
        path = os.path.join(home, "test-prompt-library.md")
        result = validate_library_path(path)
        assert result == os.path.realpath(path)

    def test_invalid_path_outside_boundaries(self):
        with mock.patch("os.getcwd", return_value="/some/project"):
            with pytest.raises(SystemExit) as exc_info:
                validate_library_path("/other/location/file.md")
            assert "must be under project root or home directory" in str(exc_info.value)

    def test_sensitive_ssh_directory(self):
        home = os.path.expanduser("~")
        with pytest.raises(SystemExit) as exc_info:
            validate_library_path(os.path.join(home, ".ssh", "test.md"))
        assert "sensitive directory" in str(exc_info.value)


class TestRotateLogIfNeeded:
    """Tests for rotate_log_if_needed function."""

    def test_no_rotation_for_small_file(self):
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            f.write("Small content")
            path = f.name

        try:
            rotate_log_if_needed(path)
            # File should still exist and not be rotated
            assert os.path.exists(path)
            assert not os.path.exists(f"{path}.1.gz")
        finally:
            os.unlink(path)

    def test_no_rotation_for_nonexistent_file(self):
        # Should not raise any error
        rotate_log_if_needed("/nonexistent/path/file.md")

    def test_rotation_for_large_file(self):
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            # Write more than MAX_LOG_SIZE_BYTES
            f.write("x" * (MAX_LOG_SIZE_BYTES + 1000))
            path = f.name

        try:
            rotate_log_if_needed(path)

            # Original file should be reset with header
            assert os.path.exists(path)
            with open(path) as f:
                content = f.read()
                assert "# PROMPT LIBRARY" in content
                assert "Log rotated at" in content

            # Backup should exist and be compressed
            backup_path = f"{path}.1.gz"
            assert os.path.exists(backup_path)

            # Verify backup contains original content
            with gzip.open(backup_path, "rt") as f:
                backup_content = f.read()
                assert "x" * 100 in backup_content

        finally:
            os.unlink(path)
            if os.path.exists(f"{path}.1.gz"):
                os.unlink(f"{path}.1.gz")

    def test_backup_rotation(self):
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as f:
            path = f.name

        try:
            # Create existing backups
            for i in range(1, 4):
                backup_path = f"{path}.{i}.gz"
                with gzip.open(backup_path, "wt") as gz:
                    gz.write(f"Backup {i}")

            # Write large content to trigger rotation
            with open(path, "w") as f:
                f.write("y" * (MAX_LOG_SIZE_BYTES + 1000))

            rotate_log_if_needed(path)

            # Check that backups were shifted
            assert os.path.exists(f"{path}.1.gz")  # New backup
            assert os.path.exists(f"{path}.2.gz")  # Previously .1.gz
            assert os.path.exists(f"{path}.3.gz")  # Previously .2.gz
            assert os.path.exists(f"{path}.4.gz")  # Previously .3.gz

            # Verify the new backup contains the rotated content
            with gzip.open(f"{path}.1.gz", "rt") as gz:
                content = gz.read()
                assert "y" in content

        finally:
            os.unlink(path)
            for i in range(1, MAX_BACKUP_COUNT + 1):
                backup = f"{path}.{i}.gz"
                if os.path.exists(backup):
                    os.unlink(backup)
