# A3 Submission Template Answers

Student: Xinyi Zhang  
Student Number: 36667099

## Code Location

Main project folder:

`C:\Users\admin\Documents\fit5032\xinyi-zhang-36667099-a2-work`

Main source code folder:

`C:\Users\admin\Documents\fit5032\xinyi-zhang-36667099-a2-work\src`

Important files:

- `src/views/HomeView.vue`
- `src/views/ContactSupportView.vue`
- `src/components/JSONLab.vue`
- `src/views/AboutView.vue`
- `src/views/RolePortalView.vue`
- `src/views/FirebaseRegisterView.vue`
- `src/views/FirebaseSigninView.vue`
- `src/router/index.js`
- `src/libraryStore.js`
- `src/auth.js`
- `src/utils/csv.js`
- `api/summary.js`
- `api/contact.js`
- `vercel.json`

## GitHub

GitHub username:

`xzha0638-sudo`

Repository:

`https://github.com/xzha0638-sudo/xinyi-zhang-36667099-a2-a3`

## Business Requirement D

### D.1 External authentication

Implemented with Firebase email/password authentication in `FirebaseRegisterView.vue` and `FirebaseSigninView.vue`.

- users register with email and password
- staff roles are linked to the stored support profile
- protected routes redirect unauthorised users to sign-in

### D.2 Email workflow

Implemented in `ContactSupportView.vue` and `api/contact.js`.

- users can prepare a structured support email
- the page validates name, email, subject, and message length
- users can open their mail client or copy the draft
- the cloud function returns a reference ID for the request

### D.3 Interactive table data

Implemented in `JSONLab.vue` and `AboutView.vue`.

- the resource directory is searchable and filterable
- users can rate resources with live updates
- staff can review support requests in a table
- request status can be changed directly from the table

### D.4 Deployment to the cloud

Implemented with `vercel.json` and the existing Vercel-ready build setup.

- the app is prepared for cloud deployment
- SPA routing falls back to `index.html`
- cloud endpoints are available through `/api/*`

## Business Requirement E

### E.1 Cloud functions

Implemented in `api/summary.js` and `api/contact.js`.

- `/api/summary` provides live summary data for the home page
- `/api/contact` validates the email workflow and returns a reference ID

### E.2 Geolocation

Implemented in `HomeView.vue` and `libraryStore.js`.

- the app can use browser geolocation
- it finds the nearest support hub from the current position
- hub accessibility information is shown with the result

### E.3 Accessibility

Implemented through `App.vue`, `src/assets/style.css`, and page-level form labels.

- skip link added for keyboard users
- focus-visible styles added for interactive controls
- reduced-motion support added
- forms use clear labels and descriptive helper text

### E.4 Export

Implemented in `JSONLab.vue` and `AboutView.vue`.

- the visible resource directory can be exported to CSV
- the staff request list can be exported to CSV
- exported files support review and reporting

## Business Requirement F

### F.1 Innovation

Implemented through a combined support experience rather than a single isolated feature.

- cloud summary snapshot on the home page
- nearest-hub recommendation using location
- email draft workflow with validation and clipboard support
- staff CSV export for reporting

## Video

Paste your Google Drive video link here before submission.

Suggested description:

`This video demonstrates Business Requirements D, E, and F, including Firebase authentication, email workflow support, interactive tables, cloud functions, geolocation, accessibility, CSV export, and the innovative support hub recommendations.`

## Reflection

Write this section yourself without AI assistance.

Suggested prompt for your own notes:

- what changed most in the app during A3
- what was hardest to implement
- what you would improve next

## Acknowledgement of AI use

Use this section honestly.

- I used ChatGPT / Codex to help plan the A3 feature coverage, draft wording for the submission notes, and organise the D/E/F mapping.
- I used it to review the code structure and suggest implementation ideas for cloud functions, CSV export, geolocation, and accessibility.
- I reviewed and edited all final wording before submission.

## Client / Project Summary

`BridgeWell Health Connect is a health charity web application designed to support migrant communities. The platform provides wellbeing resources, support request pathways, role-based staff workflows, and community ratings to help users find accessible and trustworthy health information.`
