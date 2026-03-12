# Windows Toolchain Forensics — Baseline Artifact Template

**Use this after stabilization.** This document records the intentional, canonical machine policy.

---

## Machine Identity

| Field | Value |
|-------|-------|
| Machine name | `<COMPUTERNAME>` |
| OS version/build | `<Windows Version>` |
| User | `<USERNAME>` |
| Date baseline created | `<ISO8601>` |
| Primary use case(s) | `<DESCRIPTION>` |
| Skill session ID | `<UUID from forensics session>` |

---

## Mode Configuration

| Field | Value |
|-------|-------|
| Default debugging shell | `PowerShell 7` / `PowerShell 5.1` / `CMD` |
| Secondary shells allowed | `Git Bash`, `WSL` |
| VS Code integrated terminal | `PowerShell` / `Command Prompt` / `Git Bash` |
| Visual Studio Developer Shell | `Required` / `Optional` / `Not Used` |

---

## Canonical Tool Registry

### Python

| Field | Value |
|-------|-------|
| Canonical source | `python.org` / `Microsoft Store` / `Conda` / `pyenv-win` / `Scoop` / `WinGet` |
| Canonical executable path | `<FULL PATH>` |
| Canonical pip path | `<FULL PATH>` |
| Version | `<VERSION>` |
| Allowed project isolation | `venv`, `conda env`, `poetry` |
| Forbidden overlaps | `Store Python`, `duplicate installs` |

**Verification:**
```powershell
where.exe python
python -c "import sys; print(sys.executable)"
py -0p
```

### Node.js

| Field | Value |
|-------|-------|
| Canonical source | `nodejs.org` / `nvm-windows` / `fnm` / `Volta` / `Scoop` / `WinGet` |
| Canonical executable path | `<FULL PATH>` |
| Canonical npm path | `<FULL PATH>` |
| Version | `<VERSION>` |
| Version manager | `<NAME OR NONE>` |
| Forbidden overlaps | `multiple version managers` |

**Verification:**
```powershell
where.exe node
node -v
npm config get prefix
```

### Git

| Field | Value |
|-------|-------|
| Canonical source | `git-scm.org` / `GitHub Desktop` / `Visual Studio` / `Scoop` / `WinGet` |
| Canonical executable path | `<FULL PATH>` |
| Version | `<VERSION>` |
| Credential helper | `<NAME>` |
| Line ending config | `core.autocrlf = true/false/input` |
| Forbidden overlaps | `bundled Git conflicts` |

**Verification:**
```powershell
where.exe git
git --version
git config --list --show-origin | Select-String autocrlf
```

### .NET

| Field | Value |
|-------|-------|
| Canonical source | `dotnet.microsoft.com` / `Visual Studio` / `WinGet` |
| Canonical dotnet path | `<FULL PATH>` |
| SDKs installed | `<VERSIONS>` |
| Runtimes installed | `<VERSIONS>` |
| global.json policy | `Allow` / `Require matching` |
| Forbidden overlaps | `N/A` |

**Verification:**
```powershell
where.exe dotnet
dotnet --list-sdks
dotnet --list-runtimes
```

### Java

| Field | Value |
|-------|-------|
| Canonical source | `Adoptium` / `Oracle` / `Azul` / `Scoop` / `WinGet` |
| Canonical java path | `<FULL PATH>` |
| JAVA_HOME | `<PATH>` |
| Version | `<VERSION>` |
| Forbidden overlaps | `multiple JDKs on PATH` |

**Verification:**
```powershell
where.exe java
java -version
echo $env:JAVA_HOME
```

### C/C++

| Field | Value |
|-------|-------|
| Canonical toolchain | `MSVC` / `MinGW` / `LLVM/Clang` / `MSYS2` |
| Canonical compiler path | `<FULL PATH>` |
| Visual Studio workloads | `<REQUIRED WORKLOADS>` |
| Developer shell requirement | `Required` / `Optional` |

**Verification:**
```powershell
where.exe cl    # MSVC
where.exe gcc   # MinGW
where.exe clang # LLVM
```

### Rust

| Field | Value |
|-------|-------|
| Canonical source | `rustup` |
| Canonical cargo path | `<FULL PATH>` |
| Toolchain | `stable-x86_64-pc-windows-msvc` / `stable-x86_64-pc-windows-gnu` |
| MSVC requirement | `Yes` / `No (using GNU)` |

**Verification:**
```powershell
where.exe cargo
rustup show
```

---

## Platform Components

### WSL

| Field | Value |
|-------|-------|
| Default distro | `<DISTRO>` |
| WSL version | `1` / `2` |
| File placement rule | `Projects in ~ (WSL filesystem)` / `Mixed` |
| Windows PATH in WSL | `Enabled` / `Disabled` |
| GPU passthrough | `Enabled` / `Disabled` / `N/A` |

**Verification:**
```powershell
wsl -l -v
cat /etc/wsl.conf  # inside WSL
```

### Docker

| Field | Value |
|-------|-------|
| Docker Desktop version | `<VERSION>` |
| Backend | `WSL 2` / `Hyper-V` |
| WSL integration | `<DISTROS>` |
| Context | `default` / `<CUSTOM>` |

**Verification:**
```powershell
docker version
docker context ls
```

### CUDA/GPU

| Field | Value |
|-------|-------|
| NVIDIA driver version | `<VERSION>` |
| CUDA toolkit version | `<VERSION>` |
| WSL GPU support | `Enabled` / `Disabled` / `N/A` |

**Verification:**
```powershell
nvidia-smi
```

---

## Package Manager Registry

| Ecosystem | Canonical Manager | Alternative (Allowed) |
|-----------|------------------|----------------------|
| Windows Apps | `WinGet` | `Scoop` (user-only) |
| Python | `pip` | `uv`, `poetry` (project) |
| Node.js | `npm` | `pnpm`, `yarn` (project) |
| .NET | `dotnet tool` | `NuGet` |
| Rust | `cargo` | - |
| Go | `go install` | - |

**Forbidden Conflicts:**
- `Chocolatey` AND `Scoop` for same tool
- Multiple Node version managers simultaneously
- Multiple Python installers without version management

---

## PATH Policy

| Field | Value |
|-------|-------|
| User PATH strategy | `Minimal, project-specific only` |
| Machine PATH strategy | `Stable tools only, managed by installers` |
| Maximum PATH length | `< 1800 characters` |
| Forbidden PATH roots | `<LIST>` |
| Known exceptions | `<LIST>` |

**PATH Verification:**
```powershell
[Environment]::GetEnvironmentVariable("PATH", "User").Length
[Environment]::GetEnvironmentVariable("PATH", "Machine").Length
```

---

## Security Configuration

| Field | Value |
|-------|-------|
| Execution Policy (User) | `RemoteSigned` / `Unrestricted` / `Restricted` |
| Execution Policy (Machine) | `RemoteSigned` / `Restricted` |
| Developer Mode | `Enabled` / `Disabled` |
| Long Paths | `Enabled` / `Disabled` |
| Defender exclusions | `<PATHS>` |

---

## Enterprise Constraints

| Field | Value |
|-------|-------|
| Proxy required | `Yes` / `No` |
| Proxy address | `<ADDRESS OR N/A>` |
| Certificate pinning | `Active` / `Not Active` |
| AppLocker enforced | `Yes` / `No` |
| WDAC enforced | `Yes` / `No` |
| IT escalation contact | `<CONTACT OR N/A>` |
| Approved package sources | `<SOURCES>` |

---

## IDE Configuration

### VS Code

| Field | Value |
|-------|-------|
| Install path | `<PATH>` |
| Default terminal | `PowerShell` / `Command Prompt` / `Git Bash` |
| Python extension interpreter | `<PATH>` |
| Remote: WSL configured | `Yes` / `No` |

**Settings location:** `%APPDATA%\Code\User\settings.json`

### Visual Studio

| Field | Value |
|-------|-------|
| Edition | `Community` / `Professional` / `Enterprise` |
| Required workloads | `<WORKLOADS>` |
| Developer command prompt | `Required for C++` / `Optional` |

---

## Project-Local Override Policy

**Allowed Overrides:**
- `.venv` / `venv` for Python
- `.nvmrc` for Node version
- `global.json` for .NET SDK
- `.python-version` for pyenv-win
- `.tool-versions` for asdf
- `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`
- `pyproject.toml` with pinned versions

**Rules:**
- Project-local overrides must be explicit (files, not just session env)
- Virtual environments should be in project root or standard location
- Lock files must be committed if they exist

---

## Forbidden Overlaps

**Tool/Manager combinations that should NOT coexist on PATH:**

1. **Multiple Node version managers:** nvm-windows + fnm + Volta
2. **Store Python alias with python.org:** Windows Store python.exe shadowing installer
3. **Bundled Git ahead of standalone Git:** IDE-bundled Git before system Git
4. **Mixed WSL/Windows tool ownership:** Same project using tools from both OS
5. **Chocolatey + Scoop for same tool:** Different managers for identical binaries
6. **Multiple Python interpreters without pyenv-win:** Raw duplicate installs

---

## Verification Commands

**Run these to verify baseline integrity:**

```powershell
# System health
Write-Host "=== System Health ===" -ForegroundColor Cyan
Write-Host "Admin: $(([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))"
Write-Host "Dev Mode: $((Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock' -EA 0).AllowDevelopmentWithoutDevLicense)"
Write-Host "Long Paths: $((Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -EA 0).LongPathsEnabled)"

# Tool paths
Write-Host "`n=== Tool Paths ===" -ForegroundColor Cyan
where.exe python
where.exe node
where.exe git
where.exe dotnet

# Versions
Write-Host "`n=== Versions ===" -ForegroundColor Cyan
python --version
node -v
git --version
dotnet --version

# PATH integrity
Write-Host "`n=== PATH Integrity ===" -ForegroundColor Cyan
Write-Host "User PATH length: $([Environment]::GetEnvironmentVariable('PATH', 'User').Length)"
Write-Host "Machine PATH length: $([Environment]::GetEnvironmentVariable('PATH', 'Machine').Length)"
```

---

## Known Exceptions

**Document intentional deviations from the default policy:**

| Exception | Reason | Date Added |
|-----------|--------|------------|
| `<EXAMPLE>` | `Legacy project requires specific tool` | `2025-01-16` |

---

## Recovery Notes

**What to check first if the environment drifts again:**

1. **PATH changes:** Check for installer additions, profile mutations
2. **New duplicates:** Run `where.exe` on all tools
3. **Enterprise policy:** Check for new GPO restrictions
4. **Agent residue:** Look for wrapper scripts, unexpected PATH entries
5. **Profile drift:** Check PowerShell profile for mutations

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| `<ISO8601>` | `Initial baseline created` | `<SOURCE>` |

---

## Session Reference

| Field | Value |
|-------|-------|
| Forensics session ID | `<UUID>` |
| Original exit code | `WTF-XXX` |
| Root cause identified | `<DESCRIPTION>` |
| Actions taken | `<LIST>` |
