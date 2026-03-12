# Windows Toolchain Forensics — Deployment Notes

---

## Recommended Use

**This package is intentionally split into:**

| File | Purpose |
|------|---------|
| `SKILL.md` | Runtime activation and core behavior |
| `RED-FLAG-INDEX.md` | Rapid triage lookup |
| `PLAYBOOK.md` | Full forensic workflow |
| `BASELINE-ARTIFACT-TEMPLATE.md` | Post-repair standardization |
| `NOTES.md` | Deployment guidance |

---

## Why This Layout Works

- Keeps the skill trigger-safe and focused
- Prevents the main skill prompt from becoming bloated
- Preserves a deep playbook for advanced use
- Makes long-term stabilization part of the workflow
- Enables enterprise policy integration
- Supports mode-based degradation

---

## Agent Host Guidance

### Required Capabilities

**If the host agent supports tools, this skill works best with:**
- Filesystem inspection (read)
- Command execution (optional, enables full functionality)
- File upload/log review
- Optional web/documentation lookup
- Proxy/cert configuration access

### Degraded Operation

**If the host agent does NOT support command execution:**
- The skill MUST remain in INSPECTION mode
- Only reason from user-provided evidence
- Provide clear copy-paste command blocks
- Label all conclusions as inference

### Capability Detection

Host agents should declare capabilities:

```json
{
  "capabilities": {
    "command_execution": true,
    "filesystem_read": true,
    "filesystem_write": false,
    "admin_elevation": false,
    "network_access": true
  }
}
```

The skill will degrade to appropriate mode based on available capabilities.

---

## Enterprise Deployment Notes

### Proxy Configuration

**For corporate environments:**

1. **Detect proxy via multiple methods:**
   - Environment variables (`HTTP_PROXY`, `HTTPS_PROXY`)
   - WinHTTP proxy settings (`netsh winhttp show proxy`)
   - IE/Edge proxy settings (registry)
   - PAC file configuration

2. **Never bypass proxy without explicit approval**

3. **Provide offline alternatives when possible:**
   - Pre-downloaded packages
   - Internal package mirrors
   - Cached installers

### Certificate Handling

**For certificate-pinned environments:**

1. **Check corporate root CAs in certificate store**

2. **Never disable certificate validation**

3. **Use IT-approved package sources only**

4. **Document cert requirements in baseline artifact**

5. **Tool-specific certificate configuration:**
   - **Node.js:** `NODE_EXTRA_CA_CERTS`
   - **Python:** `REQUESTS_CA_BUNDLE`, `SSL_CERT_FILE`
   - **Git:** `http.sslCAInfo` config
   - **npm:** `cafile` config

### Policy Constraints

**For Group Policy / AppLocker / WDAC:**

1. **Detect restrictions early (Stage 1E)**

2. **Do not attempt blocked operations**

3. **Escalate to IT admin paths**

4. **Document constraints in baseline artifact**

5. **Provide user-scope alternatives when possible**

### Privilege Escalation

**For admin-required operations:**

1. **Check current privilege level first**

2. **Propose user-scope alternatives when possible**

3. **Provide clear elevation instructions when required**

4. **Never attempt privilege escalation exploits**

5. **Respect UAC prompts - do not try to bypass**

---

## Observability Requirements

**Host agents SHOULD log:**

| Field | Purpose |
|-------|---------|
| `trace_id` | UUID for the full session |
| `skill_invocation_id` | UUID for this skill call |
| `mode` | INSPECTION/GUIDED/EXECUTION/ENTERPRISE |
| `depth_mode` | triage/standard/deep/baseline-audit |
| `commands_executed` | [{cmd, shell, exit_code, duration_ms}] |
| `evidence_collected` | [{claim, strength, source}] |
| `decisions_made` | [{decision, alternatives_considered, rationale}] |
| `exit_code` | WTF-XXX |
| `handoff_status` | stabilized/blocked/escalate |

**This enables post-hoc red-teaming and representation-similarity analysis of routing decisions.**

---

## Token Budget Management

### Per-Operation Limits

| Operation Type | Max Output Tokens |
|---------------|-------------------|
| Single command output | 5,000 |
| PATH dump | 2,000 |
| Registry enumeration | 3,000 |
| Full diagnostic sweep | 10,000 |

### Truncation Strategy

1. **Count tokens before output**
2. **If exceeds limit:**
   - Truncate to first N entries
   - Summarize remaining as counts
   - Indicate truncation in output
3. **For PATH:**
   - Show first 20 entries
   - Show count of remaining
   - Highlight problematic entries

### Context Compaction

If context window fills:
1. Summarize verified facts
2. Compress evidence to key findings
3. Keep active action list
4. Archive full logs to file reference

---

## Design Principles

**This skill should optimize for:**
- Coherence over maximal tooling
- Verification over confidence
- Quarantine over premature cleanup
- Policy compliance over convenience
- Safe defaults over powerful operations

**Anti-patterns to avoid:**
- Assuming one shell represents all shells
- Trusting package manager state as truth
- Proceeding past stop conditions
- Deleting without quarantine
- Claiming fixes without verification

---

## Versioning & Maintenance

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial shipping release |
| 2.0.0 | 2025-01-16 | Production-ready release with safety enhancements |

### Maintenance Guidelines

- **Update PLAYBOOK.md commands** when Windows/PowerShell versions change
- **Add new Red Flags** when novel fragmentation patterns emerge
- **Keep BASELINE-ARTIFACT-TEMPLATE.md in sync** with SKILL.md outputs
- **Review enterprise constraints quarterly** for policy changes
- **Update exit codes** as new failure patterns are discovered

### Compatibility Matrix

| Windows Version | PowerShell | Tested |
|-----------------|------------|--------|
| Windows 10 21H2+ | 5.1 | YES |
| Windows 10 22H2 | 5.1 | YES |
| Windows 10 | 7.4 | YES |
| Windows 11 22H2 | 5.1 | YES |
| Windows 11 23H2 | 5.1 | YES |
| Windows 11 | 7.4 | YES |
| Windows Server 2019 | 5.1 | YES |
| Windows Server 2022 | 5.1 | YES |

---

## Troubleshooting

### Skill Not Triggering

**Possible causes:**
- Trigger keywords not matching user request
- User request too vague
- Conflicting skill priority

**Solution:**
- Ensure trigger_keywords in YAML frontmatter match common phrasings
- Add more trigger_phrases for edge cases

### Mode Not Enforcing

**Possible causes:**
- Host agent not respecting mode state
- Mode transition logic not explicit enough

**Solution:**
- Add mode checks at the start of every action
- Require explicit "APPROVE" for EXECUTION mode

### Stop Conditions Not Detected

**Possible causes:**
- Commands failing silently
- Detection commands not run
- Enterprise environment differs from tested scenarios

**Solution:**
- Run Stage 1 checks unconditionally
- Add error handling for detection commands
- Log detection attempts even when they fail

### Output Schema Not Parsed

**Possible causes:**
- JSON malformed
- Missing required fields
- Host agent schema mismatch

**Solution:**
- Validate JSON before output
- Include all required fields
- Version the schema with `$schema` field

---

## Integration Examples

### With OpenAI Function Calling

```json
{
  "name": "windows_toolchain_forensics",
  "description": "Diagnose and repair Windows development environment issues. Use when users report tool installation failures, command not found errors, version conflicts, PATH issues, or environment debugging needs.",
  "parameters": {
    "type": "object",
    "properties": {
      "symptom_description": {
        "type": "string",
        "description": "Description of what is failing"
      },
      "failing_command": {
        "type": "string",
        "description": "The command that is failing"
      },
      "shell_context": {
        "type": "string",
        "enum": ["powershell", "cmd", "git-bash", "wsl", "vscode-terminal"],
        "description": "Where the failure occurs"
      },
      "depth_mode": {
        "type": "string",
        "enum": ["triage", "standard", "deep", "baseline-audit"],
        "default": "standard"
      }
    },
    "required": ["symptom_description"]
  }
}
```

### With Anthropic Tool Use

```json
{
  "name": "windows_toolchain_forensics",
  "description": "Forensic debugger for Windows development environments. Diagnoses PATH corruption, toolchain conflicts, agent-induced damage, and enterprise constraints.",
  "input_schema": {
    "type": "object",
    "properties": {
      "symptom_description": {
        "type": "string",
        "description": "What is failing"
      },
      "mode": {
        "type": "string",
        "enum": ["INSPECTION", "GUIDED", "EXECUTION"],
        "default": "INSPECTION",
        "description": "Operational mode - default is safe read-only inspection"
      }
    },
    "required": ["symptom_description"]
  }
}
```

---

## Naming

- **Public name:** `Windows Toolchain Forensics`
- **Short name:** `WTF` (with exit codes WTF-XXX)
- **Subtitle:** `Production-Ready Forensic Debugger for Fragmented Windows Development Environments`
