# ShopSense AI Commerce OS — Master Architecture & Engineering Guide

## Executive Overview
**ShopSense AI** is an enterprise-grade, production-scale **AI-Powered Commerce Operating System (Commerce OS)**. Rather than assembling disconnected application clones, it delivers a **Unified Modular Commerce Core** coupled with a **Centralized Multi-Domain AI Platform**, supporting:
1. **Consumer Super App**: Flagship DTC Tech Storefront, Quick-Commerce Groceries (10-min SLA), Apollo E-Health & Pharmacy, Amazon-style Bazaar Value-Commerce, and OLX-style C2C Marketplace.
2. **Merchant Center (Seller Portal)**: Multi-seller Buy Box repricing engine, inventory allocation, dynamic margin floor safeguards, and AI copywriting assistant.
3. **Pharmacy Regulatory & Dispensing Hub**: Real-time OCR chemical salt extraction, registered pharmacist audit logging (`KA-PH-39402`), generic substitute mapping, and Schedule H drug safety checkout gating.
4. **Quick-Commerce Delivery Fleet Console**: Location-aware dark store order allocation, real-time SLA countdown timers, and customer OTP delivery verification.
5. **MLOps & Platform Control Plane**: Multi-stage RecSys pipeline (LightGBM LambdaMART + MMR diversity), Population Stability Index (PSI) drift monitoring, A/B testing suite, and Thompson Sampling multi-armed bandits.

---

## Architectural Topology

```
                         SHOP SENSE AI
                    AI-Powered Commerce OS
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
      CONSUMER            MERCHANT              ADMIN
       APP                 CENTER               / ML
          │                   │                    │
          └───────────────────┼────────────────────┘
                              │
                       API / BFF Layer
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   Commerce Core          AI Platform          Platform Core
        │                     │                     │
 ┌──────┼────────┐     ┌──────┼─────────┐    ┌─────┼────────┐
 │      │        │     │      │          │    │     │        │
Shop  Grocery  Pharmacy RecSys Search  LLM  Auth  Payment  Events
 │      │        │
Bazaar Quick   E-Health
      Commerce
 │
Marketplace / P2P
```

---

## Domain Engines & Mathematical Formulations

### 1. Hybrid Search Engine (BM25 + 8D Vector Cosine via RRF)
Fuses lexical keyword matching with deep semantic vector representations using Reciprocal Rank Fusion:
$$\text{RRF}(d) = \sum_{m \in \{\text{lexical}, \text{vector}\}} \frac{1}{60 + \text{rank}_m(d)}$$
- **Lexical Score**: BM25-style term frequency weighting across title (3.0), brand (2.5), category (2.0), tags (1.5), and description (0.5).
- **Vector Cosine Similarity**: Normalized dot product over 8-dimensional semantic product embeddings.
- **Budget Constraint Enforcement**: Strict pre-filtering against natural language budget extractions (`"under 70k"`, `"below 1.5 lakh"`).

### 2. Bazaar Value-Commerce Deal Scoring
Scores discount deals across price tiers (Under ₹99, ₹199, ₹499, ₹999):
$$\text{ValueScore} = \left(\frac{\text{OriginalPrice} - \text{CurrentPrice}}{\text{OriginalPrice}}\right) \times \text{Rating} \times \log_{10}(10 + \text{ReviewCount})$$
Progressive multi-buy discount rules:
- 1 item: Standard price (0% extra)
- 2 items: Extra 10% volume discount
- 3+ items: Extra 15% super saver discount

### 3. Marketplace P2P Fraud Risk & Fair Price Engine
Computes seller trust and detects bait-and-switch counterfeit fraud:
$$\text{TrustScore} = \min\left(100, \text{AccountAgeScore} + \text{SalesVolumeScore} + \text{RatingScore} + \text{VerificationScore}\right)$$
- Flags listings with $>75\%$ price drops below fair market appraisal for mandatory manual review or automated blocking.

### 4. Idempotent Payment Orchestration
Prevents duplicate debits during high-concurrency network retries:
- In-memory idempotency cache keyed by `Idempotency-Key` header (5-minute TTL).
- Lifecycle state machine: `requires_confirmation` $\rightarrow$ `processing` $\rightarrow$ `succeeded` $\rightarrow$ double-entry ledger settlement.
- Supported rails: NPCI UPI 2.0, Linked Bank Account, Double-Entry Wallet, Credit/Debit Card, and Cash on Delivery.

### 5. Healthcare & Prescription Compliance Lifecycle
Ensures Schedule H drug safety gating under Indian CDSCO regulatory guidelines:
$$\text{UPLOADED} \longrightarrow \text{OCR\_EXTRACTED} \longrightarrow \text{PHARMACIST\_ASSIGNED} \longrightarrow \text{VERIFIED} \longrightarrow \text{APPROVED\_FOR\_DISPATCH}$$
- Checkout gating: Cart containing Schedule H drugs is strictly blocked from dispatch until verified by a licensed pharmacist (`KA-PH-39402`).

---

## Core Data Architecture

### PostgreSQL + pgvector Schema Highlights
- **Vector Indexing**: HNSW index on `embedding_8d` and `embedding (1536)` with `vector_cosine_ops` ($m=16, ef_{\text{construction}}=64$).
- **Partitioned Event Telemetry**: Range-partitioned `user_events` table for monthly high-throughput impression ingestion.
- **Multi-Role RBAC**: Roles supported: `customer`, `seller`, `pharmacy_operator`, `delivery_partner`, `ml_analyst`, `admin`.

### Redis Keyspace Hierarchy
- Recommendations: `recs:{userId}:{domain}`
- Active Session: `session:{sessionId}:state`
- Dark Store Stock: `stock:{storeId}:{productId}`
- Rate Limiter: `rate:{action}:{clientIp}`
- Idempotency Store: `idempotency:{key}`

---

## Resume & Portfolio Talking Points

> **Full-Stack & Distributed Systems Architecture:**
> *"Architected an enterprise Commerce OS unifying 5 retail domains (Flagship Tech, 10-Minute Dark-Store Groceries, E-Pharmacy, Value Bazaar, and C2C Marketplace) on a single modular monorepo. Built idempotent payment orchestration with atomic double-entry ledgers, preventing duplicate transactions under concurrent retries."*

> **Machine Learning & Recommender Systems (RecSys):**
> *"Implemented a production two-stage recommendation pipeline: multi-source candidate generation (collaborative filtering, content-based, session co-occurrence, trending), dynamic feature store assembly, and LightGBM LambdaMART learning-to-rank reranked with Maximal Marginal Relevance (MMR) category diversity."*

> **Hybrid AI Search & GenAI Agent:**
> *"Engineered hybrid search fusing BM25 lexical indexing with 8D vector cosine similarity via Reciprocal Rank Fusion (RRF). Built a controlled GenAI agent with dynamic tool calling across catalog search, dark-store SLA estimation, and prescription compliance verification."*
