# Aurora 🚀🌌
### The Ultimate Smart Creator Selling & Idea Incubator Platform

Aurora is a unified web and mobile platform designed to bridge creative product commerce with legally secure project incubation. The platform is cleanly split into two primary operational sections accessible directly from the main sidebar navigation, backed by an adaptive layer that offloads technical infrastructure so creators can maintain a pure flow state.

---

## 🧪 Strategic Roadmap & Agentic Evolution

- **Predictive Subscription Framework:** Shifting to a seamless, adaptive system that scales with the creator’s usage requirements dynamically.
- **Agentic Backend Integration:** Transitioning heavy infrastructure tasks, deployment pipelines, and subscription logic to autonomous agents.
- **Living Documentation:** This repository serves as our active documentation layer, evolving dynamically alongside the platform’s architectural growth.
- **Universal Accessibility Infrastructure:** App-wide framework supporting text typing, speech-to-text conversion, native ASL camera tracking, hardware external switch devices, and an immediate global toggle for Dyslexia-friendly typography.

---

## 🌟 Sidebar Navigation Sections

### 1. Snap 2 Fit (Product Design & Selling)
- **AI Smart Automation:** The native feature (`ai_resizer.py`) that automatically pixelates, sharpens, upscales, and auto-resizes uploaded designs onto any selected object (shirts, mugs, phone cases) simultaneously, eliminating hours of manual, one-by-one entry.
- **Instant AI Model Try-On Swaps:** Instantly maps and drapes user graphic designs onto hyper-realistic virtual models of diverse body types, shapes, and backgrounds on the spot.
- **Automated Multi-Channel Resizing:** Intelligently reformats, crops, and processes image assets across perfect aspect ratios for all major video and image feeds (TikTok 9:16, YouTube 16:9, Instagram 1:1) in a single batch layout.
- **Better-Than-Beacons Hosting:** A fast, integrated link-in-bio storefront landing page featuring a built-in checkout experience connected directly to `Storefront.jsx`.
- **Universal Multi-Gateway Payments:** Supports full global checkouts using Stripe, PayPal, Apple Pay, Google Pay, and Klarna (BNPL) via `payment_gateway_hub.py` to maximize sales conversions and mobile checkouts.
- **Hands-Free Dropshipping:** Automated multi-vendor payment routing via `fulfillment_engine.py` that separates manufacturing costs for print suppliers while instantly passing remaining product profit straight to the creator's wallet.
- **Digital Pipeline & Notification Shield:** An omnichannel notification router driving automated sales alerts via text, app push notifications, and a dedicated, isolated internal email hub to eliminate clutter. Includes a frequency slider to prevent alert flooding.
- **Advanced Automated Accounting Spreadsheets:** Built-in interactive ledger grids that automatically track, calculate, and break down Cost of Goods (COGS), Gross Sales, Net Profit, and localized estimated Sales Taxes across Weekly, Monthly, Quarterly, and Yearly views.
- **Tiered Scaling Commission Structure:** Creator-first pricing model that aligns with user growth metrics, charging an automated 5% platform fee for beginners, scaling to 8% for growing brands, and strictly capping platform commissions at an 11% ceiling.

### 2. Constellation (Idea Incubator & Collaboration Studio)
A protected workspace allowing innovators to connect with people who share similar dreams and ideas, built completely around automated legal safety nets to eliminate expensive attorney and legal document fees.
- **AI Questionnaire:** The onboarding gateway that processes your concept, analyzes alignment, and automatically formulates your foundational legal documents via `constellation_engine.py`.
- **NDA Protection:** Enforces platform-wide, industry-standard digital Non-Disclosure Agreements before any project ideas can be unlocked or pitched to potential partners.
- **The Core Collaboration Components:**
  1. **The Vault:** The secure master storage area where core concepts live under active, fully signed NDA protection.
  2. **Overflow:** The active development zone for handling ongoing tasks and scaling concepts currently in motion.
  3. **IdeaShelf:** A dedicated project track layer built to archive, invoke LLMs, and save paused project paths cleanly for later use without causing creator block.
  4. **IdeaBin:** A specialized standalone data ecosystem used to manage discarded tracks and ideas separately without altering core project dependencies.

---

## 📁 Repository Map

### Backend (`/backend`)
- `aurora_init.py`: Locate and initialize this script first to ensure correct backend initialization and platform functionality.
- `room_architecture.py`: Core foundational structural files detailing environment layout.
- `user_handler.py`: Tracks profile metrics, tier states, and adjusts platform subscription levels.
- `ai_resizer.py`: Houses the core engine that automatically sharpens and fits prints onto objects.
- `constellation_engine.py`: Manages the AI Questionnaire data, NDA triggers, routes data through IdeaShelf/IdeaBin, and executes Cross-Over Audience Predictive Algorithms matching Snap 2 Fit inventory metrics with targeted collaborator demographics.
- `content_handler.py`: Powers master media uploads, processes the Digital Pipeline alert systems, and maps distribution timelines.
- `payment_gateway_hub.py`: The master multi-payment processing router handling Stripe, PayPal, mobile wallets, and the dynamic tiered platform fee deductions.
- `fulfillment_engine.py`: Packages and dropships paid orders straight to automated print suppliers.

### Frontend (`/frontend`)
- `Dashboard.jsx`: The primary dashboard screen mapping live store inventory, active project states, and embedded automated accounting spreadsheets.
- `Storefront.jsx`: The mobile-first link-in-bio storefront and community portal interface with embedded size protocol connections.
- `Constellation.jsx`: The dedicated incubation workspace rendering the AI Questionnaire, The Vault, Overflow, IdeaShelf, and IdeaBin.

### Database (`/database`)
- `schema.sql`: Core relational database layout mapping custom subscription limits, tiered fee percentages, signature states, and zone allocation indexes.
