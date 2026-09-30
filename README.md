# Safarnama 🌍

Safarnama is a utility-first travel management, itinerary planning, and expense sharing application. Built with a native-first architecture on React and Firebase, it emphasizes a calm, intent-driven user experience and cuts out unnecessary abstractions for maximum performance.

## Core Features ✨

- **Trip Modes:** Support for Solo trips, fully collaborative Group trips, and Kaptan-managed trips.
- **Smart Settlements:** Real-time expense tracking with an optimized debt simplification algorithm and integrated UPI payment flows.
- **Itinerary & Mapping:** Interactive itinerary builder with location tagging (Maplibre-GL).
- **Group Planning:** Suggestion board and voting mechanism to decide on trip plans democratically.
- **Push Notifications:** Integrated Firebase Cloud Messaging (FCM) to keep group members updated.
- **Progressive Web App & TWA:** Fully installable as a PWA and wrapped as a Trusted Web Activity (TWA) for the Google Play Store.

## Tech Stack 🛠️

- **Frontend:** React, Vite, React Router
- **Styling:** Tailwind CSS (v4), shadcn/ui, Lucide React
- **Backend/Database:** Firebase (Auth, Firestore, Cloud Messaging)
- **Hosting:** Netlify
- **Architecture:** Native Firebase SDK integration. No redundant store wrappers (like Zustand) or service layers—direct data flows via React Context and Hooks.

## Repository Structure 📂

- **`client/`**: The entire frontend application and PWA/TWA configuration.
- **`firestore.rules`**: Security rules protecting the Firestore database.

*(Note: Safarnama uses a serverless architecture. All backend logic is enforced securely via Firestore Rules.)*

## Getting Started 🚀

### Prerequisites
- Node.js (v18 or higher recommended)
- A Firebase project with Auth, Firestore, and FCM enabled.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/uvic19/Safarnama.git
   cd Safarnama/client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase Environment Variables:**
   Create a `.env` file in the `client/` directory and add your Firebase config variables (see `.env.example`).

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Android (TWA) Build

Safarnama uses Google's `bubblewrap-cli` to generate a lightweight Android APK. 
**Important:** Because TWA dynamically loads the live web application from your hosting URL, you **do not** need to rebuild the APK when you make frontend code changes. You only need to rebuild the APK if you change the app icon, theme colors, or the app name in `twa-manifest.json`.

## Design System 🎨

Safarnama employs a "Monochrome Pro" theme focusing on:
- **Calm UX:** Deep Zinc backgrounds (`#09090B`) with subtle translucent borders (`white/[0.06]`).
- **Typography:** Display fonts for distinctive headings and highly legible body text.

## License 📄

This project is open-source and available under the MIT License.
