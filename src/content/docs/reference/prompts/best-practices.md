---
title: "Prompting practices"
description: "State scope, provide evidence, and ask for checks that match the owning APEX step."
---

## Choose the right interface

Use inline completion for a small code edit, chat for a question, and the selected
APEX main agent for its workflow step. Attaching a file or typing another agent's
name does not select that agent.

## Break down complex tasks

Ask Requirements to establish the workload before asking CodeGen for resources.
Identify the intended result and what must remain unchanged:

```text
Capture requirements for a customer-support service.
The web frontend is public; the API and database must remain private.
Ask about identity, traffic, retention, recovery, and budget before choosing services.
Do not generate code yet.
```

## Be specific about requirements

Give quantities and constraints that your team can support:

```text
We ingest 500 GB of partner documents each month.
Documents must remain available for seven years.
Only the processing workload can read them.
We need an owner decision on retrieval frequency before choosing storage tiers.
```

Separate business requirements from proposed implementations. Do not present a
chosen SKU or compliance conclusion as a fact unless it has been established.

## Provide context in your prompts

Name the project, current step, approved artifacts, and change:

```text
For patient-portal, review the approved architecture after the user-count change.
Expected concurrent users increased from 200 to 500.
Identify affected sizing, cost, and recovery assumptions.
Do not modify deployed resources.
```

## Use chat variables

Use the client's attachment controls to provide exact files or selected text.
VS Code can expose file, selection, terminal, and workspace context, but supported
syntax varies by client. Check what was attached rather than assuming a variable
searched the entire repository.

## Prompt patterns

For explanation, request the evidence and its limits:

```text
Explain how this plan provides private DNS resolution.
Identify the zone owner, links, and intended client path.
List anything the evidence does not establish.
```

For a repair, select the owning agent:

```text
Fix this CodeGen validation failure in the approved implementation.
Preserve the architecture and policy decisions.
If the fix requires a plan change, stop and identify it.
Re-run the affected checks and renew the handoff.
```

For a comparison, keep approval separate:

```text
Compare the supported hosting options against our availability and cost constraints.
Use current evidence and record uncertainty. Do not change the approved choice yet.
```

## Anti-patterns to avoid

Do not ask Deploy to rewrite IaC, let a generic Azure skill restart APEX planning,
or treat a passed syntax check as deployment readiness. Do not request broad
resource changes when the intent is only diagnosis.

Missing context should produce a question or an explicit limitation, not an
invented price, requirement, approval, or successful check.

## Always validate ai output

Check module and API support, policy-property coverage, required outputs, security,
and the actual preview. A recent-looking API year does not prove compatibility.
Static checks cannot prove private DNS resolution or application health.

Use the [validation reference](/reference/validation-reference/) and the owning
step's procedure. Preserve raw failure evidence and report unperformed checks.
