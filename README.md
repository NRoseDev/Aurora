# Aurora: The All-In-One Creator Platform 🚀

Aurora is a web and mobile platform designed to eliminate creator burnout by combining automated multi-channel social publishing, AI-powered product creation, and a built-in link-in-bio storefront.

## 🌟 Core Features

- **Automated Social Engine**: Upload your video content and write a caption once. Aurora queues and publishes it automatically across TikTok, Instagram, and Facebook.
- **AI Smart Mockups**: Upload any design, photo, or drawing. Aurora automatically sharpens, re-pixelates, and resizes the artwork to perfectly fit shirts, mugs, and phone cases simultaneously.
- **Link-In-Bio Storefronts**: A clean, lightning-fast storefront integrated right into your custom link profile, eliminating the need for a separate shop provider.
- **Automated Fulfillment**: Uses Stripe Connect to instantly split customer payments—routing production costs to the dropshipping supplier and delivering pure profit straight to the creator.

## 📁 Repository Map

### Backend (`/backend`)
- `user_handler.py`: Manages basic user accounts and secure databases.
- `social_handler.py`: Securely stores authorization tokens for platform links.
- `content_handler.py`: Handles core scheduling and queues posts.
- `publisher_engine.py`: The background engine pushing live posts out via APIs.
- `ai_resizer.py`: Holds the logic for image upscaling and dynamic bounding box layout.
- `stripe_payments.py`: Formats multi-vendor checkout and creator payouts.
- `fulfillment_engine.py`: Dropships and routes orders to print-on-demand suppliers.

### Frontend (`/frontend`)
- `Dashboard.jsx`: The creator's dashboard for uploading and scheduling content.
- `Storefront.jsx`: The "Better-than-Beacons" mobile landing profile shop for fans.

### Database (`/database`)
- `schema.sql`: Core PostgreSQL tables mapping users, channels, master content, and the publishing queue.

