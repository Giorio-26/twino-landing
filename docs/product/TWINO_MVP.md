# TwinO Sales Twin MVP

**Status:** Canonical product specification  
**Canonical repository:** `twinoai/twino-landing`  
**Applies to:** The Sales Twin product across `twino-landing` and `twino-flask`

## Status language

This document separates product intent from implementation reality:

- **Exists:** verified in the current repositories.
- **Incomplete:** partially implemented or not yet reliable end to end.
- **Planned:** required or prioritized, but not verified as production-ready.
- **Non-goal:** intentionally outside the current MVP.

A screen, label, placeholder, mock, or “coming soon” card is not evidence of a production integration.

## 1. Product vision

TwinO is an AI revenue operating layer for real estate developers.

The first product is **Sales Twin**: an autonomous AI sales agent that handles inbound Meta/WhatsApp inquiries 24/7, responds immediately, qualifies buyers through natural conversation, turns conversational details into structured buyer intent, and hands sales-ready opportunities to the human sales team. It works with the customer’s existing CRM rather than replacing it.

The product should reduce lost inbound demand, shorten response time, improve qualification consistency, and give human salespeople clear opportunities they can act on.

## 2. Current MVP scope

The MVP must prove one core value:

```text
Incoming lead
→ instant AI response
→ natural qualification
→ structured buyer data
→ qualified / needs human / unqualified state
→ human handoff
→ CRM-ready data
```

Canonical product flow:

```text
Meta / WhatsApp
→ TwinO
→ Qualification
→ Structured Sales Opportunity
→ Human Sales Team
→ Existing CRM
```

The current repository evidence shows:

- **Exists:** a Next.js public site and operational dashboard in `twino-landing`.
- **Exists:** Overview, Leads, Conversations, Properties, Configure Twin, Integrations, and Settings routes/navigation.
- **Exists:** a FastAPI Sales Twin backend in `twino-flask` with WhatsApp messaging through Evolution API, AI qualification, lead persistence, human takeover, Telegram escalation, dashboard APIs, and WebSocket events.
- **Exists:** a WhatsApp connection flow in the dashboard.
- **Incomplete:** the frontend and backend represent some configuration and lead concepts differently.
- **Planned:** production Meta channel support and production CRM sync.
- **Planned:** a single, explicit product-level classification of `qualified`, `needs_human`, or `unqualified`.

## 3. Explicit non-goals

The current MVP is not:

- A generic chatbot.
- A CRM replacement.
- A broad AI platform.
- A full marketing automation suite.
- A standalone knowledge-base product.
- A standalone guardrails product.
- A standalone calendar product.
- Valuation Twin.

Do not create standalone navigation for Knowledge Base, Guardrails, or Calendar. Knowledge, business rules, qualification logic, personality, and guardrails belong inside **Configure Twin**.

Valuation Twin is future scope and must not be built unless explicitly requested.

## 4. User roles

### Buyer

A person who begins an inquiry through Meta or WhatsApp. The buyer expects an immediate, natural, useful conversation and a clear route to a human when needed.

### Sales representative

A human who receives qualified or escalated opportunities, reviews conversation context and structured buyer intent, takes over the conversation when appropriate, and continues work in the existing CRM.

### Sales manager

A human who monitors pipeline quality, response and handoff performance, team workload, and qualification outcomes.

### Twin administrator

A customer-side operator who configures the Twin’s identity, knowledge, qualification rules, properties, guardrails, integrations, and account settings.

### TwinO operator

An internal operator who supports pilot setup, diagnoses integration failures, and helps customers reach a reliable end-to-end workflow. Internal tools must not be confused with customer-facing MVP navigation.

## 5. Golden path

1. A buyer sends an inbound Meta or WhatsApp message.
2. TwinO receives the event and associates it with the correct customer/company.
3. Sales Twin responds immediately in the appropriate language.
4. Sales Twin conducts a natural conversation rather than presenting a rigid form.
5. It progressively captures and updates structured qualification fields.
6. It uses configured knowledge, properties, business rules, and guardrails.
7. It classifies the lead as `qualified`, `needs_human`, or `unqualified`.
8. It triggers human handoff when required.
9. The human receives the conversation context, buyer summary, structured fields, reason for handoff, and recommended next action.
10. TwinO prepares and, where a production integration exists, syncs CRM-ready data to the customer’s existing CRM.
11. The dashboard records enough operational data to measure whether the pilot creates customer value.

If any external integration is unavailable, the UI and system must report that honestly. It must not fabricate successful delivery or CRM synchronization.

## 6. Lead lifecycle and states

### Canonical product states

- **New:** an inbound lead has been received but qualification is not complete.
- **Qualifying:** the AI is actively collecting relevant buyer information.
- **Qualified:** sufficient information and buyer intent meet the configured business rules; handoff is required.
- **Needs human:** the buyer asks for a human, the AI is uncertain, or a business rule requires approval.
- **Unqualified:** the lead does not currently meet configured criteria or has no actionable purchase intent.
- **Handed off:** a human has been notified or has taken control.
- **Synced:** CRM-ready data has been successfully accepted by a configured CRM.
- **Sync failed:** a CRM delivery attempt failed and requires retry or operator attention.

The three required MVP classification outcomes are `qualified`, `needs_human`, and `unqualified`. Operational states such as `new`, `qualifying`, `handed_off`, and CRM sync status support that classification.

### Current implementation note

The current `twino-flask` backend uses statuses including `new`, `hot`, `qualified`, `call_in`, and `deal`, plus a `human_takeover` flag. These do not yet map cleanly to the canonical product states above. Do not silently rename or migrate them; define and test an explicit compatibility/migration plan first.

## 7. Qualification logic

Qualification must feel conversational and collect information progressively. Core structured fields are:

- Project or property interest.
- Budget, including currency when known.
- Preferred location.
- Property type.
- Purchase timeline.
- Buyer intent.
- Investment versus residential purpose.
- Language.

Useful supporting fields may include buyer name, contact identifiers, preferred contact method, selected property, and free-form notes, but they must not replace the core fields.

Qualification rules must be customer-configurable inside Configure Twin. A lead should not be marked qualified merely because a fixed number of fields is present; configured business rules, intent, and conversation context also matter.

### Current implementation note

The current backend primarily scores budget, location, and intent and stores selected property and customer name. The broader canonical field set is incomplete. Existing scoring must be preserved until a deliberate replacement is approved and tested.

## 8. Human handoff

Human handoff must happen when:

- The buyer is qualified.
- The buyer asks for a human.
- The AI is uncertain or cannot answer safely.
- A configured business rule requires human approval.

A handoff package should include:

- Buyer identity/contact reference.
- Conversation summary and recent context.
- All known qualification fields.
- Current classification and lead score, if retained.
- The exact handoff reason.
- Property/project interest.
- Recommended next action.
- CRM sync status.

Once a human takes over, the AI must not compete with the human or send unapproved replies. Resuming AI control must be explicit and auditable.

### Current implementation note

`twino-flask` contains human-takeover behavior, manual chat controls, and Telegram escalation. The canonical handoff reasons and complete handoff package are not yet consistently represented as structured product data.

## 9. Conversations

The Conversations workspace should let authorized users:

- See inbound and outbound messages in chronological order.
- Identify whether AI or a human sent each message.
- See the current lead classification and handoff status.
- Review the structured buyer summary without rereading the full chat.
- Take over and, when appropriate, explicitly return control to the AI.
- See delivery, processing, or integration errors honestly.
- Filter or locate active, escalated, and recently updated conversations.

Conversation history must be tenant-isolated and must preserve enough context for safe handoff. The system must avoid duplicate replies and must not display invented message history.

### Current implementation note

The repositories contain conversation pages, message/history APIs, WebSocket updates, send-message handling, takeover controls, and backend deduplication logic. End-to-end reliability and state consistency still require validation.

## 10. Properties

The Properties workspace should manage the inventory Sales Twin is allowed to discuss.

Each property/project record should have stable identity and only verified information. The AI must never invent availability, pricing, features, or property details. Property data should support qualification and matching while remaining understandable to customer operators.

### Current implementation note

- `twino-landing` has Supabase-backed property tables and property configuration routes.
- `twino-flask` stores a company property database as JSONB, currently populated through Excel normalization with an enforced limit.
- These are overlapping representations. Their ownership and synchronization are not yet clearly unified.

Do not introduce a third property source without first choosing an authoritative model and migration path.

## 11. Configure Twin

Configure Twin is the single home for:

- Twin identity and personality.
- Customer/company knowledge.
- Qualification fields and logic.
- Business rules.
- Guardrails and approval rules.
- Property context used by the Twin.
- Language and response behavior.
- Human-handoff rules.

These capabilities may be presented as tabs or grouped sections inside Configure Twin. They must not become standalone Knowledge Base, Guardrails, or Calendar navigation items.

### Current implementation note

The dashboard currently includes configuration areas for personality, knowledge, sales instructions/guardians, properties, tone, and rules. Terminology is not fully aligned: “Guardians” appears to represent sales instructions or guardrails and should be clarified before product-facing changes.

## 12. Integrations

Priority order:

1. Meta / WhatsApp.
2. Bitrix24.
3. Zoho.

Integration status must distinguish:

- Not configured.
- Configuration incomplete.
- Connected.
- Connection error.
- Receiving data.
- Last successful event.
- Sync failed or requires attention.

### Current implementation note

WhatsApp connection and status flows exist through Evolution API. The dashboard explicitly marks CRM targets, including Bitrix24 and Zoho, as “Coming Soon.” Messenger/Instagram and other sources are also presented as coming soon. They must not be described as production-ready until verified end to end.

## 13. CRM sync

The existing CRM remains the system used by the human sales team. TwinO enriches it with timely, structured opportunities.

The minimum CRM-ready payload should include:

- Source and channel.
- Buyer/contact reference.
- Project/property interest.
- Budget and currency.
- Location.
- Property type.
- Purchase timeline.
- Buyer intent.
- Investment/residential purpose.
- Language.
- Qualification classification.
- Handoff reason.
- Conversation summary.
- Relevant conversation or lead reference.
- Owner/assignee when known.
- Timestamps.
- Sync status and external CRM record ID after success.

CRM delivery must be idempotent where possible, observable, and retryable. A UI success state must only appear after the external CRM accepts the data.

### Current implementation note

No production-ready Bitrix24 or Zoho synchronization was verified. The dashboard currently presents CRM auto-export as coming soon and offers generic webhook/API access. CRM sync is planned, not complete.

## 14. Data model: structured buyer intent

Structured buyer intent should be modeled independently from raw conversation text.

Required MVP fields:

| Field | Meaning |
|---|---|
| `project_property_interest` | Named project/property or relevant preference |
| `budget` | Numeric range or normalized value |
| `budget_currency` | Currency associated with the budget |
| `location` | Preferred area, city, district, or market |
| `property_type` | Apartment, house, commercial, or configured type |
| `purchase_timeline` | Expected decision or purchase timeframe |
| `buyer_intent` | Strength and nature of purchase intent |
| `purchase_purpose` | Investment or residential |
| `language` | Buyer’s active/preferred conversation language |
| `classification` | Qualified, needs human, or unqualified |
| `handoff_reason` | Why human action is required |
| `conversation_summary` | Concise factual summary for a human |
| `source_channel` | Meta, WhatsApp, or another verified source |
| `crm_sync_status` | Not ready, pending, synced, or failed |

Unknown data must remain unknown. Do not infer precise values that the buyer did not provide.

## 15. Dashboard metrics

P0 metrics should prove the core workflow:

- Inbound leads received.
- Median and percentile first-response time.
- Leads currently qualifying.
- Qualified leads.
- Leads needing human attention.
- Unqualified leads.
- Handoffs requested and completed.
- Time from handoff trigger to human action.
- CRM-ready opportunities.
- CRM sync successes and failures.
- AI response or integration failures.

P1 metrics may include qualification completion by field, funnel conversion, channel performance, human takeover rate, and property interest.

Metrics must use real production or clearly labeled test data. Never populate the dashboard with unlabeled fake production data.

## 16. Priorities

### P0 — prove customer value

- Reliable inbound WhatsApp lead receipt.
- Immediate AI response.
- Natural qualification using the required fields.
- Clear `qualified` / `needs_human` / `unqualified` classification.
- Safe, reliable human handoff.
- CRM-ready structured data.
- Honest operational status and failure visibility.
- Tenant isolation, authentication, and no fabricated property information.

### P1 — make pilots operational

- Production Bitrix24 integration.
- Production Zoho integration.
- Meta source support beyond the currently verified WhatsApp path.
- Retry and reconciliation for integration failures.
- Better operator filters, summaries, and handoff tracking.
- Unified configuration and property ownership between frontend and backend.
- Pilot metrics and learning instrumentation.

### P2 — optimize after proof

- Additional channels and CRMs.
- Advanced analytics and workflow customization.
- Broader automation that does not weaken the core workflow.
- Scalability improvements justified by measured pilot demand.

P2 work must not delay or destabilize P0.

## 17. Acceptance criteria

The MVP is accepted only when a real pilot can demonstrate that:

1. A real inbound WhatsApp lead reaches the correct customer tenant.
2. Sales Twin responds within the agreed service target and records response timing.
3. The conversation feels natural and does not expose an internal form.
4. Core qualification fields are progressively captured as structured data.
5. Unknown fields remain unknown rather than being fabricated.
6. The lead receives one of the required classifications.
7. Each required handoff trigger works: qualified, explicit human request, AI uncertainty, and configured approval rule.
8. AI replies stop when a human takes over.
9. The human receives sufficient context and structured data to act.
10. Property statements come only from verified configured data.
11. CRM-ready output is generated in a stable schema.
12. A configured production CRM receives the opportunity, or the product clearly reports that sync is not configured/failed.
13. The dashboard shows real workflow status and errors without presenting placeholders as live.
14. Data remains isolated between customers.
15. The workflow can be repeated reliably across representative pilot conversations.

A polished dashboard alone does not satisfy MVP acceptance.

## 18. Relationship to `twino-flask`

`twino-landing` is the canonical product repository and customer-facing application. It contains the public website, dashboard, Supabase-backed product configuration, and server-side routes that proxy requests to the backend.

`twino-flask` is the current Sales Twin execution backend. It contains the WhatsApp/Evolution API workflow, AI conversation graph, qualification state, lead database behavior, human takeover, Telegram escalation, dashboard APIs, and WebSocket events.

Product changes that affect leads, conversations, qualification, properties, configuration, WhatsApp, handoff, or CRM-ready data must inspect both repositories before implementation. Preserve existing API contracts or change both sides deliberately with migration and rollback plans.

Known areas requiring alignment include:

- Frontend Supabase properties versus backend JSONB/Excel properties.
- Canonical product classifications versus backend statuses and lead scoring.
- Configure Twin terminology and data ownership.
- Dashboard-visible integration state versus verified backend capability.
- Required structured buyer fields versus the backend’s narrower current state.

`twino-go` is a small adjacent service or early implementation containing authentication and demo-booking/calendar/email functionality. It is not currently the canonical Sales Twin backend. Confirm its active production role before extending it.

## 19. Future scope: Valuation Twin

Valuation Twin is a future TwinO product expansion. It may eventually provide valuation workflows or related intelligence for real estate businesses.

It is explicitly outside the Sales Twin MVP. Do not add Valuation Twin navigation, data models, services, integrations, or placeholder functionality unless the user explicitly requests and scopes that work.
