# Aurora: The Ultimate Smart Creator Selling & Idea Incubator Platform 🚀🌌

Aurora is a unified web and mobile platform designed to bridge creative product commerce with legally secure project incubation. The platform is cleanly split into two primary operational sections accessible directly from the main sidebar navigation.

## 🌟 Sidebar Navigation Sections

### 1. Snap 2 Fit (Product Design & Selling)
- **AI Smart Automation**: The native feature that automatically pixelates, sharpens, upscales, and auto-resizes uploaded designs onto any selected object (shirts, mugs, phone cases) simultaneously, eliminating hours of manual, one-by-one entry.
- **Instant AI Model Try-On Swaps**: Instantly maps and drapes user graphic designs onto hyper-realistic virtual models of diverse body types, shapes, and backgrounds on the spot.
- **Automated Multi-Channel Resizing**: Intelligently reformats, crops, and processes image assets across perfect aspect ratios for all major video and image feeds (TikTok 9:16, YouTube 16:9, Instagram 1:1) in a single batch layout.
- **Better-Than-Beacons Hosting**: A fast, integrated link-in-bio storefront landing page featuring a built-in checkout experience.
- **Universal Multi-Gateway Payments**: Supports full global checkouts using Stripe, PayPal, Apple Pay, Google Pay, and Klarna (BNPL) to maximize sales conversions and mobile checkouts.
- **Hands-Free Dropshipping**: Automated multi-vendor payment routing that separates manufacturing costs for print suppliers while instantly passing remaining product profit straight to the creator's wallet.

### 2. Constellation (Idea Incubator & Collaboration Studio)
A protected workspace allowing innovators to connect with people who share similar dreams and ideas, built completely around automated legal safety nets to eliminate expensive attorney and legal document fees.
- **AI Questionnaire**: The onboarding gateway that processes your concept, analyzes alignment, and automatically formulates your foundational legal documents.
- **NDA Protection**: Enforces platform-wide, industry-standard digital Non-Disclosure Agreements before any project ideas can be unlocked or pitched to potential partners.
- **The Core Collaboration Components**:
  1. **The Vault**: The secure master storage area where core concepts live under active, fully signed NDA protection.
  2. **Overflow**: The active development zone for handling ongoing tasks and scaling concepts currently in motion.
  3. **IdeaShelf**: A dedicated project track layer built to archive, invoke LLMs, and save paused project paths cleanly for later use without causing creator block.
  4. **IdeaBin**: A specialized standalone data ecosystem used to manage discarded tracks and ideas separately without altering core project dependencies.

## 📁 Repository Map

### Backend (`/backend`)
- `user_handler.py`: Tracks profile metrics and adjusts platform permission states.
- `ai_resizer.py`: Houses the core engine that automatically sharpens and fits prints onto objects.
- `constellation_engine.py`: Manages the AI Questionnaire data, NDA triggers, and routes data through IdeaShelf and IdeaBin.
- `content_handler.py`: Powers master media uploads and maps distribution timelines.
- `payment_gateway_hub.py`: The master multi-payment processing router handling Stripe, PayPal, and mobile wallets.
- `fulfillment_engine.py`: Packages and dropships paid orders straight to automated print suppliers.

### Frontend (`/frontend`)
- `Dashboard.jsx`: The primary dashboard screen mapping live store inventory and active project states.
- `Storefront.jsx`: The mobile-first link-in-bio storefront and community portal interface.
- `Constellation.jsx`: The dedicated incubation workspace rendering the AI Questionnaire, The Vault, Overflow, IdeaShelf, and IdeaBin.

### Database (`/database`)
- `schema.sql`: Core relational database layout mapping custom subscription limits, signature states, and zone allocation indexes.
