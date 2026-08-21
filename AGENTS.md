# TwinO Repository Guidance

## Product

TwinO is an AI revenue operating layer for real estate developers. Its first product, Sales Twin, is an autonomous AI sales agent that handles inbound Meta/WhatsApp inquiries 24/7, qualifies buyers through natural conversation, structures buyer information, hands sales-ready opportunities to the human sales team, and works with the customer's existing CRM.

The MVP must prove this path reliably:

```text
Incoming lead
→ instant AI response
→ natural qualification
→ structured buyer data
→ qualified / needs human / unqualified
→ human handoff
→ CRM-ready data
```

TwinO is not a generic chatbot, a CRM replacement, or a broad AI platform. The customer's CRM remains the system used by the human sales team; TwinO prepares and transfers structured opportunities into it.

Canonical product workflow:

```text
Meta / WhatsApp
→ TwinO
→ Qualification
→ Structured Sales Opportunity
→ Human Sales Team
→ Existing CRM
```

## MVP navigation

- Workspace: Overview, Leads, Conversations, Properties
- Configuration: Configure Twin, Integrations
- Account: Settings

Do not create standalone Knowledge Base, Guardrails, or Calendar sections. Knowledge, business rules, qualification logic, personality, and guardrails belong inside Configure Twin.

## Repository boundaries

- `twino-landing` is the canonical product repository. It contains the public site, operational dashboard, Supabase-backed configuration, and server routes that communicate with the Sales Twin backend.
- `twino-flask` is the current Sales Twin backend: WhatsApp/Evolution API messaging, AI qualification, lead state, human takeover, PostgreSQL persistence, dashboard APIs, and WebSocket updates.
- Preserve existing API contracts between these repositories. Inspect both sides before changing shared behavior.
- `docs/product/TWINO_MVP.md` is the canonical product source of truth. Read it before product, navigation, workflow, data-model, integration, or prioritization changes.

## Engineering principles

- Inspect before changing and preserve working functionality.
- Use the existing architecture and technology stack.
- Make the smallest robust change; avoid rewrites and premature complexity.
- Never present mock data, placeholder UI, or planned integrations as production-ready.
- Never invent production data or functionality.
- Keep secrets server-side and preserve authentication, tenant isolation, and human-takeover safeguards.
- Explain technical decisions in plain language.

## Startup decision rules

1. P0: Protect and complete the core lead-to-handoff workflow.
2. P1: Improve pilot reliability, operator visibility, and CRM-ready output.
3. P2: Add optimization, polish, and broader capabilities only after the core workflow is measurable and dependable.
4. Prefer speed to customer value, fast pilot deployment, maintainability, and measurable learning.
5. Do not build Valuation Twin in the current MVP unless explicitly requested.
6. If a request conflicts with the canonical product document, stop and surface the conflict before implementing it.
