---
name: project-blueprint
description: Build a high-performing Claude Project / system-prompt configuration from the 6-component blueprint (Identity, Rules, Process, Output Format, Knowledge Files, Kickoff Message). Use when the user wants to set up a Claude Project, design a system prompt / custom instructions, turn a repeated workflow into a reusable AI configuration, or asks to "make an AI employee / blueprint" for a task (writing, research, coding, comms, strategy). Outputs a copy-paste-ready system prompt plus a knowledge-file and kickoff-message plan.
---

# Project Blueprint

Turn a vague "be a helpful assistant" setup into a precision-tuned configuration — what the source article calls a "customized AI employee" rather than a "labeled chatbox."

## When this applies

The user wants to configure Claude for a *recurring* workflow so it produces consistent, on-voice output with minimal prompting. Triggers: "set up a Claude Project", "write a system prompt for X", "make a blueprint / AI employee", "I keep re-editing Claude's output for X", "custom instructions for my project".

If the request is a one-off task (not recurring), say so and just do the task — a blueprint is overhead unless it will be reused.

## The 3 failure modes to fix

1. **Vague system prompt** — "you are a helpful assistant" wastes the slot. Claude already knows how to be helpful; it does NOT know the user's voice, audience, format rules, and quality bar.
2. **No knowledge files** — without persistent reference docs, a project is just a labeled conversation.
3. **One project doing everything** — a "Work Stuff" catch-all is mediocre at all of it. One blueprint = one workflow done extremely well.

## Procedure

### Step 1 — Interview (do not skip)

Before writing, gather what only the user knows. Ask for whatever is missing (batch the questions; offer sensible defaults):

- **Role & relationship** — what expert should Claude play? (be specific: "senior content strategist", "frontend architect")
- **Primary function** — the one core task this config does.
- **Audience** — who consumes the output? What do they already know?
- **Voice / communication style** — direct, formal, technical depth.
- **Quality bar & anti-patterns** — the specific things the user keeps correcting or hates seeing.
- **Output shape** — format, length, structure, required sections.
- **Available reference material** — files, examples, data the user can supply as knowledge files.

If a real codebase or existing doc is in scope, READ it first and ground the blueprint in actual file paths, symbols, and terminology — never invent names.

### Step 2 — Assemble the 6 components

Produce all six. Removing any one measurably drops output quality.

1. **IDENTITY** — who Claude is here. Use a concrete role + a "we've worked together for two years" framing + specific audience. This pushes Claude toward confident, specific output instead of generic-safe output.
2. **RULES** — the non-negotiable `ALWAYS` / `NEVER` list. The most important component. Each rule is a constraint that blocks a generic default. Tell the user: every future correction becomes a new rule here.
3. **PROCESS** — *how to think*, not what to produce. Typically: think about reader's prior belief → outline & get approval → draft in one pass → check against RULES → verify every claim → final read as the end-reader.
4. **OUTPUT FORMAT** — exact format, length range, section order, style markers. Eliminates guessing so Claude distributes effort evenly instead of front-loading.
5. **KNOWLEDGE FILES** — the files to upload, each with WHY. Always include a style/voice exemplar and an audience profile; add competitor/reference, performance data, and a template library when available.
6. **KICKOFF MESSAGE** — the first message of each new conversation. A daily-briefing that activates the knowledge files, states the task, and forces strategic thinking (angle, reader's belief to challenge, one-line hook) BEFORE producing.

### Step 3 — Deliver

Output, in this order:

1. A single fenced `IDENTITY / RULES / PROCESS / OUTPUT FORMAT` block — copy-paste-ready into Claude Project custom instructions (or a CLAUDE.md).
2. A **knowledge-files table**: `| # | file | required? | role |`.
3. A fenced **kickoff message** template with `[PLACEHOLDERS]`.
4. A one-line reminder: keep it to **one workflow per project**, and **grow the RULES list** from every correction.

Offer to save the result as a markdown file (e.g. under `doc/`) when the user works in a repo.

## Output style

- Match the user's language (reply in Japanese if they wrote Japanese).
- Make every line specific to the user's domain. If you find yourself writing a rule that could apply to anyone, cut it or make it concrete.
- Keep identifiers, paths, and library names in their original form even in a Japanese document.

## Reference

`doc/claude-project-tech-writing.md` in this repo is a worked example: the blueprint specialized for writing technical documentation for this monorepo. Use it as a model for tone and structure.
