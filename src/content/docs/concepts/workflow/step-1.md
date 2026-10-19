---
title: "Step 1: Requirements"
description: "Gather Azure platform-engineering requirements with the 02-Requirements agent."
sidebar:
  order: 1
  label: "Step 1: Requirements"
---

## Purpose

Capture the functional, non-functional, compliance, and budget constraints for a new Azure workload
through an interactive conversation. Step 1 also produces the empty `sku-manifest.{json,md}`
artifact that downstream steps mutate.

## Agent

[`02-Requirements`](https://github.com/jonathan-vella/apex/blob/main/.github/agents/02-requirements.agent.md)

## Invocation

```text
Select: 02-Requirements in Copilot Chat
Output: agent-output/{project}/01-requirements.md
        agent-output/{project}/sku-manifest.{json,md} (rev 1)
```

## What gets captured

- What the workload must do.
- Performance, availability, security, and scale targets.
- Regulatory, organizational, and residency constraints.
- Monthly budget and cost limits.
- Any SKUs the owner has already selected.

## Review

One independent `comprehensive` review is mandatory before approval. The source
candidate uses the shared read-only `challenger-review-subagent` through the
existing one-shot review contract and an actual synchronous native `APEX_REVIEW`
task. The owner approved this adaptation on October 19 after source baseline
`4b688a52`; its final source head and native runtime evidence are pending.
If the delegated Requirements worker cannot launch that review, it returns
`REVIEW_REQUIRED`. Orchestrator automatically runs the same independent review as
a sibling task and records its actual result. Selecting `10-Challenger` manually
is not the normal route. Missing reviewer capability or failed or invalid review
evidence stops progress for human recovery, without an automatic fallback.

The leaf returns schema-conforming JSON. It cannot write files, run shell commands,
ask questions, or delegate. The interactive owner captures metadata before the
task, records its actual attributed output centrally through `record-review.mjs`,
then validates schema, freshness, and provenance. New receipts identify the actual
leaf and hash both its definition and the shared `one-shot-review.md` contract.
The recorder derives IDs and severity counts from the findings.
Built-in `rubber-duck` is not a required JSON producer or fallback.
A shell safety block still invalidates that interaction.
The October 18 `cp-harness-01` retry reached automatic sibling dispatch but failed
recording for that reason. It did not produce a valid review or approval.

Resolve required findings and obtain owner approval before Step 2. See
[review finalization and recovery](/concepts/workflow/#review-finalization-and-recovery)
for the review and evidence limits.

The delegated question wrapper is also a native tool contract, not general JSON
Schema. `requestedSchema` contains only `properties`. Root `type`, `required`,
and `additionalProperties` do not belong there; unresolved names go in
the delegated envelope's `needed_inputs`. Direct tool calls contain only
`message` and `requestedSchema`. The parent permits one schema-only correction for the same
request, then stops on another malformed response without repeating settled
questions.

## Guided discovery candidate

:::caution[Source candidate, not runtime acceptance]
The guided discovery source is `977a90fa`. An owner-supplied `cp-harness-01` resume
transcript reports answer reuse without repeated questions and reaches automatic
review dispatch. It does not exercise a fresh guided intake, and review recording
failed. Full discovery and approval are not established. The follow-up
shared structured-review cutover also needs native runtime evidence. Earlier
history remains unchanged.
:::

October 19 model-backed CLI probes found and rejected an unsupported form wrapper.
After the producer/parent guidance correction, a fresh CLI session using the same
prompt returned a valid wrapper. Exact-session continuation also preserved custom
answers and moved to workload questions without repeating the business intake.
These bounded observations do not establish full discovery or review recording
in the supported VS Code client.

The candidate groups discovery into `business`, `migration`, `workload`, and
`access` stages. It offers guided choices for industry, business category,
workload type, concrete goals, and timeline ranges. Business category and
employee count are not interchangeable. A custom or freeform answer belongs in the
same native question field, not a second `*_other` field.

Only Migration or Modernization work asks for migration details. Greenfield
work skips those questions. Explicit negations do not reverse the intended
branch: "not greenfield, migrating an existing workload" keeps migration
follow-ups, while "no migration or modernization" skips them.
The helper preserves the captured answer text.
Later questions guide non-functional requirements,
user scale, budget, availability, and recovery needs. Private-access choices
include "Not sure" so the design can establish a secure path without requiring
the owner to supply network implementation details.

Monitoring questions establish responsibility scope, not named accountable
contacts or identity principals. Capture any known constraints. Exact runtime
choices, resource IDs, and tag bindings can remain open for Architecture,
Governance, or IaC Planner when the workload intent is clear. Those steps must
resolve each unknown before the gate that consumes it. An unknown is neither an
approval nor permission to invent a value or relax private-data access and
private DNS requirements.

Orchestrator passes the complete captured-answer ledger, including known answers
and explicit unknowns, to every new or continued Requirements worker task. It
does not send only the latest form response. The worker asks for missing inputs
without discarding earlier answers.

The read-only form helper runs from the APEX repository root against an existing
captured-answer JSON file:

```bash
node tools/scripts/requirements-discovery.mjs --stage business --answers captured-answers.json
```

Use `business`, `migration`, `workload`, or `access` for `--stage`. The helper
returns JSON and does not write project state. A complete stage means no required
fields are missing for that stage. It does not complete Step 1, supply answers,
make decisions, satisfy review, or approve a handoff.

## Hand-off

After approving the requirements, select the handoff to
[Step 2: Architecture](/concepts/workflow/step-2/).

## See also

- [Workflow overview](/concepts/workflow/)
- [Workflow deep dive](/concepts/workflow-deep-dive/)
- [Agent architecture](/concepts/how-it-works/agents/)
