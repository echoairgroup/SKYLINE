# SKYLINE — Live Flight Radar

**Release 2.0.0 · Real worldwide aircraft map · Multi-page GitHub Pages website**

SKYLINE is a flight-radar portal for exploring real aircraft traffic. Its primary interface embeds the live global ADS-B radar from ADSB.lol. It is not a mock dashboard and contains no bundled sample flights.

## What the website does

- Displays a real global geographic map with live aircraft positions.
- Lets visitors pan and zoom across the world and select aircraft.
- Uses the provider's aircraft information panel for callsign, registration, aircraft type, altitude, speed, track, squawk and other available transponder fields.
- Provides regional map shortcuts.
- Provides live-map filters for callsign, aircraft type, registration, ICAO24 address, squawk and altitude.
- Provides an aircraft lookup page for ICAO24, registration or callsign.

## Pages

- `index.html` — Worldwide live radar with quick regional views.
- `traffic.html` — Filter aircraft on the live radar.
- `lookup.html` — Open an aircraft on the live radar by identifier.
- `about.html` — Product purpose, data sources, licensing and limitations.

## Actual live data

The map and aircraft data are supplied directly by ADSB.lol:

- Website/map: https://adsb.lol/
- Public API documentation: https://api.adsb.lol/docs
- Data and project details: https://www.adsb.lol/about

The live map is embedded as a first-party provider interface. This is intentional: GitHub Pages only serves static files and cannot proxy cross-origin API requests. Embedding the provider's own live map avoids inventing data or relying on an unauthorised third-party CORS proxy.

The website's filters use the public map URL parameters supported by the provider's tar1090 interface, including `icao`, `reg`, `filterCallSign`, `filterType`, `filterAltMin` and `filterAltMax`.

## Data coverage

ADSB.lol aggregates reports from independent community ADS-B/Mode-S receivers. Coverage and aircraft fields vary by location, altitude, receiver availability, antenna, aircraft transponder and provider operation. It is not possible to guarantee every aircraft or every field.

## Local use

No build step or package manager is required. Open `index.html` in a browser, or serve this directory with:

    python -m http.server 8000

## GitHub Pages

In GitHub, open **Settings → Pages** and select **GitHub Actions** as the source. The repository includes `.github/workflows/pages.yml`, which publishes the static website from `main`.

Expected website: https://echoairgroup.github.io/SKYLINE/

## Licensing and attribution

- Aircraft data and public API: ADSB.lol; ODbL 1.0 applies to the public dataset. Read the provider's [about page](https://www.adsb.lol/about) and [API docs](https://api.adsb.lol/docs).
- Base-map sources and attribution are presented within the embedded provider map. OpenStreetMap data is © OpenStreetMap contributors.
- SKYLINE uses the ADSB.lol live map as an embedded provider interface; the provider's own map controls, aircraft details, and data coverage remain subject to the provider's terms and availability.

## Safety

SKYLINE is an enthusiast flight-information portal, not certified ATC, navigation, dispatch or flight-safety equipment. Do not use it for operational decisions.

## Release 2.0.0

- Removed all fictional sample flights, airport statistics, fleet inventory and synthetic analytics.
- Replaced the schematic map with an embedded real global aircraft radar.
- Added regional map controls, live traffic filters and aircraft lookup.
- Added data-source and coverage documentation.
