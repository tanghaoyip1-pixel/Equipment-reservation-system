# Lab — Equipment Reservation System

裝置使用予約システム | Laboratory Equipment Management

A web-based equipment reservation calendar for research laboratories. Built by adapting the [lims-project-FE](https://github.com/krisssix/lims-project-FE) frontend by Kristina Nazarjanova.

## Features

- **Day / Week / Month calendar views** with continuous reservation blocks
- **Cross-midnight reservations** (e.g. 22:00 → 03:00 next day)
- **5 equipment categories** (Furnace, Laser System, Laser, Measurement, Others) — 33 real lab devices
- **Batch reservation** — create multiple reservations at once across dates & devices
- **Conflict detection** — prevents double-booking
- **No login required** — name-based public booking
- **Admin password** — protects device management
- **Print support** — A4 landscape print of calendar

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Language | TypeScript 5.6 |
| UI Library | Vuetify 3 + Material Design Icons |
| State | Pinia 2 |
| Routing | Vue Router 4 |
| HTTP | Axios |
| Build | Vite 5 |
| Backend | Python 3 + Flask |
| Database | SQLite 3 |
| Auth | Name-based (no login) |

## Architecture

```
src/
├── components/          # Reusable Vue components
│   ├── calendar/        #   CalendarGrid, CalendarToolbar
│   ├── reservation/     #   ReservationForm, ReservationCard, BatchReservationForm
│   ├── device/          #   DeviceForm, DeviceCard, DeviceDeleteDialog
│   └── ui/              #   ConfirmDialog
├── layouts/             # Page layout templates
├── pages/               # Route-level page components
├── plugins/             # Vuetify & app plugins
├── router/              # Vue Router config
├── services/api/        # HTTP API layer (Axios)
├── stores/              # Pinia state management
├── types/               # TypeScript type definitions
└── backend/             # Flask + SQLite backend
    └── app.py           #   Single-file REST API server
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3

### Install & Run

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
pip3 install flask flask-cors

# Start backend (port 8080)
cd backend
python3 app.py

# Start frontend (port 3000) — new terminal
npm run dev
```

Or start both at once:
```bash
npm run dev:full
```

Open http://localhost:3000

## Default Password

Admin password for device management: `admin123` (change in Settings)

## Authors

浩一 (Koichi) & Claude Coding

## Acknowledgments

Based on [lims-project-FE](https://github.com/krisssix/lims-project-FE) by Kristina Nazarjanova.
