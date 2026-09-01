# Emergency Preparedness App

A React Native mobile application for storing and organizing emergency-preparedness information on a device.

The app includes supplies, emergency contacts, saved locations, household information, emergency plans, checklists, and preparedness guides.

## What I Implemented

* Built the application with React Native and Expo
* Used Expo Router for file-based screen routing
* Created separate areas for supplies, contacts, locations, plans, guides, and emergency scenarios
* Created a local SQLite database
* Designed tables for supplies, contacts, plans, checklist items, guides, locations, settings, and household information
* Added indexes for frequently queried data
* Created versioned database migrations
* Read the current database version with `PRAGMA user_version`
* Ran schema changes inside transactions
* Added rollback behavior when a migration fails
* Added a separate database query layer
* Added seeded preparedness data
* Used TypeScript across the application

## What I Learned

This project taught me how to structure a larger mobile application with several related areas of data.

I learned how file-based routing in Expo Router maps folders and files to application screens and how nested routes can organize a mobile interface.

The database work taught me more about schema design. Supplies, contacts, plans, checklist items, locations, guides, and household data have different fields and relationships, so I had to decide how to represent each one in SQLite.

I also learned why database migrations matter. An application cannot simply delete and recreate a user's database every time its structure changes. I added schema versions and migrations so the database can move from one version to the next.

Running migrations inside transactions also taught me why `COMMIT` and `ROLLBACK` matter when several schema changes belong together.

## What This Project Demonstrates

* React Native development
* Expo
* TypeScript
* File-based mobile routing
* SQLite database design
* Database indexes
* Schema migrations
* SQL transactions
* Local data persistence
* Organizing a multi-screen mobile application

## Tech Used

* React Native
* Expo
* TypeScript
* Expo Router
* Expo SQLite
* Zustand
* React Navigation

## Running the Project

```bash
npm install
npm start
```

Other targets:

```bash
npm run android
npm run ios
npm run web
```
