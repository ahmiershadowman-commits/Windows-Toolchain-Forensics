# Windows Toolchain Forensics — Production Ready v2.0

```yaml
---
name: windows-toolchain-forensics
version: 2.0.0
schema_version: agent-skill/2025-01
authors: [forensics-working-group]
last_updated: 2025-01-16
license: MIT

# Capability requirements
requires:
  command_execution: optional
  filesystem_read: optional
  filesystem_write: optional
  network_access: optional
  admin_elevation: optional
  proxy_aware: true

# Risk classification
risk_level: medium
destructive_operations: true
requires_confirmation: [PATH_modify, registry_modify, quarantine, defender_exclusion]

# Compatible host agents
compatible_with:
  - copilot-studio >= 2.1
  - codex-cli >= 1.5
  - openai-agents >= 2.0
  - anthropic-computer-use >= 1.0

# Skill composition
provides_outputs:
  - forensic_snapshot
  - root_cause_ranking
  - recovery_plan
  - baseline_artifact
  - exit_code
  - rollback_manifest

consumes_inputs:
  - symptom_description
  - shell_outputs (optional)
  - prior_agent_claims (optional)
  - enterprise_policy_context (optional)

# Performance characteristics
avg_turns_to_resolution: 5-15
token_budget_estimate: 8k-25k
typical_duration_minutes: 10-45
max_output_tokens_per_operation: 5000

# Tags for discovery
tags:
  - windows
  - forensics
  - toolchain
  - debugging
  - environment-drift
  - agent-recovery
  - enterprise-ready
  - path-repair
  - safe-execution

# Trigger patterns
trigger_keywords:
  - command not found
  - PATH
  - environment variable
  - tool not working
  - installation failed
  - version conflict
  - multiple python
  - node version
  - git not found
  - proxy error
  - certificate error
  - execution policy
  - PowerShell error
  - agent broke my
  - fix my PATH
  - check my environment
  - why is command not found

trigger_phrases:
  - "my tools stopped working"
  - "something broke my environment"
  - "tool X was working before"
  - "agent broke my setup"
  - "multiple versions installed"
  - "wrong python version"
  - "npm permission denied"
  - "WSL not working"
---
```

---

# Windows Toolchain Forensics

**Subtitle:** Production-Ready Forensic Debugger for Fragmented Windows Development Environments

---

## CRITICAL SAFETY PROTOCOL — READ FIRST

> **This skill modifies system state. Read this entire section before proceeding.**

### Mandatory Mode System

This skill operates in **ENFORCED MODES** with strict transitions. The mode system prevents unintended system modifications.

```
+-------------------------------------------------------------------------+
|                         MODE HIERARCHY                                   |
+-------------------------------------------------------------------------+
|  MODE          | Permissions        | Requires              | Default   |
+----------------+--------------------+-----------------------+-----------+
|  INSPECTION    | Read-only          | None                  | YES       |
|  GUIDED        | Propose changes    | User request          | NO        |
|  EXECUTION     | Execute changes    | Explicit approval     | NO        |
|  ENTERPRISE    | Degraded ops       | Policy detection      | NO        |
+----------------+--------------------+-----------------------+-----------+
```

### Mode Transition Rules

| From | To | Trigger | Required |
|------|-----|---------|----------|
| INSPECTION | GUIDED | User requests proposals | Capability verification |
| GUIDED | EXECUTION | User approves change list | Explicit "APPROVE" confirmation |
| Any | INSPECTION | Error, timeout, or user cancel | Automatic |
| Any | ENTERPRISE | Policy constraint detected | Automatic |

### Operations by Mode

**INSPECTION (Default - Always Allowed):**
- PATH analysis
- Binary resolution tracing
- Registry enumeration
- Service status checks
- Environment variable inspection
- Cross-shell validation

**GUIDED (Requires Mode Transition):**
- Propose PATH repairs
- Propose quarantine operations
- Propose configuration changes
- Generate recovery plan

**EXECUTION (Requires Explicit Approval):**
- PATH modifications
- File quarantine
- Registry modifications
- Defender exclusions
- Profile repairs

### Mode Enforcement

```json
{
  "mode_state": {
    "current_mode": "INSPECTION",
    "previous_mode": null,
    "transition_count": 0,
    "pending_changes": [],
    "approved_changes": [],
    "rollback_available": false
  }
}
```

---

## Skill Summary

Windows Toolchain Forensics is a forensic debugging skill for diagnosing, stabilizing, and repairing fragmented Windows development environments where multiple tools, shells, package managers, runtimes, IDEs, version managers, WSL distributions, and prior agents may be conflicting.

**Optimized for:**
- Truth-first investigation
- Cross-shell validation
- Duplicate toolchain detection
- Reversible recovery
- Long-term baseline coherence
- Enterprise policy awareness
- **Safe autonomous execution**

**Not:** A generic installer, cleanup bot, or IT support generalist.

---

## Core Operating Law

> **Observed reality beats intent.**
> **Direct verification beats claims.**
> **Inspection precedes execution.**

**Do NOT treat as proof:**
- Prior agent summaries
- Install logs
- Package manager success messages
- Stale environment variables
- Registry leftovers
- "Should be installed" assumptions
- User narrative alone
- **ANY claim without direct verification**

**Only observable machine evidence counts.**

---

## Evidence Classification (Mandatory)

Every conclusion MUST be labeled as one of:

| Level | Definition | Example |
|-------|------------|---------|
| **Observed** | Direct command output, file content, or smoke test | `python --version` returned 3.11.0 |
| **Strong inference** | Multiple corroborating signals, no contradictions | PATH contains Python path + pip works + py -0p shows it |
| **Weak inference** | Single signal or circumstantial evidence | Registry key suggests install but binary not found |
| **Unknown** | No verifiable signal available | Cannot determine if agent change was applied |

**Always separate:** User narrative | Prior-agent claims | Verified machine facts

---

## Evidence Preference Order

**Strongest to Weakest:**

1. Direct invocation + smoke test
2. Exact resolved executable path
3. Filesystem inspection / file existence
4. Version command output
5. Registry or config evidence
6. Package manager metadata
7. User or prior-agent claims

---

## Complete Failure Layer Model

| Layer | Scope | Examples | Stop Condition |
|-------|-------|----------|----------------|
| **Layer 0** | OS / Policy | UAC, permissions, execution policy, AV/Defender, SmartScreen, MOTW, Developer Mode, enterprise policy, proxy/cert, AppLocker/WDAC, GPO | **YES** |
| **Layer 1** | Shell / PATH | Environment variables, profile scripts, app execution aliases, PATH truncation, long paths | **YES** |
| **Layer 2** | Package Managers | Installers, launchers, shims, WinGet/App Installer registration | **YES** |
| **Layer 3** | Runtimes | SDKs, compilers, language managers | CONDITIONAL |
| **Layer 4** | IDEs | Editors, language servers, terminal integration, workload completeness | CONDITIONAL |
| **Layer 5** | Project | Local overrides, pins, lockfiles, virtual envs, local SDK selection | NO |
| **Layer 6** | Agent Drift | Wrappers, phantom automation residue, false documentation | NO |

**CRITICAL:** The skill MUST identify the highest true breakpoint layer, not just downstream symptoms.

---

## Stop Conditions (Mandatory)

**Halt execution and escalate when ANY of these are present:**

### Layer 0 Stop Conditions (CRITICAL)

| Condition | Detection | Exit Code |
|-----------|-----------|-----------|
| Execution policy blocks all scripts | `Get-ExecutionPolicy -List` shows Restricted | WTF-100 |
| MOTW blocking execution | `Get-Item -Stream Zone.Identifier` returns data | WTF-100 |
| SmartScreen blocking executables | "Windows protected your PC" dialog | WTF-100 |
| Defender actively quarantining | `Get-MpThreatDetection` shows recent threats | WTF-100 |
| AppLocker/WDAC blocking | `Get-AppLockerPolicy -Effective` blocks target | WTF-102 |
| Group Policy restriction | Registry keys under `HKLM\SOFTWARE\Policies` | WTF-702 |
| Proxy blocking HTTPS | `Test-NetConnection` fails on 443 | WTF-700 |
| Certificate pinning active | SSL errors on package manager access | WTF-701 |
| Admin required but unavailable | UAC elevation denied or unavailable | WTF-101 |
| **Developer Mode disabled** (symlink workflows) | `reg query AppModelUnlock` shows 0 | WTF-405 |
| **Long paths not enabled** (260+ char paths) | `LongPathsEnabled` = 0 | WTF-407 |

### Layer 1 Stop Conditions (HIGH)

| Condition | Detection | Exit Code |
|-----------|-----------|-----------|
| PATH corruption or truncation | PATH length > 2048 or malformed | WTF-101 |
| Shell/profile mutation re-breaking | Profile contains destructive mutations | WTF-102 |
| WinGet / App Installer missing | `winget` command not found | WTF-200 |

### When Stop Condition Hit:

1. **STOP** all higher-layer recommendations
2. **REPORT** what is blocked and why
3. **ESCALATE** to appropriate resolution path
4. **DO NOT** proceed with repairs until resolved

---

## Complete Exit Code Taxonomy

### Success Codes (0-99)
| Code | Name | Meaning | Recovery |
|------|------|---------|----------|
| `WTF-000` | Success | Environment stabilized | None |
| `WTF-001` | Partial Success | Stabilized with warnings | Review warnings |

### Input/Authorization Errors (100-199)
| Code | Name | Meaning | Recovery |
|------|------|---------|----------|
| `WTF-100` | ExecutionBlocked | Policy/AV blocking execution | User must elevate or disable |
| `WTF-101` | PATH_Corruption | PATH truncated/malformed | Repair PATH before continuing |
| `WTF-102` | Shell_Drift | Profiles actively re-breaking | Freeze profile edits |
| `WTF-103` | InsufficientPrivileges | Operation requires elevation | Request admin or use user-scope |
| `WTF-104` | FileLocked | Target file in use | Close applications, retry |

### Package Manager Errors (200-299)
| Code | Name | Meaning | Recovery |
|------|------|---------|----------|
| `WTF-200` | WinGet_Missing | App Installer not registered | Install App Installer |
| `WTF-201` | Manager_Conflict | Multiple managers own same ecosystem | Choose canonical manager |
| `WTF-202` | PackageNotFound | Package not in configured sources | Add source or use alternative |
| `WTF-203` | InstallFailed | Package installation failed | Check logs, retry with verbose |

### Runtime Errors (300-399)
| Code | Name | Meaning | Recovery |
|------|------|---------|----------|
| `WTF-300` | Runtime_Shadow | Wrong binary resolving | Quarantine shadowed paths |
| `WTF-301` | Version_Conflict | Multiple versions conflicting | Use version manager |
| `WTF-302` | Dependency_Missing | Required dependency not found | Install dependency |

### IDE Errors (400-499)
| Code | Name | Meaning | Recovery |
|------|------|---------|----------|
| `WTF-400` | IDE_Mismatch | Editor runtime != CLI runtime | Align IDE selection |
| `WTF-401` | Extension_Conflict | Conflicting extensions | Disable conflicting extension |

### Platform Errors (400-499)
| Code | Name | Meaning | Recovery |
|------|------|---------|----------|
| `WTF-400` | MAX_PATH_Exceeded | Path exceeds 260 characters | Enable long paths or use \\?\ |
| `WTF-401` | Symlink_NotPermitted | Symlink creation failed | Enable Developer Mode |
| `WTF-402` | WSL_NotAvailable | WSL not installed or broken | Install/repair WSL |
| `WTF-403` | Docker_NotAvailable | Docker daemon not running | Start Docker Desktop |
| `WTF-404` | GPU_NotAvailable | CUDA/GPU not accessible | Check drivers, WSL GPU config |
| `WTF-405` | DeveloperMode_Required | Developer Mode not enabled | Enable in Windows settings |
| `WTF-406` | UAC_Elevation_Denied | UAC prompt declined | Retry with user confirmation |
| `WTF-407` | LongPath_NotEnabled | Long path support disabled | Enable in registry/GPO |

### Enterprise Errors (700-799)
| Code | Name | Meaning | Recovery |
|------|------|---------|----------|
| `WTF-700` | Proxy_Block | Corporate proxy preventing access | Configure proxy or use offline |
| `WTF-701` | Cert_Pin_Block | Certificate pinning active | Import cert or use alternative |
| `WTF-702` | Policy_Restrict | Group Policy blocking operation | Escalate to IT admin |
| `WTF-703` | AppLocker_Block | AppLocker preventing execution | Request policy exception |

### System Errors (900-999)
| Code | Name | Meaning | Recovery |
|------|------|---------|----------|
| `WTF-600` | Phantom_Claim | Prior agent claim unverifiable | Treat as fiction, re-verify |
| `WTF-900` | Insufficient_Capability | Host lacks required access | Degrade to Guided Mode |
| `WTF-999` | Unknown_Failure | Unrecognized breakage pattern | Escalate to human |

---

## Required Inputs

When possible, gather or infer:

| Input | Priority | Source |
|-------|----------|--------|
| Failing command(s) | REQUIRED | User |
| Shell(s) where failure occurs | REQUIRED | User/Observation |
| Working directory / project path | HIGH | User/Observation |
| Affected ecosystems | HIGH | User/Observation |
| Prior agent changes | MEDIUM | User/Logs |
| Enterprise constraints | MEDIUM | Detection |
| What user needs fixed first | HIGH | User |
| Desired success condition | HIGH | User |

**If inputs are missing, proceed with best-effort forensics rather than stalling.**

---

## Required Output Schema

Every response MUST include this JSON block:

```json
{
  "$schema": "windows-toolchain-forensics/2025-01/output",
  "session_id": "<uuid>",
  "turn_number": 1,
  "mode": "INSPECTION|GUIDED|EXECUTION|ENTERPRISE",
  "depth_mode": "triage|standard|deep|baseline-audit",
  
  "mode_state": {
    "current_mode": "INSPECTION",
    "transition_count": 0,
    "pending_changes": [],
    "approved_changes": [],
    "rollback_available": false
  },
  
  "situation_snapshot": "<string>",
  
  "verified_facts": [
    {
      "claim": "<string>",
      "evidence": "<string>",
      "strength": "observed|strong_inference|weak_inference|unknown"
    }
  ],
  
  "fragmentation_points": ["<string>"],
  
  "root_cause_ranking": [
    {
      "rank": 1,
      "cause": "<string>",
      "layer": "0-6",
      "confidence": "0.0-1.0",
      "stop_condition": "<code|null>"
    }
  ],
  
  "next_actions": [
    {
      "step": 1,
      "action": "<string>",
      "shell": "powershell|cmd|wsl",
      "mode_required": "INSPECTION|GUIDED|EXECUTION",
      "reversible": true,
      "verification": "<command>",
      "risk_level": "low|medium|high|critical"
    }
  ],
  
  "stop_conditions_active": ["<string>"],
  
  "unknowns": ["<string>"],
  
  "definition_of_done": "<string>",
  
  "agent_damage_control": {
    "claimed_changes": ["<string>"],
    "verified_changes": ["<string>"],
    "unverified_claims": ["<string>"],
    "phantom_changes": ["<string>"]
  },
  
  "enterprise_context": {
    "proxy_detected": false,
    "cert_pinning_active": false,
    "execution_policy_blocked": false,
    "applocker_active": false,
    "wdac_active": false,
    "admin_required": false,
    "admin_available": false,
    "developer_mode_enabled": false,
    "long_paths_enabled": false
  },
  
  "platform_context": {
    "wsl_available": false,
    "docker_available": false,
    "cuda_available": false,
    "windows_terminal_available": false
  },
  
  "baseline_artifact_ready": false,
  
  "exit_code": "WTF-000",
  
  "handoff": {
    "status": "stabilized|blocked|escalate",
    "next_recommended_skill": "<string|null>",
    "blocking_layer": null,
    "context_to_pass": {}
  }
}
```

---

## Mandatory Verification Rules

| Rule | Requirement | Enforcement |
|------|-------------|-------------|
| **A** | Never claim a fix was applied unless verified | MANDATORY post-change verification |
| **B** | Never trust one shell | Test in PowerShell, CMD, and relevant shells |
| **C** | Resolve exact paths | Use `Get-Command` and `where.exe` |
| **D** | Do not normalize chaos | If too many overlaps, say that plainly |
| **E** | Do not merge narrative with evidence | Separate sections |
| **F** | Prefer quarantine over deletion | Never delete without quarantine manifest |
| **G** | Stop when foundational layers are broken | Check Layer 0/1 before 3/4/5 |
| **H** | Detect enterprise constraints early | Run Stage 1E first |
| **I** | Verify rollback capability | Create checkpoint before modifications |
| **J** | Require explicit mode transitions | No implicit EXECUTION mode |

---

## Primary Investigation Stages

### Stage 0: Mode Detection and Claim Capture

**DETERMINE MODE:**
- If no command execution capability -> INSPECTION mode
- If enterprise constraints detected -> ENTERPRISE mode
- If user requests proposals -> GUIDED mode (after capability check)
- If user approves changes -> EXECUTION mode

**RECORD:**
- What is failing now
- Where it fails
- What used to work
- Prior agent claims
- Enterprise constraints

### Stage 1: Baseline Machine Context

Run these checks IN ORDER:

#### 1A. OS / Identity / Elevation

```powershell
# Requires: PowerShell 5.1+ or PowerShell 7+
$PSVersionTable
[System.Environment]::OSVersion
whoami
([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

**Check:**
- [ ] OS version/build
- [ ] Admin vs non-admin context
- [ ] PowerShell version

#### 1B. Execution Policy (Layer 0 Stop Condition)

```powershell
Get-ExecutionPolicy -List
```

**STOP if:** MachinePolicy or UserPolicy = Restricted and cannot change.

#### 1C. PATH Snapshot (Layer 1 Check)

```powershell
"=== USER PATH ==="
[Environment]::GetEnvironmentVariable('Path', 'User') -split ';'

"=== MACHINE PATH ==="
[Environment]::GetEnvironmentVariable('Path', 'Machine') -split ';'

"=== CURRENT SESSION PATH ==="
$env:Path -split ';'

"=== PATH LENGTH ==="
$env:Path.Length
```

**Check:**
- [ ] Duplicates
- [ ] Dead paths
- [ ] Malformed entries
- [ ] Excessive length (>2048 = truncation risk)

#### 1D. Developer Mode / Long Paths (Layer 0 Stop Conditions)

```powershell
# Developer Mode
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense

# Long Paths
reg query "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled
```

**STOP if:** Symlink-heavy workflows (pnpm, nvm-windows) and Developer Mode disabled.

#### 1E. Enterprise Constraint Probe (Layer 0 Stop Conditions)

```powershell
# Proxy detection
$env:HTTP_PROXY
$env:HTTPS_PROXY
netsh winhttp show proxy

# AppLocker/WDAC check
Get-AppLockerPolicy -Effective -ErrorAction SilentlyContinue | Select-Object -First 5

# Defender status
Get-MpComputerStatus -ErrorAction SilentlyContinue | Select-Object RealTimeProtectionEnabled, PUAProtection

# Certificate store check
Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Issuer -ne $_.Subject } | Measure-Object
```

**STOP if:** AppLocker blocks target operations or proxy requires authentication not available.

### Stage 2: Platform Availability

```powershell
# WSL
wsl -l -v 2>$null

# Docker
docker version 2>$null

# CUDA
nvidia-smi 2>$null

# Windows Terminal
Get-Command wt -ErrorAction SilentlyContinue
```

### Stage 3: Canonical Command Discovery

**Use both PowerShell resolution and where.exe:**

```powershell
Get-Command python -All -ErrorAction SilentlyContinue
Get-Command py -All -ErrorAction SilentlyContinue
Get-Command node -All -ErrorAction SilentlyContinue
Get-Command npm -All -ErrorAction SilentlyContinue
Get-Command git -All -ErrorAction SilentlyContinue
Get-Command dotnet -All -ErrorAction SilentlyContinue
```

```cmd
where.exe python
where.exe node
where.exe git
where.exe dotnet
```

### Stage 4: Ecosystem Reality Checks

#### Python

```powershell
py -0p
python -V
pip -V
python -c "import sys; print(sys.executable)"
```

#### Node

```powershell
node -v
npm -v
npm config get prefix
```

#### Git

```powershell
git --version
where.exe git
git config --list --show-origin
```

#### .NET

```powershell
dotnet --info
dotnet --list-sdks
dotnet --list-runtimes
```

### Stage 5: Agent Damage Control

**Create four buckets:**

| Bucket | Description |
|--------|-------------|
| **Claimed by Agents** | What prior agents said they changed |
| **Verified on Machine** | What actually exists and runs |
| **Unverified / Contradictory** | Claims without supporting evidence |
| **Likely Phantom Changes** | Claimed changes with no observable artifacts |

---

## Safe Recovery Procedures

### Recovery Hierarchy

```
+-------------------------------------------------------------------------+
|  Recovery Hierarchy (Least to Most Invasive)                            |
+-------------------------------------------------------------------------+
|  1. INSPECTION - Read-only diagnosis                                    |
|  2. ISOLATION - Identify problematic elements without changes           |
|  3. QUARANTINE - Move suspect files to safe location (reversible)       |
|  4. PATH CLEANUP - Remove invalid entries (reversible)                  |
|  5. PROFILE REPAIR - Fix shell init scripts (reversible)                |
|  6. REINSTALL - Only after baseline established                         |
+-------------------------------------------------------------------------+
```

### Pre-Modification Requirements

**BEFORE any EXECUTION mode operation:**

1. **Create Checkpoint**
```json
{
  "checkpoint_id": "<uuid>",
  "timestamp": "<ISO8601>",
  "operation": "<description>",
  "previous_state": {
    "user_path": "<captured>",
    "machine_path": "<captured>",
    "registry_keys": ["<captured>"]
  }
}
```

2. **Verify Pre-Conditions**
- Target exists
- Permissions available
- Not locked by another process

3. **Request Confirmation** (if interactive)
```
+========================================================================+
|                    SYSTEM MODIFICATION WARNING                         |
+========================================================================+
| Operation: <description>                                               |
| Target: <path>                                                         |
| Impact: <description>                                                  |
| Reversible: YES (via checkpoint rollback)                              |
| Risk Level: <LOW|MEDIUM|HIGH|CRITICAL>                                 |
+========================================================================+
| Type 'APPROVE' to proceed, 'CANCEL' to abort                           |
+========================================================================+
```

### Quarantine Procedure

```powershell
function Move-ToQuarantine {
    param($TargetPath, $Reason)
    
    $quarantineDir = "$env:USERPROFILE\WTF_Quarantine\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $quarantineDir -Force | Out-Null
    
    $manifest = @{
        OriginalPath = $TargetPath
        QuarantineTime = Get-Date -Format "o"
        Reason = $Reason
        MachineName = $env:COMPUTERNAME
    }
    
    Move-Item -Path $TargetPath -Destination $quarantineDir -Force
    $manifest | ConvertTo-Json | Out-File "$quarantineDir\manifest.json"
    
    return $quarantineDir
}
```

### Rollback Procedure

```powershell
function Invoke-Rollback {
    param($CheckpointId)
    
    $checkpoint = Get-Checkpoint $CheckpointId
    $previousState = $checkpoint.previous_state
    
    # Restore PATH
    [Environment]::SetEnvironmentVariable("PATH", $previousState.user_path, "User")
    [Environment]::SetEnvironmentVariable("PATH", $previousState.machine_path, "Machine")
    
    # Verify rollback
    $currentPath = $env:PATH
    if ($currentPath -ne $previousState.user_path) {
        throw "Rollback verification failed"
    }
    
    return @{ Success = $true; CheckpointId = $CheckpointId }
}
```

---

## Investigation Depth Modes

| Mode | When to Use | Scope | Typical Turns |
|------|-------------|-------|---------------|
| `triage` | Single symptom, high-confidence pattern | Red Flag Index only | 1-3 |
| `standard` | Multiple symptoms, unclear root cause | Stages 0-5 | 5-10 |
| `deep` | Agent-modified machine, systemic breakage | Full stages | 10-20 |
| `baseline-audit` | Post-repair verification only | Verification commands | 1-2 |

**Default:** `standard`

---

## Success Criteria

This skill is successful when:

- [ ] The blocked project runs in its intended shell/editor context
- [ ] Key tools resolve to expected paths
- [ ] Versions are intentional and documented
- [ ] No critical tool works only by accident in one shell
- [ ] PATH contains no obvious dead or duplicate entries
- [ ] Project-local overrides are understood
- [ ] Stop conditions are resolved before repairs
- [ ] All modifications have rollback capability
- [ ] Baseline artifact documents intentional state

---

## Cross-References

- **Rapid triage:** [RED-FLAG-INDEX.md](./RED-FLAG-INDEX.md)
- **Full procedure:** [PLAYBOOK.md](./PLAYBOOK.md)
- **Baseline template:** [BASELINE-ARTIFACT-TEMPLATE.md](./BASELINE-ARTIFACT-TEMPLATE.md)
- **Deployment notes:** [NOTES.md](./NOTES.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial shipping release |
| 2.0.0 | 2025-01-16 | Production-ready release with safety enhancements |

**Key Changes in v2.0:**
- Added mandatory mode enforcement system
- Added complete failure mode coverage (MAX_PATH, Developer Mode, Docker, CUDA)
- Added Layer 0 stop conditions for enterprise constraints
- Added complete exit code taxonomy (WTF-000 through WTF-999)
- Added pre-modification checkpoint and rollback requirements
- Added token budget management
- Added trigger patterns for skill discovery
- Added structured JSON output schema
- Added risk classification system
- Added mandatory verification rules
