# NoMash Library Topic 7

This project reuses the earlier NoMash Library structure and adds Firebase authentication for Lab Topic 7.

## Setup

1. Run npm install
2. Copy .env.example to .env
3. Paste the Firebase web app values from your Firebase Console into .env
4. Run npm run dev

## Pages for screenshots

- /firebase-register: registration page
- /firebase-signin: sign-in page with role selection
- /role-portal: protected page showing the signed-in user and selected role
- /firebase-logout: logout page with current user state

Open the browser developer console while testing. The app logs the current Firebase user on sign-in and sign-out to support the lab screenshots.
