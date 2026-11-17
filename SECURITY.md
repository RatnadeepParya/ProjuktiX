# Security Policy

## Supported Versions

Security updates and patches are actively applied to the current main branch:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

The ProjuktiX maintainers take security seriously. If you discover a vulnerability or potential security concern, please **do not open a public GitHub issue**.

Instead, please report security vulnerabilities via GitHub's private vulnerability reporting feature:
1. Navigate to the repository's **Security** tab.
2. Click **Report a vulnerability** to open a confidential advisory.
3. Provide:
   - A detailed description of the vulnerability.
   - Steps to reproduce the issue.
   - Potential impact and affected components.
   - Any suggested mitigations or patches.

You can expect an initial acknowledgment within 48 hours and regular updates on triage and mitigation progress.

---

## Security Architecture Principles

- **Zero-Secret Files**: No persistent `.env` files or hardcoded credentials.
- **Answer Key Isolation**: Client apps never receive evaluation answer keys prior to backend submission.
- **Strict Role-Based Access Control**: All administrative mutations require authenticated and authorized role tokens.
- **Defensive Audits**: Automated CI checks block unapproved secret patterns before merge.
