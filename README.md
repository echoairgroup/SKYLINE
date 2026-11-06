# SKYLINE — Live Flight Radar

**Release 2.0.0 · Real ADS-B feed · Multi-page GitHub Pages website**

SKYLINE is an enthusiast aircraft-tracking website. It plots real aircraft positions returned by the public ADSB.lol API on a real OpenStreetMap basemap.

## Product purpose

Explore aircraft reported by independent ADS-B/Mode-S receivers in a selected geographic area; inspect their currently reported transponder data; search by callsign, registration or ICAO24 address.

## Pages

- `index.html` — Interactive geographic radar map. Drag the map to choose another radar centre; the data query covers up to 250 nautical miles from that centre.
- `traffic.html` — Searchable table of currently returned aircraft in the selected area.
- `lookup.html` — Query live aircraft records by callsign, registration or ICAO24.
- `about.html` — Product purpose, data meanings, limitations, licensing and attribution.

## Data providers

### Aircraft positions: ADSB.lol

The website calls the public API directly from the visitor's browser:

- Radar area: `https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/250`
- Callsign: `https://api.adsb.lol/v2/callsign/{callsign}`
- Registration: `https://api.adsb.lol/v2/reg/{registration}`
- ICAO24: `https://api.adsb.lol/v2/hex/{icao24}`

The API returns real receiver-network observations. Missing values stay missing; SKYLINE does not invent a callsign, registration, route, schedule or position. API availability and rate limits are controlled by ADSB.lol. Its documentation says limits are dynamic and recommends contacting the operator before production use. The API and public data are published under ODbL 1.0.

### Map: OpenStreetMap

Leaflet displays geographic tiles from `tile.openstreetmap.org`. Visible attribution is included. Follow the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and attribution requirements. The map is not a navigation chart.

## Refresh behaviour

The selected radar area refreshes periodically while the page is visible. Moving the map to a new location requests a new area. If the provider returns HTTP 429 or another error, the page shows an error rather than making up aircraft or positions; retry is backed off.

## Run locally

No build tool or package installation is required. Open `index.html` in a browser or serve the folder using a local static server:

    python -m http.server 8000

Open http://localhost:8000.

## GitHub Pages

The repository includes `.github/workflows/pages.yml`. In GitHub, open **Settings → Pages** and choose **GitHub Actions** as the source. Pushes to `main` publish the static site.

Expected URL: https://echoairgroup.github.io/SKYLINE/

## Licensing and operational use

ADSB.lol public data: [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Map data: © OpenStreetMap contributors. Leaflet and MarkerCluster are third-party open-source libraries.

This is an enthusiast situational-awareness tool, not certified ATC, navigation, dispatch or flight-safety equipment. Coverage is incomplete and may be delayed, unavailable or inaccurate. Do not use it for real-world operational decisions.

## Release 2.0.0

- Removed all fictional sample flights, sample airport statistics and mock fleet/analytics pages.
- Added a real Leaflet map with OpenStreetMap geographic tiles.
- Added live ADS-B area queries and aircraft markers from ADSB.lol.
- Added selected-aircraft details, nearby aircraft list, filters and aircraft lookup.
- Added explicit coverage, refresh, source and limitations information.
- Added responsive navigation and a coherent multi-page product.
