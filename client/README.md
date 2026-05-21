# Safarnama Client

A beautiful travel management app built with React, Vite, Tailwind CSS, and Firebase.

## Setup Instructions

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Install Dependencies
Run the following command in the `client` directory:
```bash
npm install
```

### 3. Firebase Configuration
To keep your credentials secure, Firebase configuration values are externalized using environment variables.

1. Create a copy of `.env.example` named `.env` in the `client` directory:
   ```bash
   cp .env.example .env
   ```
2. Set up a new project in the [Firebase Console](https://console.firebase.google.com/).
3. Enable **Authentication** (Google and Email/Password providers) and **Firestore Database** in the console.
4. Register a new Web App in your Firebase project settings to get your configuration object.
5. Populate the `.env` file with your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 4. Running the Development Server
Start the local server:
```bash
npm run dev
```

### 5. Building for Production
To build the application for deployment:
```bash
npm run build
```
