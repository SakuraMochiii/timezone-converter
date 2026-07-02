# Timezone Converter

An interactive web app for comparing time zones and finding optimal meeting windows across cities worldwide. Built for scheduling interviews and meetings across multiple time zones.

## Features

- **Interactive World Map** — Click cities on a dark-themed map (Leaflet + CARTO tiles) to add time zones for comparison
- **Visual Timeline** — Color-coded 24-hour strips for each selected zone:
  - Green = business hours (9 AM–6 PM)
  - Amber = early/late (7–9 AM, 6–9 PM)
  - Dark = sleeping hours
- **Time Slider** — Drag to pick an hour and see instant conversions across all zones
- **Manual Input** — Type a single time (`9 AM`, `14`, `2:00 PM`) or a range (`9-5`, `9am-5pm`) to highlight intervals
- **Reference Zone Picker** — Choose which timezone is your reference for the slider and axis
- **Overlap Finder** — Automatically calculates the best meeting windows when 2+ zones are selected
- **20 Major Cities** — Pre-populated markers for San Francisco, New York, London, Shanghai, Tokyo, Sydney, and more

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. Click cities on the map to add them to your comparison
2. Use the dropdown to set your reference timezone
3. Drag the slider or type a time/range to see conversions
4. Check the "Best meeting times" section for overlapping windows

## Tech Stack

- React + Vite
- Leaflet / React-Leaflet (map)
- Luxon (timezone math)
- CARTO dark basemap tiles

## Build

```bash
npm run build
```

Output goes to `dist/`.
