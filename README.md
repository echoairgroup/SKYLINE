# SKYLINE — Flight Operations

**Release 1.0.0 · Multi-page static website**

SKYLINE is a responsive aviation operations dashboard concept. The release includes six connected sections and a GitHub Pages deployment workflow.

## Pages

| Page | File | Purpose |
|---|---|---|
| Overview | index.html | Network dashboard, route preview, activity and flight board |
| Live map | live-map.html | Schematic global map with selectable sample aircraft |
| Flights | flights.html | Searchable/filterable flight board, details modal and CSV export |
| Airports | airports.html | Searchable airport directory and sample activity cards |
| Fleet | fleet.html | Aircraft register with type, registration, operator, base and status filters |
| Analytics | analytics.html | Sample performance chart, regional distribution and CSV export |
| About | about.html | Product overview, release notes and limitations |

## Run locally

No build step, package manager or server-side runtime is required. Open index.html in a browser, or serve the directory with any static web server:

    python -m http.server 8000

Then open http://localhost:8000.

## GitHub Pages

The repository includes .github/workflows/pages.yml. To deploy:

1. Open **Settings → Pages** in the GitHub repository.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Pushes to main will run the workflow and publish the static site.

The expected Pages address is https://echoairgroup.github.io/SKYLINE/ once Pages is enabled and the deployment workflow has completed successfully.

## Features

- Responsive shared navigation and layout across all pages.
- Light/dark theme preference saved in the browser.
- Live local clock and date.
- Selectable route-map aircraft and flight detail dialog.
- Search and status/region filters for flights.
- Search and region filter for airports.
- Search and status filter for fleet entries.
- CSV export for the flight board and analytics summary.
- Responsive canvas chart with 7-day, 30-day and 12-week views.
- Accessible labels, keyboard-operable flight rows and reduced-motion support.
- Custom SVG favicon and a branded 404 page.

## Data and operational limitations

**This release uses bundled fictional demonstration data.** Flight IDs, airline names, registrations, aircraft records, times, route progress, airport movements and analytics values are sample content created to demonstrate the interface. The route map is schematic and not to scale.

SKYLINE 1.0.0 is not connected to live ADS-B, airline dispatch systems, airport feeds, flight schedules, an API or a database. It does not provide certified navigation, dispatch, safety or operational decision support. Do not use the demonstration values for real-world aviation operations.

## Project structure

    SKYLINE/
    ├── .github/workflows/pages.yml
    ├── assets/favicon.svg
    ├── css/styles.css
    ├── js/app.js
    ├── js/data.js
    ├── index.html
    ├── live-map.html
    ├── flights.html
    ├── airports.html
    ├── fleet.html
    ├── analytics.html
    ├── about.html
    └── 404.html

## Release

- Version: 1.0.0
- Type: Static front-end release
- Target: GitHub Pages or any static host
- Dependencies: None at runtime; Google Fonts are optional external typography assets
