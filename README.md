# Vehicle App - Setup

## Prerequisites

Before getting started make sure you have installed the following:
- Node.js v20+
- AWS CLI (configured with your profile)
- Android Studio (for running the Android emulator)

## Environment Variables

- Take a look at each of the `.env.example`  files for the required variables and create your `.env` files entering the values for each env var.
```
cd infrastructure/.env.example
cd vehiclemobile/.env.example
```

- NOTE - `vehiclemobile/.env` - `API_URL` and `WEBSOCKET_URL` values will be automatically populated after deployment


## Installation and Build

### Core API
```
cd core-api
npm install
npm run build
```

## Entry API
```
cd entry-api
npm install
npm run build
```

## Infrastructure and Deployment
```
cd infrastructure
npm install
npm run deploy
```

## Running the Mobile App

Start the Metro bundler:
```
cd vehiclemobile
npm install
npm start
```

In a separate terminal, run android:
```
cd vehiclemobile
npm run android
```
## Default Users
- Two users are automatically seeded on first deployment. Their credentials are configured in `infrastructure/.env` . Check `infrastructure/.env.example` for more info on users config.

## Generating a Hashed Password
- If you need to manually generate a hashed password:
```
cd infrastructure
npm run hash-password <yourpassword>
```
## Architecture
![Architecture Diagram](docs/Vehicle%20App%20Architecture%20Diagram.drawio.png)
