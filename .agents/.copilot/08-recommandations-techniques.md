# Technical Recommendation Memo

## Executive summary

Family-Hub is a privacy-first, collaborative family tree platform built around a single shared genealogy model, a moderation workflow, and strong access control. Based on the project documents in this repository, the most important technical conclusion is that the product is not a generic tree visualization tool: it is a governed, confidential family record system with auditability, branch-based permissions, and strict data protection rules.

The project should therefore be implemented with a strong emphasis on:

- server-side enforcement of visibility rules
- auditable change history and moderation
- a graph-friendly data model for ancestry and family relationships
- modular architecture without excessive operational complexity
- a careful MVP that prioritizes trust and correctness over feature breadth

---

## 1. Project understanding

The project definition in the docs describes a single-family genealogy platform that supports a collaborative tree while preserving confidentiality. Key characteristics include:

- one general family tree managed under a single governance model
- multiple user roles with scoped permissions
- branch-based editorial control and succession rules
- privacy boundaries for living people and data minimization
- moderation before content is visible to others
- traceability of all changes through field-level history and change logs

The project is designed for a real family context rather than a generic genealogical database. That creates a product requirement that is more governance and security driven than simple CRUD.

---

## 2. Strategic technical conclusion

The central technical risk is not building the tree itself. The central technical challenge is enforcing the right data visibility and change integrity without leaking personal information.

The docs correctly treat the following as core architectural principles:

1. Privacy is a design constraint, not a downstream filter.
2. The authorization model must be central and deterministic.
3. Genealogy data should be modeled as explicit relationships, not inferred assumptions.
4. The moderation workflow is part of the domain model, not an optional feature.
5. The system must be testable at the visibility boundary.

These requirements strongly favor a careful implementation over a fast one.

---

## 3. Recommended architecture

### 3.1 Monolith with modular boundaries

Recommendation: implement a modular monolith rather than a distributed microservice system.

Why:

- the project is centered on one family tree and a single data model
- the team is likely small
- operational complexity would outweigh the benefit of service decomposition
- transaction integrity is simpler inside a single deployable backend

A modular monolith gives the team clear domain boundaries while keeping deployment and operations simple.

Suggested modules:

- identity-access
- genealogy
- visibility
- moderation
- history
- documents
- notifications

These modules should communicate through domain services and events, not direct database access across boundaries.

### 3.2 Backend stack

Recommendation: TypeScript with NestJS.

Why this fits:

- strong module structure and dependency injection
- guard-based authorization fits the security model well
- clear separation between domain logic and infrastructure
- team productivity for a single-language stack

This is aligned with the architecture docs and with the need to keep a coherent authorization layer across all endpoints.

### 3.3 Single database

Recommendation: PostgreSQL as the one source of truth for structured data, history, permissions, and queued tasks.

Why:

- one database keeps the system simpler
- transactions are needed for apply-and-historize behavior
- PostgreSQL supports the required graph and relational modeling
- pg-boss or a similar in-database queue fits the system well

The docs also recommend a closure table approach for ancestry relationships rather than relying on a tree-like branch model. This is a good choice for cyclic and irregular family structures.

### 3.4 Visibility by projection

Recommendation: adopt a centralized visibility projection model.

The core pattern should be:

- the API never returns raw domain entities directly
- authorization is resolved centrally
- a projector transforms the underlying data into a DTO appropriate to the requester
- the same mechanism is used across tree views, search, history, notifications, and document access

This is the most important design decision for compliance and data safety.

### 3.5 File storage

Recommendation: private object storage with signed URLs and strict validation.

The project needs to treat files as sensitive assets because photos and documents are high-risk personal data. The docs are correct to recommend:

- private bucket or equivalent storage
- signed short-lived URLs instead of public URLs
- MIME validation based on content, not extension
- image re-encoding and metadata stripping
- access logging around document retrieval

---

## 4. Data model recommendations

### 4.1 Keep Person and Account separate

This is a critical domain decision and should remain explicit.

A person in the family tree is not necessarily a platform user. This distinction is necessary for:

- living persons without accounts
- historical records
- privacy boundaries
- role and visibility separation

### 4.2 Model explicit relationships

The docs rightly prefer explicitly modeled relationships:

- person-to-person union records
- parent-child links
- branch and house concepts
- closure entries for ancestry/descendancy paths

This reduces ambiguity and supports complex structures like adoption, polygamy, and divorce.

### 4.3 Treat moderation and history as first-order domain concepts

The project should not model moderation as a UI add-on. It should be built as a persistent workflow with:

- pending changes
- author and moderator identities
- decisions and reasons
- field history records
- general change logs
- atomic apply-and-historize transactions

This distinction is essential for trust and accountability.

---

## 5. Security and privacy recommendations

### 5.1 Privacy must be enforced at the server boundary

Recommendation: no endpoint should return a person or document object unless the requester is authorized to see it. All filtering must be server-controlled.

This is the foundational requirement for the whole application and should be treated as non-negotiable in design reviews.

### 5.2 Set a strict default posture for living persons

The docs recommend a conservative policy: living people default to minimal exposure, with stronger data categories only available to approved members or admins. This is the correct security posture and should be encoded in the project’s matrix tests.

### 5.3 Protect all surfaces, not only the profile page

A privacy bug is not limited to the profile endpoint. It can also appear in:

- search
- tree rendering
- moderation queues
- notifications
- history
- duplicate suggestions
- exports

The same projection rules must be applied uniformly.

### 5.4 Add automatic and continuous security testing

The project should include a visibility matrix as a first-class test suite. For each role and visibility category, the output must be validated. The docs are right to recommend this as a critical CI gate.

---

## 6. Recommended MVP scope

The project should keep the first version focused on the high-value, high-risk core:

- person and union creation
- parent-child links with adoption markers
- branch and house concepts
- role-based permissions with scoping
- moderation workflow
- field history and changelog
- visibility logic
- public profile exposure
- account approval and admin continuity

The following features should be deferred beyond MVP unless there is a clear business need:

- PDF or image exports
- anniversary and memorial notifications
- advanced family election rules
- broad social features
- public share links with complex revocation logic

This is consistent with the staged roadmap in the project docs and keeps the project realistic.

---

## 7. Delivery and implementation priorities

The most sensible implementation order is:

1. Foundation and platform setup
2. Identity and role model
3. Core genealogy and graph operations
4. Visibility and projection layer
5. Moderation and history
6. Branch and succession rules
7. Documents and media
8. Search, duplicates, and tree customization
9. Hardening and production readiness

This order reduces risk because the most sensitive logic is addressed before the product expands.

---

## 8. Risk analysis

### High-risk areas

- graph query performance and closure maintenance
- visibility leakage through a forgotten surface
- moderation complexity and conflict handling
- family governance rules that are not fully specified
- tree rendering readability for complex family structures

### Risk mitigation

- run early spikes for graph and rendering concerns
- codify visibility rules in test matrices
- treat moderation and history as core domain behaviors
- keep branch policies configurable rather than hard-coded
- enforce a strict “done” checklist before each milestone

---

## 9. Open questions to resolve before deep implementation

Several issues in the docs still need explicit business decisions:

- how visibility should be applied by category versus full-profile level
- exact precedence between branch editor and family succession rules
- whether admin/editor edits are moderated or direct
- how duplicate merging should be made reversible
- how anonymization interacts with historical immutability
- whether adoption and non-biological links are counted in graph filters by default

These are not purely technical concerns; they affect the final authorization model and data design.

---

## 10. Final recommendation

The project should proceed with a disciplined, privacy-first architecture based on:

- a modular monolith in TypeScript/NestJS
- PostgreSQL as the single system of record
- explicit graph modeling with closure tables
- centralized authorization and visibility projection
- strict moderation and history requirements
- a narrow, well-scoped MVP focused on governance and privacy rather than breadth

This approach aligns best with the project’s actual needs and with the risk profile described in the repository docs.

If executed carefully, Family-Hub can become a strong, trustworthy family system with a clear product purpose and a robust engineering foundation.
