---
name: windows-toolchain-forensics
description: Diagnose, stabilize, and repair fragmented Windows developer toolchains (PATH conflicts, version manager overlap, shell/editor mismatch, policy/proxy/certificate constraints, and post-agent drift). Use when commands fail unexpectedly, tools resolve inconsistently across contexts, installations "succeed" but binaries fail, or a safe rollback-first remediation plan is required.
---

# Windows Toolchain Forensics

Execute forensic triage for broken Windows development environments using a safety-first, evidence-first workflow.

## Follow these operating rules

1. Start in **INSPECTION** mode (read-only).
2. Treat all claims as untrusted until verified.
3. Check policy and security stop conditions before remediation.
4. Require explicit approval before state-changing commands.
5. Prefer reversible changes, quarantine, and rollback manifests over destructive cleanup.
6. Verify each fix across PowerShell, CMD, and relevant editor/WSL contexts.

## Run this workflow

### 1) Frame the case

- Capture failing command(s), context(s), and expected behavior.
- Capture what changed recently (installer, agent action, policy update, shell profile edits).
- Define a measurable success condition.

### 2) Enforce mode state

Use this state object in responses when remediation is being discussed:

```json
{
  "mode_state": {
    "current_mode": "INSPECTION",
    "pending_changes": [],
    "approved_changes": [],
    "rollback_available": false
  }
}
```

Transition only as follows:

- INSPECTION → GUIDED: user requests proposed changes.
- GUIDED → EXECUTION: user explicitly approves concrete change list.
- Any mode → INSPECTION: failure, timeout, ambiguity, or user cancel.

### 3) Check stop conditions first

Before proposing repair, validate policy/security blockers (execution policy, MOTW/SmartScreen/Defender, AppLocker/WDAC, proxy/cert constraints, privilege limits).

Load `references/RED-FLAG-INDEX.md` for rapid indicator-to-root-cause mapping, then escalate blockers before touching toolchain state.

### 4) Perform layered forensics

Use the full staged procedure in `references/PLAYBOOK.md`.

At minimum, inspect:

- **Layer 0:** policy/security blockers.
- **Layer 1:** PATH and environment precedence.
- **Layer 2:** package manager/shim integrity.
- **Layer 3:** runtime and dependency coherence.
- **Layer 4:** shell/profile/editor injection.
- **Layer 5:** project-local isolation (venv, nvm/fnm/volta, WSL boundaries, repo config).

### 5) Classify evidence in every conclusion

Label findings as:

- **Observed**: direct command/file output.
- **Strong inference**: corroborated signals with no conflict.
- **Weak inference**: plausible but unverified.

Never present inference as fact.

### 6) Produce constrained remediation

When user asks for fixes:

- Propose smallest safe diff first.
- Include rollback steps before execution steps.
- Explicitly list commands that mutate system state.
- Avoid duplicate-installer thrash; remove shadowing causes before reinstalling.

### 7) Verify and harden

After each change:

- Re-run failing command(s) in all affected contexts.
- Confirm selected interpreter/runtime/binary path is canonical.
- Emit residual risks and what was intentionally not changed.

If stabilized, generate a baseline using `references/BASELINE-ARTIFACT-TEMPLATE.md`.

## Use packaged references surgically

- Load `references/RED-FLAG-INDEX.md` for quick triage and stop-doing guidance.
- Load `references/PLAYBOOK.md` for full staged execution details.
- Load `references/BASELINE-ARTIFACT-TEMPLATE.md` at stabilization/handoff time.
- Load `references/NOTES.md` only for deployment and host-capability guidance.
