# Windows Toolchain Forensics — Executable Debugging Playbook

**This appendix is the full staged procedure for auditing and stabilizing a fragmented Windows development machine.**

---

## Playbook Rules

| Rule | Requirement |
|------|-------------|
| 1 | **MODE ENFORCEMENT**: Operate in INSPECTION mode by default; require explicit transition for modifications |
| 2 | **STOP CONDITIONS**: Check Layer 0 stop conditions before any repair attempts |
| 3 | **VERIFICATION**: Verify every claim before accepting it; verify every change after making it |
| 4 | **ROLLBACK**: Create checkpoint before any EXECUTION mode operation |
| 5 | **QUARANTINE**: Prefer quarantine over deletion |
| 6 | **CROSS-SHELL**: Never trust one shell; test in PowerShell, CMD, and relevant contexts |
| 7 | **EVIDENCE**: Label all conclusions with evidence strength |
| 8 | **ESCALATION**: Halt and escalate when stop conditions are active |

---

## Stage 0: Mode Detection and Session Setup

### 0A. Determine Operational Mode

**Mode Decision Tree:**

```
IF no command execution capability:
    MODE = INSPECTION
ELIF enterprise_stop_conditions_detected:
    MODE = ENTERPRISE
ELIF user_requests_proposals:
    MODE = GUIDED (after capability verification)
ELIF user_approved_changes:
    MODE = EXECUTION
ELSE:
    MODE = INSPECTION
```

### 0B. Initialize Session State

```json
{
  "session_id": "<generate UUID>",
  "turn_number": 0,
  "mode": "INSPECTION",
  "depth_mode": "standard",
  "checkpoints": [],
  "changes_made": [],
  "stop_conditions_active": []
}
```

### 0C. Capture Initial Claims

**Record from user:**
- What is failing now
- Where it fails (shell, editor, context)
- What used to work
- Prior agent claims (if any)
- What the user needs fixed first
- Desired success condition

---

## Stage 1: Layer 0 Stop Condition Check

**CRITICAL: Run these BEFORE any repair attempts.**

### 1A. Execution Policy Check

```powershell
# Check execution policy at all scopes
Get-ExecutionPolicy -List | Format-Table -AutoSize

# Check current session policy
Get-ExecutionPolicy
```

**STOP CONDITION:** If MachinePolicy or UserPolicy = Restricted AND cannot change.

**Exit Code:** WTF-100

**Resolution Path:**
- User must request IT exception
- Use CMD workarounds for PowerShell scripts
- Use `-ExecutionPolicy Bypass` for single session (if permitted)

### 1B. MOTW (Mark of the Web) Check

```powershell
# Check for Zone.Identifier on downloaded files
Get-Item -Path "C:\path\to\suspect.exe" -Stream Zone.Identifier -ErrorAction SilentlyContinue

# Check zone identifier content
Get-Content -Path "C:\path\to\suspect.ps1" -Stream Zone.Identifier -ErrorAction SilentlyContinue
```

**STOP CONDITION:** Files blocked by MOTW when execution required.

**Exit Code:** WTF-100

**Resolution Path:**
```powershell
Unblock-File -Path "C:\path\to\suspect.ps1"
```

### 1C. Developer Mode Check (Symlink Workflows)

```powershell
# Check Developer Mode status
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense

# Alternative check
$devMode = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" -ErrorAction SilentlyContinue).AllowDevelopmentWithoutDevLicense
Write-Host "Developer Mode: $(if($devMode -eq 1){'ENABLED'}else{'DISABLED'})"
```

**STOP CONDITION:** If user needs symlink-heavy tools (pnpm, nvm-windows, scoop) and Developer Mode = 0.

**Exit Code:** WTF-405

**Resolution Path:**
- Enable Developer Mode via Settings > Update & Security > For developers
- Or via Group Policy (enterprise)

### 1D. Long Paths Check

```powershell
# Check long path support
reg query "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled

# Alternative check
$longPaths = (Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -ErrorAction SilentlyContinue).LongPathsEnabled
Write-Host "Long Paths: $(if($longPaths -eq 1){'ENABLED'}else{'DISABLED'})"
```

**STOP CONDITION:** If user has deeply nested projects (node_modules, etc.) and LongPathsEnabled = 0.

**Exit Code:** WTF-407

**Resolution Path:**
```powershell
# Requires admin
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1
```

### 1E. Enterprise Constraint Probe

```powershell
# Proxy detection
$env:HTTP_PROXY
$env:HTTPS_PROXY
netsh winhttp show proxy

# AppLocker check
Get-AppLockerPolicy -Effective -ErrorAction SilentlyContinue | Select-Object -First 10

# WDAC check
$wdac = Get-CimInstance -ClassName Win32_DeviceGuard -ErrorAction SilentlyContinue
$wdac | Select-Object RequiredSecurityPolicy, SecurityPolicySetting

# Defender status
Get-MpComputerStatus -ErrorAction SilentlyContinue | Select-Object RealTimeProtectionEnabled, PUAProtection, IsTamperProtected

# Certificate store for corporate CAs
$corpCerts = Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Issuer -ne $_.Subject }
Write-Host "Corporate CA certificates found: $($corpCerts.Count)"
```

**STOP CONDITION:** If AppLocker/WDAC blocks target operations.

**Exit Code:** WTF-702 or WTF-703

### 1F. Admin Elevation Check

```powershell
# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Write-Host "Running as Admin: $isAdmin"

# Check if UAC is enabled
$uac = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" -ErrorAction SilentlyContinue).EnableLUA
Write-Host "UAC Enabled: $(if($uac -eq 1){'YES'}else{'NO'})"
```

**STOP CONDITION:** If admin required but not available and UAC blocks elevation.

**Exit Code:** WTF-103

---

## Stage 2: Baseline Machine Context

### 2A. OS and PowerShell Version

```powershell
# OS Version
[System.Environment]::OSVersion | Format-List

# PowerShell Version
$PSVersionTable | Format-Table -AutoSize

# Windows build info
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsHardwareAbstractionLayer
```

### 2B. PATH Snapshot

```powershell
# User PATH
Write-Host "=== USER PATH ===" -ForegroundColor Cyan
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$userPath -split ';' | ForEach-Object { $i++; Write-Host "$i. $_" }

# Machine PATH
Write-Host "`n=== MACHINE PATH ===" -ForegroundColor Cyan
$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$machinePath -split ';' | ForEach-Object { $i++; Write-Host "$i. $_" }

# Current Session PATH
Write-Host "`n=== SESSION PATH ===" -ForegroundColor Cyan
$env:Path -split ';' | ForEach-Object { $i++; Write-Host "$i. $_" }

# PATH Length
Write-Host "`n=== PATH ANALYSIS ===" -ForegroundColor Cyan
Write-Host "User PATH length: $($userPath.Length)"
Write-Host "Machine PATH length: $($machinePath.Length)"
Write-Host "Combined length: $(($userPath + ';' + $machinePath).Length)"
Write-Host "Warning threshold: 2048"
```

### 2C. PATH Integrity Check

```powershell
# Check for issues
$pathIssues = @()

# Check for duplicates
$allPaths = ($env:Path -split ';') | Where-Object { $_ }
$duplicates = $allPaths | Group-Object | Where-Object { $_.Count -gt 1 }
if ($duplicates) {
    $pathIssues += "DUPLICATES: $($duplicates.Name -join ', ')"
}

# Check for dead paths
foreach ($entry in $allPaths) {
    if ($entry -and -not (Test-Path $entry)) {
        $pathIssues += "DEAD PATH: $entry"
    }
}

# Check for malformed entries
foreach ($entry in $allPaths) {
    if ($entry -match '^[^"]*"[^"]*$' -or $entry -match '\\\s*$' -or $entry -match '^\s*$') {
        $pathIssues += "MALFORMED: $entry"
    }
}

# Report
if ($pathIssues.Count -gt 0) {
    Write-Host "PATH ISSUES FOUND:" -ForegroundColor Yellow
    $pathIssues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
} else {
    Write-Host "No PATH issues detected." -ForegroundColor Green
}
```

### 2D. Shell Profile Check

```powershell
# PowerShell profile locations
Write-Host "=== PowerShell Profiles ===" -ForegroundColor Cyan
$PROFILE | Format-List -Force

# Check if profiles exist
$profilePaths = @(
    $PROFILE.AllUsersAllHosts
    $PROFILE.AllUsersCurrentHost
    $PROFILE.CurrentUserAllHosts
    $PROFILE.CurrentUserCurrentHost
)

foreach ($path in $profilePaths) {
    if (Test-Path $path) {
        Write-Host "`nFOUND: $path" -ForegroundColor Green
        Get-Content $path | Select-Object -First 20
    } else {
        Write-Host "NOT FOUND: $path" -ForegroundColor Gray
    }
}

# PowerShell 7 profiles if applicable
if ($PSVersionTable.PSVersion.Major -ge 7) {
    $pwshProfile = "$HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
    if (Test-Path $pwshProfile) {
        Write-Host "`nPowerShell 7 Profile: $pwshProfile" -ForegroundColor Cyan
    }
}
```

### 2E. App Execution Aliases Check

```powershell
# Check WindowsApps for aliases
$windowsApps = "$env:LOCALAPPDATA\Microsoft\WindowsApps"
Write-Host "=== App Execution Aliases ===" -ForegroundColor Cyan

if (Test-Path $windowsApps) {
    Get-ChildItem $windowsApps -Filter "*.exe" | ForEach-Object {
        Write-Host "$($_.Name)"
        # Try to get target
        try {
            $target = (Get-Item $_.FullName).Target
            if ($target) {
                Write-Host "  -> $target" -ForegroundColor Gray
            }
        } catch {}
    }
}
```

---

## Stage 3: Platform Availability

### 3A. WSL Check

```powershell
# WSL availability
Write-Host "=== WSL Status ===" -ForegroundColor Cyan
wsl --status 2>&1

# WSL distributions
Write-Host "`n=== WSL Distributions ===" -ForegroundColor Cyan
wsl -l -v 2>&1

# WSL version
Write-Host "`n=== WSL Version ===" -ForegroundColor Cyan
wsl --version 2>&1
```

### 3B. Docker Check

```powershell
# Docker availability
Write-Host "=== Docker Status ===" -ForegroundColor Cyan
docker version 2>&1

# Docker context
Write-Host "`n=== Docker Context ===" -ForegroundColor Cyan
docker context ls 2>&1

# Docker Desktop check
$dockerDesktop = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerDesktop) {
    Write-Host "Docker Desktop is running." -ForegroundColor Green
} else {
    Write-Host "Docker Desktop is NOT running." -ForegroundColor Yellow
}
```

### 3C. GPU/CUDA Check

```powershell
# NVIDIA GPU check (Windows)
Write-Host "=== NVIDIA GPU (Windows) ===" -ForegroundColor Cyan
nvidia-smi 2>&1

# CUDA check (if relevant)
Write-Host "`n=== CUDA Toolkit ===" -ForegroundColor Cyan
nvcc --version 2>&1
```

---

## Stage 4: Tool Discovery

### 4A. Python Ecosystem

```powershell
Write-Host "=== Python Discovery ===" -ForegroundColor Cyan

# py launcher versions
Write-Host "`nPython versions (py launcher):"
py -0p 2>&1

# Python resolution
Write-Host "`nPython resolution:"
Get-Command python -All -ErrorAction SilentlyContinue | Format-Table Name, Source, Version

# pip resolution
Write-Host "`npip resolution:"
Get-Command pip -All -ErrorAction SilentlyContinue | Format-Table Name, Source

# where.exe results
Write-Host "`nwhere.exe python:"
where.exe python 2>&1

Write-Host "`nwhere.exe pip:"
where.exe pip 2>&1

# Active Python info
Write-Host "`nActive Python:"
python -c "import sys; print(f'Executable: {sys.executable}'); print(f'Version: {sys.version}')" 2>&1

# pip info
Write-Host "`npip info:"
pip -V 2>&1
```

### 4B. Node.js Ecosystem

```powershell
Write-Host "=== Node.js Discovery ===" -ForegroundColor Cyan

# Node resolution
Write-Host "`nNode resolution:"
Get-Command node -All -ErrorAction SilentlyContinue | Format-Table Name, Source, Version

# npm resolution
Write-Host "`nnpm resolution:"
Get-Command npm -All -ErrorAction SilentlyContinue | Format-Table Name, Source

# where.exe results
Write-Host "`nwhere.exe node:"
where.exe node 2>&1

Write-Host "`nwhere.exe npm:"
where.exe npm 2>&1

# Node version
Write-Host "`nNode version:"
node -v 2>&1

# npm version and prefix
Write-Host "`nnpm info:"
npm -v 2>&1
npm config get prefix 2>&1

# Version managers check
Write-Host "`nVersion Managers:"
Get-Command nvm -ErrorAction SilentlyContinue | Select-Object Source
Get-Command fnm -ErrorAction SilentlyContinue | Select-Object Source
Get-Command volta -ErrorAction SilentlyContinue | Select-Object Source
```

### 4C. Git Check

```powershell
Write-Host "=== Git Discovery ===" -ForegroundColor Cyan

# Git resolution
Write-Host "`nGit resolution:"
Get-Command git -All -ErrorAction SilentlyContinue | Format-Table Name, Source, Version

# where.exe result
Write-Host "`nwhere.exe git:"
where.exe git 2>&1

# Git version and config
Write-Host "`nGit info:"
git --version 2>&1
git config --list --show-origin 2>&1 | Select-Object -First 20
```

### 4D. .NET Check

```powershell
Write-Host "=== .NET Discovery ===" -ForegroundColor Cyan

# .NET info
Write-Host "`n.NET info:"
dotnet --info 2>&1

# SDKs
Write-Host "`nInstalled SDKs:"
dotnet --list-sdks 2>&1

# Runtimes
Write-Host "`nInstalled Runtimes:"
dotnet --list-runtimes 2>&1

# where.exe result
Write-Host "`nwhere.exe dotnet:"
where.exe dotnet 2>&1
```

### 4E. Java Check

```powershell
Write-Host "=== Java Discovery ===" -ForegroundColor Cyan

# Java resolution
Write-Host "`nJava resolution:"
Get-Command java -All -ErrorAction SilentlyContinue | Format-Table Name, Source

# where.exe result
Write-Host "`nwhere.exe java:"
where.exe java 2>&1

# Java version
Write-Host "`nJava version:"
java -version 2>&1

# JAVA_HOME
Write-Host "`nJAVA_HOME: $env:JAVA_HOME"
```

### 4F. C/C++ Toolchain Check

```powershell
Write-Host "=== C/C++ Toolchain Discovery ===" -ForegroundColor Cyan

# MSVC check
Write-Host "`nMSVC (cl.exe):"
where.exe cl 2>&1

# GCC check
Write-Host "`nGCC:"
where.exe gcc 2>&1
gcc --version 2>&1

# Clang check
Write-Host "`nClang:"
where.exe clang 2>&1
clang --version 2>&1

# Visual Studio check
Write-Host "`nVisual Studio installations:"
& "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe" -all -property displayName 2>&1
```

---

## Stage 5: Cross-Shell Validation

### 5A. PowerShell Test

```powershell
# Already in PowerShell - run tool tests
$tools = @('python', 'node', 'npm', 'git', 'dotnet')
foreach ($tool in $tools) {
    $cmd = Get-Command $tool -ErrorAction SilentlyContinue
    if ($cmd) {
        Write-Host "$tool -> $($cmd.Source)" -ForegroundColor Green
    } else {
        Write-Host "$tool -> NOT FOUND" -ForegroundColor Red
    }
}
```

### 5B. CMD Test

```powershell
# Run CMD tests
cmd /c "where python & where node & where git & where dotnet"
```

### 5C. Git Bash Test (if installed)

```powershell
$gitBash = "C:\Program Files\Git\bin\bash.exe"
if (Test-Path $gitBash) {
    Write-Host "=== Git Bash Test ===" -ForegroundColor Cyan
    & $gitBash -c "which python; which node; which git" 2>&1
}
```

### 5D. WSL Test (if available)

```powershell
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    Write-Host "=== WSL Test ===" -ForegroundColor Cyan
    wsl bash -c "which python3; which node; which git" 2>&1
}
```

---

## Stage 6: Agent Damage Assessment

### 6A. Claim Verification Matrix

**Create a tracking structure:**

```powershell
$claimsMatrix = @{
    "Claimed by Agents" = @()
    "Verified on Machine" = @()
    "Unverified / Contradictory" = @()
    "Likely Phantom Changes" = @()
}

# Example verification
# If agent claimed "Installed Python 3.11":
$pythonClaim = "Installed Python 3.11"
$pythonActual = python --version 2>&1

if ($pythonActual -match "3.11") {
    $claimsMatrix["Verified on Machine"] += $pythonClaim
} else {
    $claimsMatrix["Unverified / Contradictory"] += $pythonClaim
}
```

### 6B. Wrapper Script Detection

```powershell
Write-Host "=== Wrapper Script Detection ===" -ForegroundColor Cyan

# Find small scripts in PATH that might be wrappers
$pathDirs = $env:Path -split ';' | Where-Object { $_ -and (Test-Path $_) }

foreach ($dir in $pathDirs) {
    $scripts = Get-ChildItem $dir -Include *.bat, *.cmd, *.ps1 -ErrorAction SilentlyContinue
    foreach ($script in $scripts) {
        if ($script.Length -lt 1000) {
            $content = Get-Content $script.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match 'agent|wrapper|shim|proxy|inject') {
                Write-Host "POTENTIAL WRAPPER: $($script.FullName)" -ForegroundColor Yellow
                Write-Host "  Size: $($script.Length) bytes"
                Write-Host "  Content preview: $($content.Substring(0, [Math]::Min(200, $content.Length)))"
            }
        }
    }
}
```

### 6C. Broken Symlink Detection

```powershell
Write-Host "=== Broken Symlink Detection ===" -ForegroundColor Cyan

# Find broken symlinks in common locations
$searchPaths = @(
    "$env:USERPROFILE\scoop\shims"
    "$env:LOCALAPPDATA\nvim"
    "$env:APPDATA\npm"
)

foreach ($path in $searchPaths) {
    if (Test-Path $path) {
        Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.LinkType -and $_.Target } |
        ForEach-Object {
            $targetExists = $_.Target | ForEach-Object { Test-Path $_ }
            if (-not ($targetExists -contains $true)) {
                Write-Host "BROKEN SYMLINK: $($_.FullName) -> $($_.Target -join ', ')" -ForegroundColor Red
            }
        }
    }
}
```

---

## Stage 7: Root Cause Analysis

### 7A. Build Dependency Graph

**Map symptoms to root causes:**

```powershell
$symptomMap = @{
    "Command not found" = @("PATH missing entry", "Binary not installed", "Shim broken")
    "Wrong version" = @("PATH order wrong", "Version manager conflict", "Shell profile override")
    "Permission denied" = @("UAC required", "File locked", "AV blocking")
    "Import fails after pip" = @("Wrong Python", "No venv active", "Site-packages mismatch")
}

# Analyze based on findings
foreach ($symptom in $symptomMap.Keys) {
    Write-Host "`n$($symptom) possible causes:"
    $symptomMap[$symptom] | ForEach-Object { Write-Host "  - $_" }
}
```

### 7B. Rank Root Causes

**Output format:**

```json
{
  "root_cause_ranking": [
    {
      "rank": 1,
      "cause": "PATH shadowing from duplicate Python installs",
      "layer": 1,
      "confidence": 0.95,
      "evidence": [
        "where.exe python shows 3 paths",
        "python --version differs from py -0p"
      ],
      "stop_condition": null
    },
    {
      "rank": 2,
      "cause": "PowerShell profile prepends stale Scoop shims",
      "layer": 1,
      "confidence": 0.80,
      "evidence": [
        "$PROFILE contains 'scoop shim add'",
        "Scoop not in PATH"
      ],
      "stop_condition": null
    }
  ]
}
```

---

## Stage 8: Recovery Planning (GUIDED Mode)

### 8A. Generate Recovery Plan

**When transitioning to GUIDED mode, propose:**

```json
{
  "recovery_plan": {
    "mode": "GUIDED",
    "proposed_actions": [
      {
        "step": 1,
        "action": "Remove dead PATH entry: C:\NonExistent\Path",
        "risk": "low",
        "reversible": true,
        "verification": "echo $env:PATH"
      },
      {
        "step": 2,
        "action": "Comment out stale Scoop init in $PROFILE",
        "risk": "low",
        "reversible": true,
        "verification": "Get-Content $PROFILE"
      },
      {
        "step": 3,
        "action": "Quarantine duplicate python.exe in unexpected location",
        "risk": "medium",
        "reversible": true,
        "verification": "where.exe python"
      }
    ],
    "requires_approval": true,
    "checkpoint_required": true
  }
}
```

### 8B. Request Approval

```
+========================================================================+
|                    PROPOSED RECOVERY ACTIONS                           |
+========================================================================+
| Step 1: Remove dead PATH entry                                         |
|   Target: C:\NonExistent\Path                                          |
|   Risk: LOW                                                            |
|   Reversible: YES                                                      |
+------------------------------------------------------------------------+
| Step 2: Comment out stale Scoop init                                   |
|   Target: PowerShell $PROFILE                                          |
|   Risk: LOW                                                            |
|   Reversible: YES                                                      |
+------------------------------------------------------------------------+
| Step 3: Quarantine duplicate python.exe                                |
|   Target: C:\Unexpected\python.exe                                     |
|   Risk: MEDIUM                                                         |
|   Reversible: YES (quarantine manifest)                                |
+========================================================================+
| Type 'APPROVE' to proceed, 'CANCEL' to abort, or 'REVIEW' for details  |
+========================================================================+
```

---

## Stage 9: Recovery Execution (EXECUTION Mode)

### 9A. Create Checkpoint

```powershell
function New-RecoveryCheckpoint {
    $checkpoint = @{
        id = [guid]::NewGuid().ToString()
        timestamp = Get-Date -Format "o"
        user_path = [Environment]::GetEnvironmentVariable("PATH", "User")
        machine_path = [Environment]::GetEnvironmentVariable("PATH", "Machine")
        registry_backups = @{}
    }
    
    # Save checkpoint
    $checkpointPath = "$env:USERPROFILE\WTF_Checkpoints\$($checkpoint.id).json"
    New-Item -ItemType Directory -Path (Split-Path $checkpointPath) -Force | Out-Null
    $checkpoint | ConvertTo-Json -Depth 5 | Out-File $checkpointPath
    
    return $checkpoint
}
```

### 9B. Execute with Verification

```powershell
function Invoke-RecoveryAction {
    param($Action, $Checkpoint)
    
    try {
        # Execute action
        switch ($Action.type) {
            "PATH_Remove" {
                $currentPath = [Environment]::GetEnvironmentVariable("PATH", $Action.scope)
                $newPath = ($currentPath -split ';' | Where-Object { $_ -ne $Action.entry }) -join ';'
                [Environment]::SetEnvironmentVariable("PATH", $newPath, $Action.scope)
            }
            "Profile_Modify" {
                $profileContent = Get-Content $Action.file -Raw
                $newContent = $profileContent -replace $Action.pattern, $Action.replacement
                Set-Content $Action.file $newContent
            }
            "Quarantine" {
                Move-ToQuarantine -TargetPath $Action.target -Reason $Action.reason
            }
        }
        
        # Verify
        $verification = Invoke-Expression $Action.verification
        Write-Host "Verification: $verification" -ForegroundColor Green
        
        return @{ Success = $true }
    } catch {
        Write-Host "Action failed: $_" -ForegroundColor Red
        
        # Rollback
        Invoke-Rollback -Checkpoint $Checkpoint
        
        return @{ Success = $false; Error = $_ }
    }
}
```

### 9C. Post-Recovery Verification

```powershell
function Test-RecoverySuccess {
    param($OriginalProblem, $Tools)
    
    $results = @{}
    
    foreach ($tool in $Tools) {
        $cmd = Get-Command $tool -ErrorAction SilentlyContinue
        if ($cmd) {
            $version = & $tool --version 2>&1 | Select-Object -First 1
            $results[$tool] = @{
                Found = $true
                Path = $cmd.Source
                Version = $version
            }
        } else {
            $results[$tool] = @{ Found = $false }
        }
    }
    
    return $results
}
```

---

## Stage 10: Baseline Documentation

### 10A. Generate Baseline Artifact

After successful recovery, create baseline:

```json
{
  "baseline_artifact": {
    "created": "2025-01-16T00:00:00Z",
    "machine": "DESKTOP-EXAMPLE",
    "user": "Developer",
    
    "canonical_tools": {
      "python": {
        "path": "C:\\Users\\Developer\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
        "version": "3.11.0",
        "manager": "python.org installer"
      },
      "node": {
        "path": "C:\\Program Files\\nodejs\\node.exe",
        "version": "20.10.0",
        "manager": "node.org installer"
      },
      "git": {
        "path": "C:\\Program Files\\Git\\cmd\\git.exe",
        "version": "2.43.0",
        "manager": "git-scm.org installer"
      }
    },
    
    "canonical_managers": {
      "python": "python.org installer",
      "node": "node.org installer",
      "global_packages": "winget"
    },
    
    "forbidden_overlaps": [
      "Store Python alias",
      "Multiple Node version managers",
      "Chocolatey and Scoop for same tool"
    ],
    
    "verification_commands": [
      "where.exe python",
      "python --version",
      "where.exe node",
      "node -v"
    ]
  }
}
```

---

## Definition of Done

**The environment is "done" when:**

- [ ] The blocked project runs in its intended shell/editor context
- [ ] Key tools resolve to expected paths
- [ ] Versions are intentional and documented
- [ ] No critical tool works only by accident in one shell
- [ ] PATH contains no obvious dead or duplicate entries
- [ ] Project-local overrides are understood
- [ ] Stop conditions are resolved
- [ ] All modifications have rollback capability
- [ ] Baseline artifact is generated

---

## Appendix: Quick Diagnostic Commands

### One-Liner System Check

```powershell
# Quick system health check
Write-Host "=== System Health ===" -ForegroundColor Cyan
Write-Host "OS: $([System.Environment]::OSVersion.VersionString)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "Admin: $(([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))"
Write-Host "Execution Policy: $(Get-ExecutionPolicy)"
Write-Host "PATH Length: $($env:PATH.Length)"
Write-Host "Developer Mode: $((Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock' -ErrorAction SilentlyContinue).AllowDevelopmentWithoutDevLicense)"
Write-Host "Long Paths: $((Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -ErrorAction SilentlyContinue).LongPathsEnabled)"
```

### One-Liner Tool Check

```powershell
# Quick tool availability check
@('python', 'node', 'npm', 'git', 'dotnet') | ForEach-Object {
    $cmd = Get-Command $_ -ErrorAction SilentlyContinue
    if ($cmd) {
        Write-Host "$_ -> $($cmd.Source)" -ForegroundColor Green
    } else {
        Write-Host "$_ -> NOT FOUND" -ForegroundColor Red
    }
}
```
