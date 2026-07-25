# BridgeWell Health Connect A2

Student: Xinyi Zhang  
Student number: 36667099

BridgeWell Health Connect is a Vue 3 web application prototype for a health charity that supports migrant communities. It includes dynamic JSON resource data, user input validation, Firebase authentication, role-based page protection, support request workflows, and a community rating feature.

## Run The Project

1. Run `npm install`
2. Copy `.env.example` to `.env` if the file exists in your submission package
3. Add Firebase web app values to `.env`
4. Run `npm run dev`
5. Open the local URL shown in the terminal

## Demo Routes

- `/` shows the application overview and live snapshot statistics
- `/catalog` loads health resources from JSON and allows signed-in users to rate usefulness
- `/join` validates and stores support or intake requests
- `/firebase-register` creates Firebase accounts and local support profiles
- `/firebase-signin` signs users in and loads their stored role
- `/dashboard` shows the protected member dashboard
- `/staff-hub` is restricted to Support Worker and Program Manager profiles
- `/security` documents validation, access control, and storage decisions

## Role Testing

Community member accounts do not need an access code.

Staff access codes for the local prototype:

- Support Worker: `CARE-2026`
- Program Manager: `BRIDGE-2026`

Program Managers can approve support requests. Support Workers can move requests into review or close them after follow-up. Staff access codes are validated during registration and are not stored in browser storage.

## Notes

The app uses local browser storage for prototype-only support profiles, ratings, and service requests. Firebase is used for email/password authentication. This is suitable for an assessment prototype, not for a production charity platform.

## Video Demo Checklist

1. Open the home page and show the live application snapshot.
2. Register a Community Member account and show validation feedback if fields are incomplete.
3. Sign in and open the protected dashboard.
4. Submit a support or intake request from the Support page.
5. Open the resource directory, search/filter JSON data, and save a usefulness rating.
6. Register or sign in as a Program Manager using `BRIDGE-2026`.
7. Open Staff Hub, filter requests, and approve a request.
8. Show the Security page and explain the prototype security limitation.
