# NoMash Library A2

Student: Xinyi Zhang  
Student number: 36667099

NoMash Library is a Vue 3 web application for managing a small campus library prototype. It includes dynamic JSON catalog data, user input validation, Firebase authentication, role-based page protection, request workflows, and a member rating feature.

## Run The Project

1. Run `npm install`
2. Copy `.env.example` to `.env` if the file exists in your submission package
3. Add Firebase web app values to `.env`
4. Run `npm run dev`
5. Open the local URL shown in the terminal

## Demo Routes

- `/` shows the application overview and live snapshot statistics
- `/catalog` loads books from JSON and allows signed-in users to rate titles
- `/join` validates and stores membership or service requests
- `/firebase-register` creates Firebase accounts and local library profiles
- `/firebase-signin` signs users in and loads their stored role
- `/dashboard` shows the protected member dashboard
- `/staff-hub` is restricted to Librarian and Manager profiles
- `/security` documents validation, access control, and storage decisions

## Role Testing

Member accounts do not need an access code.

Staff access codes for the local prototype:

- Librarian: `STACKS-2026`
- Manager: `HARBOR-2026`

Managers can approve service requests. Librarians can move requests into review or close them after follow-up. Staff access codes are validated during registration and are not stored in browser storage.

## Notes

The app uses local browser storage for prototype-only library profiles, ratings, and service requests. Firebase is used for email/password authentication. This is suitable for an assessment prototype, not for a production library system.

## Video Demo Checklist

1. Open the home page and show the live application snapshot.
2. Register a Member account and show validation feedback if fields are incomplete.
3. Sign in and open the protected dashboard.
4. Submit a membership or service request from the Join page.
5. Open the catalog, search/filter JSON data, and save a book rating.
6. Register or sign in as a Manager using `HARBOR-2026`.
7. Open Staff Hub, filter requests, and approve a request.
8. Show the Security page and explain the prototype security limitation.
