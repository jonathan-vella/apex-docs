# Repository instructions

## Writing documentation

Before finishing any task that creates or edits `src/content/docs/`, README files,
reader-facing component text, or PR descriptions, apply
`.github/skills/unslop/SKILL.md` to the draft. Load the skill explicitly. If the client
does not expose it, read that file and apply its rules directly. Do not rely on
automatic invocation.

Check technical claims before editing their wording. Use the APEX revision in
`apex-source.json` for product behavior, the Accelerator template for adopter
setup, and this repository for site commands. Distinguish source-confirmed behavior,
locally exercised commands, and untested Azure deployment steps.

Keep deployment guidance centered on APEX agent selection, required evidence,
and owner approvals. Do not introduce a separate manual deployment tutorial.

Preserve exact code, identifiers, source quotations, and historical facts. Date
historical examples and explain limitations outside verbatim records. Record any
verbatim exemption from the writing pass.

Follow the [writing guide](../src/content/docs/project/style-guide.md). Preserve
published routes and heading anchors. Do not overwrite imported binary assets or
change `migration-source.json` to bypass preservation tests. Use new filenames for
replacement diagrams.
