# Windows Toolchain Forensics — Red Flag Index

**Use this index for rapid triage.**

Each red flag tells you:
- What it usually means
- What layer to suspect
- What to stop doing until verified
- Exit code to emit

---

## Red Flag 1: A tool "works in PowerShell" but nowhere else

| Field | Value |
|-------|-------|
| **Likely meaning** | Shell-specific PATH mutation, profile drift, editor-integrated terminal mismatch, or shell-local alias/function |
| **Suspect layers** | Layer 1, Layer 4 |
| **Stop doing** | Do not assume the tool is globally fixed; do not reinstall the runtime yet |
| **Verify first** | Exact path in PowerShell vs CMD vs VS Code terminal; profile scripts; `Get-Command -All` vs `where.exe` |
| **Exit code** | WTF-102 if profile mutation |

---

## Red Flag 2: Package manager says installed, but command not found

| Field | Value |
|-------|-------|
| **Likely meaning** | Stale metadata, broken shim, App Installer/WinGet registration issue, PATH/session refresh issue, install root not on PATH |
| **Suspect layers** | Layer 1, Layer 2 |
| **Stop doing** | Do not trust package manager state as proof; do not immediately install more copies |
| **Verify first** | Resolved executable path; file existence; session PATH; App Installer / shim integrity |
| **Exit code** | WTF-200 if WinGet missing, WTF-201 if manager conflict |

---

## Red Flag 3: `python`, `node`, or `git` resolves to multiple locations

| Field | Value |
|-------|-------|
| **Likely meaning** | Duplicate installs, version manager overlap, Store alias interference, user PATH shadowing machine PATH |
| **Suspect layers** | Layer 1, Layer 2, Layer 3 |
| **Stop doing** | Do not fix symptoms at project level yet; do not add another version manager |
| **Verify first** | Full command resolution; PATH order; version from each resolved binary |
| **Exit code** | WTF-300 if runtime shadow |

---

## Red Flag 4: `pip` installs succeed but imports fail

| Field | Value |
|-------|-------|
| **Likely meaning** | Pip bound to a different interpreter, virtual environment mismatch, Conda/py/Store Python confusion |
| **Suspect layers** | Layer 3, Layer 5 |
| **Stop doing** | Do not reinstall Python immediately; do not assume site-packages are in the active interpreter |
| **Verify first** | `python -c "import sys; print(sys.executable)"`; `pip -V`; `py -0p`; active venv/Conda state |
| **Exit code** | WTF-301 if version conflict |

---

## Red Flag 5: Tool exists on disk but won't launch

| Field | Value |
|-------|-------|
| **Likely meaning** | MOTW, SmartScreen, Defender quarantine, blocked dependency, broken install |
| **Suspect layers** | Layer 0 |
| **Stop doing** | Do not keep reinstalling the same binary; do not assume execution policy alone explains it |
| **Verify first** | File streams / Zone.Identifier; Defender history / recent quarantine; dependency/runtime availability |
| **Exit code** | WTF-100 if MOTW/SmartScreen, WTF-100 if Defender blocking |

---

## Red Flag 6: `winget` is missing on a machine where it "should exist"

| Field | Value |
|-------|-------|
| **Likely meaning** | App Installer not registered, PATH/session issue, Store/App Installer state mismatch, enterprise restriction |
| **Suspect layers** | Layer 1, Layer 2, Layer 0 (policy) |
| **Stop doing** | Do not conclude WinGet is fully uninstalled without checking registration; do not build automation that assumes `winget` is present |
| **Verify first** | App Installer state; PATH; user logon/session registration; enterprise policy restrictions |
| **Exit code** | WTF-200 |

---

## Red Flag 7: WSL project is slow, flaky, or path-confused

| Field | Value |
|-------|-------|
| **Likely meaning** | Wrong filesystem boundary, Linux tools working against `/mnt/c`, Windows tools working against `\\wsl$`, mixed toolchain assumptions |
| **Suspect layers** | Layer 1, Layer 5 |
| **Stop doing** | Do not keep tuning runtimes before checking file placement; do not assume it is just "WSL being weird" |
| **Verify first** | Where project files live; which OS owns the active toolchain; whether VS Code is attached correctly |
| **Exit code** | WTF-402 if WSL broken |

---

## Red Flag 8: VS Code behaves differently from standalone terminal

| Field | Value |
|-------|-------|
| **Likely meaning** | Integrated terminal shell mismatch, extension-selected interpreter/SDK mismatch, terminal env injection, remote/WSL context confusion |
| **Suspect layers** | Layer 4, Layer 5 |
| **Stop doing** | Do not assume CLI success means editor success; do not reinstall extensions before checking selected runtimes |
| **Verify first** | VS Code shell profile; selected Python/Node/.NET/JDK path; remote context; integrated terminal env |
| **Exit code** | WTF-400 |

---

## Red Flag 9: `cl.exe` exists but builds still fail

| Field | Value |
|-------|-------|
| **Likely meaning** | Incomplete Visual Studio workload, missing headers/libs, developer shell not activated, Build Tools vs full VS mismatch |
| **Suspect layers** | Layer 3, Layer 4 |
| **Stop doing** | Do not assume compiler presence means usable MSVC environment |
| **Verify first** | Workload completeness; include/lib variables; developer command prompt activation state |
| **Exit code** | WTF-302 if dependency missing |

---

## Red Flag 10: PATH looks huge, chaotic, or duplicated

| Field | Value |
|-------|-------|
| **Likely meaning** | Truncation, malformed entries, repeated manager injections, stale paths to removed installs |
| **Suspect layers** | Layer 1 |
| **Stop doing** | Do not append more entries; do not rewrite PATH wholesale without snapshotting it |
| **Verify first** | User PATH vs machine PATH vs session PATH; length; duplicates; dead paths; quotes/trailing spaces |
| **Exit code** | WTF-101 |

---

## Red Flag 11: Desktop / Documents / OneDrive repo behaves unpredictably

| Field | Value |
|-------|-------|
| **Likely meaning** | Sync interference, path virtualization, permissions weirdness, file locking |
| **Suspect layers** | Layer 0, Layer 5 |
| **Stop doing** | Do not treat synced folders as a neutral build location |
| **Verify first** | Whether the repo is inside OneDrive-controlled paths; sync state; lock/conflict behavior |
| **Exit code** | WTF-104 if file locked |

---

## Red Flag 12: Agent says it fixed something, but you can't find it

| Field | Value |
|-------|-------|
| **Likely meaning** | Phantom change, wrapper dropped in wrong place, claimed cleanup not actually performed, narrative drift |
| **Suspect layers** | Layer 6 |
| **Stop doing** | Do not continue reasoning as if the claim is true |
| **Verify first** | On-disk artifacts; PATH changes; config diffs; executable resolution; timestamps if available |
| **Exit code** | WTF-600 |

---

## Red Flag 13: Global tool works, project tool fails

| Field | Value |
|-------|-------|
| **Likely meaning** | Local override, `.python-version`, `.nvmrc`, `global.json`, `.tool-versions`, broken `.venv`, local SDK pin |
| **Suspect layers** | Layer 5 |
| **Stop doing** | Do not repair only the global install |
| **Verify first** | Project-local files and env activation; working directory; lockfile/pin behavior |
| **Exit code** | WTF-500 |

---

## Red Flag 14: Different shells show different versions of the same tool

| Field | Value |
|-------|-------|
| **Likely meaning** | PATH divergence, shell init drift, version manager activation differences, stale session state |
| **Suspect layers** | Layer 1, Layer 2 |
| **Stop doing** | Do not pick a version number and assume it is "the installed one" |
| **Verify first** | Exact resolved path per shell; current session PATH; shell startup files |
| **Exit code** | WTF-102 |

---

## Red Flag 15: New install made everything worse

| Field | Value |
|-------|-------|
| **Likely meaning** | Duplicate manager overlap, PATH shadowing, installer placed a lower-priority or higher-priority binary, session now resolving to the wrong copy |
| **Suspect layers** | Layer 1, Layer 2, Layer 3 |
| **Stop doing** | Stop installing additional copies; switch to isolation and explicit path testing |
| **Verify first** | Newly added PATH segments; modified shell profiles; binary resolution order |
| **Exit code** | WTF-201 if manager conflict, WTF-300 if runtime shadow |

---

## Red Flag 16: Package manager fails with proxy/cert errors (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | Corporate proxy blocking, certificate pinning, SSL inspection, enterprise network policy |
| **Suspect layers** | Layer 0 (policy) |
| **Stop doing** | Do not retry the same install; do not bypass security without approval |
| **Verify first** | Proxy configuration; certificate store; IT policy documentation; offline package alternatives |
| **Exit code** | WTF-700 if proxy block, WTF-701 if cert block |

---

## Red Flag 17: Admin elevation required but unavailable (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | Machine-level PATH/edit requires admin; user lacks privileges; UAC policy restrictive |
| **Suspect layers** | Layer 0 |
| **Stop doing** | Do not attempt workarounds that violate policy |
| **Verify first** | Current privilege level; user-scope alternatives; IT escalation path |
| **Exit code** | WTF-103 |

---

## Red Flag 18: Execution policy blocks all scripts (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | PowerShell ExecutionPolicy set to Restricted; Group Policy enforcement; AV interference |
| **Suspect layers** | Layer 0 |
| **Stop doing** | Do not attempt to change policy without admin; do not assume CMD workarounds are safe |
| **Verify first** | `Get-ExecutionPolicy -List`; Group Policy settings; IT approval for policy change |
| **Exit code** | WTF-100 |

---

## Red Flag 19: Symlink creation fails (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | Developer Mode not enabled; insufficient privileges; nvm-windows/pnpm workflow broken |
| **Suspect layers** | Layer 0 |
| **Stop doing** | Do not try alternative symlink methods without enabling Developer Mode first |
| **Verify first** | `reg query AppModelUnlock`; Developer Mode setting in Windows |
| **Exit code** | WTF-401 if symlink not permitted, WTF-405 if Developer Mode required |

---

## Red Flag 20: Path too long errors (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | Long paths not enabled; npm node_modules exceeding 260 characters; deeply nested project structures |
| **Suspect layers** | Layer 0 |
| **Stop doing** | Do not move project to shorter path as first solution |
| **Verify first** | `reg query FileSystem /v LongPathsEnabled`; manifest for longPathAware |
| **Exit code** | WTF-400 if path exceeded, WTF-407 if long path not enabled |

---

## Red Flag 21: Docker commands fail from WSL (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | Docker Desktop WSL integration not enabled; socket not mounted; context wrong |
| **Suspect layers** | Layer 0, Layer 1 |
| **Stop doing** | Do not reinstall Docker before checking integration settings |
| **Verify first** | Docker Desktop settings > WSL Integration; `docker context ls`; `/var/run/docker.sock` existence |
| **Exit code** | WTF-403 |

---

## Red Flag 22: GPU not accessible in WSL (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | NVIDIA driver not installed on Windows; WSL GPU passthrough not configured; CUDA toolkit missing in WSL |
| **Suspect layers** | Layer 0 |
| **Stop doing** | Do not install CUDA toolkit in WSL before checking Windows driver |
| **Verify first** | `nvidia-smi` in Windows; WSL GPU driver status; WSL version (must be WSL2) |
| **Exit code** | WTF-404 |

---

## Red Flag 23: CMD behaves haunted but PowerShell looks clean (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | `HKCU/HKLM\\Software\\Microsoft\\Command Processor\\AutoRun` is injecting hooks/scripts (often old conda/bootstrap residues) |
| **Suspect layers** | Layer 1, Layer 4, Layer 6 |
| **Stop doing** | Do not declare shell policy fixed after only checking PowerShell profiles |
| **Verify first** | Query both HKCU/HKLM Command Processor `AutoRun`; run `cmd /d` comparison to bypass autorun temporarily |
| **Exit code** | WTF-102 |

---

## Red Flag 24: GPU package version check fails, but runtime might still work (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | Metadata probe is invalid for capability verdict (e.g., missing `__version__`), while actual runtime path may still be healthy |
| **Suspect layers** | Layer 3 |
| **Stop doing** | Do not treat metadata-only probes as final pass/fail |
| **Verify first** | Execute a real tensor/device operation on the target backend (DirectML/CUDA) |
| **Exit code** | WTF-302 |

---

## Red Flag 25: Symptom is fixed, but policy state is still drifting (NEW)

| Field | Value |
|-------|-------|
| **Likely meaning** | Fix validated only on immediate failing path; registry/shell/app-host inheritance not fully verified |
| **Suspect layers** | Layer 1, Layer 4, Layer 6 |
| **Stop doing** | Do not close incident after a single-shell pass |
| **Verify first** | Complete triad: registry policy key, fresh external shell, long-lived app host |
| **Exit code** | WTF-600 |

---

## Quick Reference: Exit Code to Red Flag Mapping

| Exit Code | Red Flags |
|-----------|-----------|
| WTF-100 | 5, 18 |
| WTF-101 | 10 |
| WTF-102 | 1, 14, 23 |
| WTF-103 | 17 |
| WTF-104 | 11 |
| WTF-200 | 6 |
| WTF-201 | 2, 15 |
| WTF-300 | 3, 15 |
| WTF-301 | 4 |
| WTF-302 | 9, 24 |
| WTF-400 | 8, 20 |
| WTF-401 | 19 |
| WTF-402 | 7 |
| WTF-403 | 21 |
| WTF-404 | 22 |
| WTF-405 | 19 |
| WTF-407 | 20 |
| WTF-500 | 13 |
| WTF-600 | 12, 25 |
| WTF-700 | 16 |
| WTF-701 | 16 |
