# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `SECURITY.md` with vulnerability reporting policy and response SLAs
- `MAINTAINERS.md` with maintainer info and decision-making process
- GitHub Actions CI workflow with Python linting, testing, and markdown checks
- Comprehensive pytest test suite with 25+ test cases
- `pyproject.toml` for Python package management
- GitHub labels configuration (`.github/labels.yml`)
- Log rotation: automatic compression when logs exceed 1MB (up to 5 backups)
- Expanded secret redaction patterns (15+ patterns including GitHub tokens, AWS keys, JWTs)
- Path validation to prevent directory traversal attacks

### Changed
- README updated with CI badge, Python version badge, and new features
- Project structure updated with new files and directories

### Security
- Added path validation to prevent writing to sensitive directories
- Expanded redaction patterns to cover more secret types
- Added PEM private key detection and redaction

---

## [1.0.0] - 2026-01-12

### Added
- Initial release of Chiron Prompt Enhancer skill
- 7 optimization strategies: Concise, Detailed, Creative, Professional, Analytical, Educational, Action-Oriented
- Agentic execution: Augment → Execute → Deliver → Log pipeline
- Smart auto-detection for strategy selection
- Bilingual support (English/Chinese)
- Optional prompt library logging to `prompt-history/PROMPT_LIBRARY.md`
- Controls: `prompt-only`, `show-spec`, `no-log`

### Based On
- Core optimization strategies adapted from [Axon](https://promptenhenceraxon.top)
