# Windows-Toolchain-Forensics

Specialized agent skill for diagnosing and repairing fragmented Windows development environments with strict safety controls, evidence labeling, and rollback-first remediation.

## What this repo provides

- A trigger-focused `SKILL.md` with a concise, high-signal operational workflow.
- Deep reference material split into `references/` to keep runtime context lean.
- Structured artifacts for triage, staged execution, and post-repair baselining.

## Repository layout

- `SKILL.md` — skill entrypoint, trigger metadata, and core operating workflow.
- `references/PLAYBOOK.md` — comprehensive staged forensic procedure.
- `references/RED-FLAG-INDEX.md` — fast symptom-to-root-cause lookup.
- `references/BASELINE-ARTIFACT-TEMPLATE.md` — canonical environment handoff template.
- `references/NOTES.md` — deployment and enterprise environment guidance.

## Why this structure is effective

- Keeps activation metadata clear and portable.
- Minimizes default token load by moving long-form material to references.
- Supports progressive disclosure: only load the reference needed for the current step.
- Improves maintainability by separating policy, workflow, and artifact templates.
