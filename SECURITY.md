# Security Policy

## Firebase API Keys

This repository contains Firebase client-side API keys in `src/firebase.ts`. **This is intentional and safe.**

### Why these keys are public:

1. Firebase client API keys are designed to be included in client-side code
2. They are exposed in the browser's JavaScript bundle by design
3. All security is enforced through Firebase Security Rules (see `firestore.rules`)
4. These keys only identify the Firebase project, not authenticate admin access

### Official Documentation:

- [Firebase: Is it safe to expose Firebase apiKey?](https://firebase.google.com/docs/projects/api-keys)
- Google's stance: "Unlike how API keys are typically used, API keys for Firebase services are not used to control access to backend resources"

### Actual Security Measures:

- ✅ Firebase Security Rules control all data access
- ✅ Firestore Rules validate user permissions
- ✅ No admin/service account credentials in this repo
- ✅ No private keys or secrets

If you have security concerns, please review our `firestore.rules` file.
