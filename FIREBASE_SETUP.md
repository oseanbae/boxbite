# Firebase Setup Instructions

## Installation

Install Firebase SDK:

```bash
npm install firebase
```

## Configuration

### Option 1: Environment Variables (Recommended)

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

The app will automatically use these environment variables if provided.

### Option 2: Direct Configuration

Edit `src/firebase/config.js` and replace the placeholder values in `firebaseConfig` with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "your_api_key_here",
  authDomain: "your_auth_domain_here",
  projectId: "your_project_id_here",
  storageBucket: "your_storage_bucket_here",
  messagingSenderId: "your_messaging_sender_id_here",
  appId: "your_app_id_here"
}
```

## Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (optional but recommended)
4. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database (start in test mode for development)
   - Deploy the security rules from `firestore.rules`:
     ```bash
     firebase deploy --only firestore:rules
     ```

## Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

## Features

- **Authentication**: Email/Password and Google sign-in
- **Firestore Sync**: Automatic syncing of favorites and weekly plans when authenticated
- **LocalStorage Fallback**: App works offline and without authentication using localStorage
- **One-time Migration**: Automatically migrates localStorage data to Firestore on first sign-in

## Testing Checklist

1. Start app unauthenticated — favorites & planner operate via localStorage
2. Sign up / Sign in — migration runs once; verify Firestore contains data
3. Sign in on another machine or incognito — verify data syncs from Firestore
4. Update favorite on device A — verify change visible on device B after reload
5. Delete a plan in Firestore, verify it's removed on other devices

