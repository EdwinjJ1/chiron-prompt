# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously in the Chiron Prompt Enhancer project.

### How to Report

If you discover a security vulnerability, please report it by:

1. **DO NOT** create a public GitHub issue
2. Email the maintainers directly at: edwinj@chiron-prompt.dev
3. Or use GitHub's private vulnerability reporting feature (if enabled)

### What to Include

Please include the following in your report:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 24 hours
  - High: Within 7 days
  - Medium: Within 30 days
  - Low: Next scheduled release

### Security Measures in Place

The Chiron Prompt Enhancer implements several security measures:

1. **Secret Redaction**: Automatically redacts API keys, tokens, and credentials before logging
2. **Input Validation**: Validates all JSON payloads before processing
3. **Fail-Safe Logging**: Refuses to log if secrets are detected after redaction

### Known Security Considerations

- The prompt library log file contains user prompts - ensure appropriate file permissions
- Environment variable `PROMPT_LIBRARY_PATH` should point to a secure location
- Do not commit `prompt-history/PROMPT_LIBRARY.md` to public repositories

## Security Best Practices for Users

1. **File Permissions**: Set appropriate permissions on your prompt library
   ```bash
   chmod 600 prompt-history/PROMPT_LIBRARY.md
   ```

2. **Gitignore**: Add prompt history to your `.gitignore`
   ```
   prompt-history/
   ```

3. **Environment Variables**: Never hardcode sensitive paths in scripts

## Acknowledgments

We appreciate security researchers who help keep Chiron safe. Contributors will be acknowledged here (with permission).

---

Thank you for helping keep Chiron Prompt Enhancer secure!
