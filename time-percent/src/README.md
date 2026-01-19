# Year Progress App

A simple single-page app that shows how much of the year has elapsed, built with Luxon and Vite.

## Setup

1. Install dependencies:
```bash
npm install
```

## Development

Run the dev server:
```bash
npm run dev
```

Then open the URL shown in your terminal (usually http://localhost:5173)

## Build for Production

Build the app into a single bundled file:
```bash
npm run build
```

The built files will be in the `dist` folder. You can open `dist/index.html` directly in a browser or deploy the `dist` folder to any static hosting service.

## Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## Features

- Shows percentage of year completed
- Displays days elapsed, total days in year, and days remaining
- Automatically accounts for leap years
- Updates every hour
- Responsive design with gradient background
