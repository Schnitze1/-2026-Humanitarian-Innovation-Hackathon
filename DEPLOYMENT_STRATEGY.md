# Aiga: Deployment & Sustainability Strategy

This document outlines the strategic roadmap for deploying, operating, and sustaining the **Aiga AI Reporting Assistant** in real-world humanitarian environments.

---

## 1. The MVP Spotlight: L'ATIR (Association pour la prévention et le traitement de l'insuffisance rénale)

To demonstrate immediate, measurable impact, our Minimum Viable Product (MVP) rollout is specifically tailored for L'ATIR, a specialized loi 1901 association in New Caledonia and Wallis and Futuna. 

> [!NOTE]  
> **Operational Context:** L'ATIR focuses on chronic kidney disease (CKD) prevention, dialysis, and transplant coordination. They operate in a highly multicultural environment requiring strict cultural and religious neutrality (including prohibitions on speaking local vernacular languages in shared clinical spaces).
> **Tech & Regulatory Fit:** They maintain a bespoke nephrology patient medical record system (DMN) and are certified by France's Haute Autorité de Santé (HAS). 
> **The Problem Aiga Solves:** Generating donor and regulatory reports from dense DMN clinical data while adhering to their functional definition of health (managing a progressive disease, where nutrition and pain management are prioritized) and maintaining strict ethical boundaries.

By starting with a specialized, localized health provider like L'ATIR, we can aggressively refine our consistency checkers and disclosure formats against real-world clinical and epidemiological datasets before scaling outward.

---

## 2. Deployment Architecture

Aiga is engineered to circumvent the traditional barriers of adopting AI in the developing world—specifically, unreliable internet and exorbitant cloud costs.

- **Local-First & Offline Capable:** Aiga is packaged using containerization (Docker). This means a local clinic or field office can download the software once and run it entirely on a standard laptop. If the internet drops, Aiga automatically falls back to a highly compressed ("quantized") local AI model to continue drafting reports without interruption.
- **Phased Rollout:** 
  - **Phase 1 (MVP):** On-premises deployment at L'ATIR in New Caledonia.
  - **Phase 2 (Regional Expansion):** Scaling out to medium-sized regional health clinics.
  - **Phase 3 (Global Scale):** Integrating with large international health organizations (e.g., WHO partnerships).

---

## 3. Operational Ownership

A key pillar of our strategy is **Digital Sovereignty**. We recognize that health data is highly sensitive, and relying on proprietary corporate software creates unacceptable dependencies for NGOs.

- **Independent Open-Source Coalition:** The core software (Aiga) will be owned, governed, and maintained by an independent open-source coalition dedicated to humanitarian tech. 
- **Decentralized Execution:** The software itself is run **by the NGOs themselves**. Because Aiga can run locally on an NGO's own hardware or private government cloud, sensitive field data (e.g., patient demographics, medical supply logistics) never leaves their custody. There is no central "Aiga Server" collecting NGO data.

---

## 4. Guaranteeing Authenticity & Quality

The primary barrier to AI adoption in humanitarian work is **trust**. Donors and regulatory bodies (like HAS) require absolute factual certainty. Aiga guarantees this authenticity not by trusting the AI, but by treating the AI as an untrusted agent monitored by deterministic code.

- **Hardcoded Provenance Tracking:** Aiga uses strict prompt engineering to force the AI to cite its sources using hidden bracketed tags (e.g., `[src_123#c1]`). The backend intercepts these tags and builds a permanent, verifiable "paper trail" linking every single AI-generated sentence directly back to the exact row in the raw dataset.
- **Automated Consistency Guardrails:** We do not rely on the AI to police itself. Before a report is ever shown to a donor, Aiga's Python backend runs a strict, rules-based numeric checker. If the AI writes "500 vaccines" but the cited source document actually says "400 vaccines", the system instantly flags the discrepancy in red for human review.
- **Constrained RAG Pipeline:** The AI is mathematically restricted from "hallucinating" facts from the internet or its training data. It is only permitted to synthesize the specific data chunks uploaded by the NGO into the local vector store.

---

## 5. Long-Term Maintenance & Funding

Sustainability is built into Aiga’s architecture from day one.

- **Cost Efficiency:** By chunking data efficiently and supporting local model inference, we drastically reduce the expensive API costs typically associated with generative AI. This makes Aiga financially viable for underfunded clinics.
- **Funding Model:** The independent coalition will be sustained via institutional grants (e.g., UN Innovation Funds, philanthropic tech grants) to fund core maintainers.
- **Automated MLOps Pipeline:** The software utilizes automated data pipelines (DagsHub & DVC) that require zero technical intervention from the NGO workers to keep their data indexed and secure.

---

## 5. Bridging the Gap: Capacity Building

Deploying technology is only half the battle; ensuring it is used safely and effectively is the true challenge. 

- **Trust Through Transparency (The Provenance System):** Instead of asking non-technical NGO workers to blindly trust an AI, Aiga highlights *exactly* where the AI sourced its information. This acts as a passive educational tool, helping users intuitively understand the limits and mechanics of AI retrieval.
- **Automated Consistency Guardrails:** Aiga does not rely on the user to catch AI hallucinations. It runs automated, rules-based numeric checks in the background. If a generated claim does not mathematically match the source document, it is flagged in red for the user to review.
- **Upskilling Clinics:** We will run targeted, low-bandwidth training seminars (in partnership with local health ministries) focused solely on *Data Literacy*—teaching workers how to format their raw field notes so the AI can best assist them.
