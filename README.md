# BridgeWell Health Connect A2

Student: Xinyi Zhang  
Student number: 36667099

BridgeWell Health Connect is a Vue 3 web application prototype for a health charity that supports migrant communities. It includes dynamic JSON resource data, user input validation, Firebase authentication, role-based page protection, support request workflows, and a community rating feature.

The A3 extension also adds a cloud summary endpoint, email workflow support with attachments, CSV export for directory and staff data, geolocation-based map support, and stronger accessibility support.

## Run The Project

1. Run `npm install`
2. Copy `.env.example` to `.env` if the file exists in your submission package
3. Add Firebase web app values to `.env`
4. Add `RESEND_*` values if you want the cloud email workflow to send real emails with attachments
5. Run `npm run dev`
6. Open the local URL shown in the terminal

## Demo Routes

- `/` shows the application overview and live snapshot statistics
- `/catalog` loads health resources from JSON and allows signed-in users to rate usefulness
- `/join` validates and stores support or intake requests
- `/contact` prepares an email draft and validates the cloud email workflow
- `/map` shows support hubs on a map and uses geolocation to select the nearest hub
- `/firebase-register` creates Firebase accounts and local support profiles
- `/firebase-signin` signs users in and loads their stored role
- `/dashboard` shows the protected member dashboard
- `/staff-hub` is restricted to Support Worker and Program Manager profiles
- `/security` documents validation, access control, and storage decisions
- `/api/summary` is a cloud function endpoint used for the home-page snapshot

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
6. Use the home-page cloud summary and nearest-hub location feature.
7. Open the map page and show search, geolocation, and directions.
8. Open the email support page and validate or send a support email with an attachment.
9. Register or sign in as a Program Manager using `BRIDGE-2026`.
10. Open Staff Hub, filter requests, export CSV, and approve a request.
11. Show the Security page and explain the prototype security limitation.
