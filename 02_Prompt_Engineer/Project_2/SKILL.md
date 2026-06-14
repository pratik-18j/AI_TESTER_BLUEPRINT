---
name: rice-pot-prompt-builder
description: >
  Use this skill whenever a user wants to build, create, write, or generate a structured AI prompt
  using the RICE-POT framework (Role, Instructions, Context, Example, Parameters, Output, Tone).
  Trigger when the user says things like "build me a prompt", "create a RICE-POT prompt",
  "help me write a prompt for AI", "structure my prompt", "I need a reusable prompt",
  "make a prompt template", or any variation of wanting to craft a well-structured,
  enterprise-grade prompt. Also trigger when users describe a task and ask how to prompt
  an AI to do it reliably. Always use this skill — do not attempt to build RICE-POT prompts
  from memory without following this structured intake process.
---

# RICE-POT Prompt Builder

A skill for guiding users through a structured 7-question intake interview and generating
a production-ready RICE-POT prompt, an interactive card widget, and a downloadable PDF.

---

## What is RICE-POT?

RICE-POT is a prompt engineering framework with 7 components:

| Letter | Component    | Purpose |
|--------|-------------|---------|
| R      | Role        | The persona/expert the AI should adopt |
| I      | Instructions | Step-by-step commands, DOs, DON'Ts, CRITICALs |
| C      | Context     | Background the AI needs to understand the task |
| E      | Example     | A format, snippet, or reference output to guide style |
| P      | Parameters  | Quality, accuracy, and coverage constraints |
| O      | Output      | Exact artifact(s) to produce, format, columns |
| T      | Tone        | Communication style and register |

---

## Workflow

### Step 1 — Launch the intake wizard

Before asking any questions in text, render the interactive 7-step intake widget
(see Widget section below). The widget collects all 7 inputs in a single clean UI
and sends the completed answers back via `sendPrompt()`.

Do NOT ask the questions as plain text bullets. Always use the widget.

### Step 2 — Receive answers

The user's answers arrive as a structured message from the widget (prefixed with
`[RICE-POT INTAKE]`). Parse each field:

```
Objective: ...
Role: ...
Context: ...
Instructions: ...
Example: ...
Parameters: ...
Output & Tone: ...
```

### Step 3 — Clarify if needed

Before generating, check:
- Is any field blank or too vague to generate reliable output?
- Are there conflicting instructions?
- Is the output format ambiguous?

If yes, ask ONE focused clarifying question. Do not proceed with "Insufficient information" —
ask the user to fill the gap.

### Step 4 — Generate the RICE-POT prompt

Produce a complete, well-structured RICE-POT prompt using the intake answers.
Apply these rules to every section:

**R — Role**
- Write as a declarative persona statement, not "Act as..."
- Include years of experience, domain expertise, and output specialization
- Example: "You are a Senior [Domain] Expert with [N]+ years of experience in [skills],
  specializing in [output type]."

**I — Instructions**
- Categorize every instruction as DO / DON'T / CRITICAL
- Every DON'T must have a corresponding reason
- Every CRITICAL must define a fallback behavior (what to do when the rule can't be met)
- Minimum: 2 DOs, 2 DON'Ts, 1 CRITICAL

**C — Context**
- Describe the application/system/domain in 2-4 sentences
- Explicitly state what the source of truth is (PRD, docs, screenshots, etc.)
- State: "Do not rely on general knowledge beyond what is provided."

**E — Example**
- Always include a concrete format reference (even a partial one)
- For structured output (CSV, JSON, tables): show a sample row/record
- For prose: show tone/style snippet
- If user didn't provide one, generate a minimal example based on the output format

**P — Parameters**
- Quality: precision/accuracy bar (e.g., "production-level", "zero fabrication")
- Traceability: cite source for every claim
- Coverage: scope of scenarios/cases
- Determinism: reproducibility requirement

**O — Output**
- List every column, field, or artifact explicitly
- Specify format (CSV, JSON, markdown, prose)
- State which fields are left blank for post-processing
- End with: "No markdown, no prose outside the specified format."

**T — Tone**
- Name the register: technical / professional / casual / academic
- Name what NOT to include: no filler, no hedging, no bullets (if applicable)
- End with a success criterion: "Output must be [X] without editing."

### Step 5 — Render the output card

After generating the prompt text, render a styled RICE-POT card widget (7-section
layout matching the PDF style) with a Copy button.

### Step 6 — Offer PDF export

Ask the user: "Would you like this as a downloadable PDF?"
If yes, generate the PDF using reportlab (see pdf skill for reference).

---

## Widget — 7-step intake form

Render this as an interactive HTML widget using `show_widget`. The form walks the user
through 7 labeled steps. On submit, call `sendPrompt()` with the structured payload.

### Widget behavior

- One step visible at a time (stepper pattern)
- Progress bar across the top (7 steps)
- Each step has: letter chip (colored), label, hint text, textarea
- Navigation: Back / Next buttons; step 7 has "Build my prompt ↗" button
- On submit: collect all values and call sendPrompt with the [RICE-POT INTAKE] prefix
- Validate: warn if any field is empty on Next, but allow proceeding

### Step definitions

| Step | Letter | Color  | Label         | Hint |
|------|--------|--------|---------------|------|
| 1    | —      | Blue   | Objective     | What is the goal of this prompt? What problem should the AI solve? |
| 2    | R      | Blue   | Role          | What expert persona should the AI adopt? (e.g., Senior QA Engineer with 10 years...) |
| 3    | C      | Teal   | Context       | What background does the AI need? What is the application, domain, or source of truth? |
| 4    | I      | Amber  | Instructions  | What are the step-by-step rules? Include DOs, DON'Ts, and any critical constraints. |
| 5    | E      | Purple | Example       | Provide a sample output, format snippet, or reference the style you expect. |
| 6    | P + O  | Coral  | Parameters & Output | What quality bar applies? What exact artifact/format should be produced? |
| 7    | T      | Gray   | Tone          | What communication style? (e.g., technical, precise, no filler, enterprise-grade) |

---

## Output format (generated prompt)

Deliver the prompt as plain text with labeled sections:

```
=== RICE-POT PROMPT: [Title derived from Objective] ===

[R — ROLE]
...

[I — INSTRUCTIONS]
DO: ...
DON'T: ...
[CRITICAL]: ...

[C — CONTEXT]
...

[E — EXAMPLE]
...

[P — PARAMETERS]
- Quality: ...
- Traceability: ...
- Coverage: ...
- Determinism: ...

[O — OUTPUT]
...

[T — TONE]
...
```

---

## Quality checks before delivery

Run these checks mentally before presenting the output:

- [ ] Every instruction in [I] is tagged DO / DON'T / CRITICAL
- [ ] [E] contains a concrete format example, not a description of one
- [ ] [O] lists every column/field/artifact explicitly
- [ ] [C] names the source of truth explicitly
- [ ] [T] ends with a measurable success criterion
- [ ] No section is vague ("be professional" is not enough — specify what that means)
- [ ] No invented features, APIs, or behavior beyond what the user provided

If any check fails, fix it before presenting.

---

## Notes

- Always render the widget first. Do not ask questions as plain text.
- If the user pastes a previous RICE-POT prompt and says "improve this", skip the
  widget and go straight to Step 3 (Clarify) using their existing content.
- If the user says "just give me a template", generate a blank RICE-POT template
  with placeholder hints in each section.
