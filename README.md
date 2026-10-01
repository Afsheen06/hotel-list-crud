# Hotel List CRUD

A full-stack hotel management app: React (Redux Toolkit, React Router, React Helmet)
frontend + Express/PostgreSQL (native SQL, no ORM) backend.

## Folder structure

```
hotel-app/
  backend/
    server.js                  Express app entry point
    src/
      config/db.js             PostgreSQL connection pool (pg)
      config/schema.sql        Table definition — run once to set up the DB
      middleware/upload.js     Multer disk-storage config for hotel images
      controllers/hotelsController.js   Validation + SQL for all CRUD ops
      routes/hotels.js         Route → controller wiring
    uploads/                   Uploaded hotel images live here
    .env                       DB credentials (not committed in real projects)
  frontend/
    src/
      api/hotelsApi.js         fetch() wrapper for all backend calls
      app/store.js             Redux store
      features/hotels/hotelsSlice.js   Redux Toolkit slice (list, filters, pagination)
      components/              HotelForm, HotelCard, HotelList, SearchFilter,
                                Pagination, ConfirmDeleteModal, Toast, HotelMap
      pages/                   HotelListPage, HotelDetailPage
      App.jsx                  React Router routes
      main.jsx                 Providers: Redux, Router, Helmet
```

## Prerequisites
- Node.js 18 or later and npm
- PostgreSQL installed and running locally
- `psql` available on your `PATH`

## Setup

**1. Database**

Start the PostgreSQL service, then create the database and its tables. The commands
below use the default `postgres` role; adjust the role name for your installation.

```bash
psql -U postgres -c "CREATE DATABASE hotel_db;"
psql -U postgres -d hotel_db -f backend/src/config/schema.sql
```

On Windows PowerShell, run the same `psql` commands from the project root.

**2. Seed sample data (optional but recommended for demos)**
```bash
psql -U postgres -d hotel_db -f backend/src/config/seed.sql
```
Inserts 8 sample hotels (Marina Grand Hotel, Green Valley Resort, Royal Residency,
Heritage Palace, River View Inn, Beachside Resort, City Comfort Hotel, Hill View
Residency) so the list isn't empty on first run. Each row's `image_path` points to a
real local image already included in `backend/uploads/` — same local-storage approach
used for images uploaded through the app itself. Re-running the seed adds only hotels whose titles are missing; it does not clear existing rows.

**3. Backend**
```bash
cd backend
cp .env.example .env       # PowerShell: Copy-Item .env.example .env
# Set DB_USER and DB_PASSWORD in .env to match your PostgreSQL role.
npm install
npm start                  # runs on http://localhost:5000
```

**4. Frontend**
```bash
cd frontend
cp .env.example .env       # PowerShell: Copy-Item .env.example .env
npm install
npm run dev                # runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

The frontend API URL defaults to `http://localhost:5000/api`; change
`VITE_API_BASE_URL` in `frontend/.env` if the backend runs elsewhere. Keep local
`.env` files out of version control; the `.env.example` files contain placeholders
and safe local defaults.

## How the pieces connect

1. React app (`frontend`) calls the API through `src/api/hotelsApi.js`, which talks to
   `http://localhost:5000/api/hotels`.
2. Express (`backend/server.js`) routes requests to `src/routes/hotels.js`, which runs
   `src/controllers/hotelsController.js` functions.
3. Each controller function validates input, then runs a **parameterized SQL query**
   (`pool.query('... WHERE id = $1', [id])`) against PostgreSQL via `src/config/db.js`.
   Parameterized queries are what prevent SQL injection — never string-concatenate
   user input into SQL.
4. Uploaded images are saved to `backend/uploads/` by Multer; only the **path**
   (e.g. `/uploads/hotel-123.jpg`) is stored in the `hotels` table. The path is served
   back by Express's static file middleware and combined with `IMAGE_BASE_URL` on
   the frontend to build the `<img src>`.
5. Redux Toolkit (`hotelsSlice.js`) holds the **list page's** state — items, filters,
   and pagination — because that data is shared across components (list, filters,
   pagination controls). The add/edit form uses local `useState` instead, since form
   input is temporary and only relevant to that one component.

## Verification checklist

- [x] Add hotel
- [x] Edit hotel (same reusable `HotelForm` component)
- [x] Delete hotel (with confirmation modal)
- [x] Image upload
- [x] Image preview
- [x] Image stored locally (`backend/uploads/`)
- [x] Image path stored in PostgreSQL (`image_path` column)
- [x] Title validation (client + server)
- [x] Description validation (client + server)
- [x] Latitude validation (-90 to 90, client + server)
- [x] Longitude validation (-180 to 180, client + server)
- [x] Price validation (non-negative number, client + server)
- [x] Hotel cards (CSS grid, not a table)
- [x] Search by title
- [x] Price range filtering
- [x] Pagination
- [x] limit/offset backend support
- [x] Hotel detail page
- [x] Map with latitude/longitude (Leaflet + OpenStreetMap)
- [x] React Router (SPA navigation, no full reloads)
- [x] Redux (Redux Toolkit for hotel list state)
- [x] React Helmet (dynamic titles/meta on list + detail pages)
- [x] Image alt attributes on every image
- [x] Responsive UI (grid auto-fill + media queries)
- [x] Delete success notification (toast)
- [x] Proper error handling (loading/empty/error states, inline form errors)
- [x] Native SQL queries (raw `pg`, parameterized)
- [x] No ORM
- [x] SPA behavior

## Notes on ambiguous requirements

- **Map and Geolocation API**: Leaflet + OpenStreetMap displays the hotel's stored
  latitude/longitude. The "Show my location" button calls the browser's actual
  `navigator.geolocation.getCurrentPosition()` API and displays a blue visitor
  location circle alongside the hotel pin. It asks permission only on click,
  handles denial/unavailable/timeout/unsupported cases, and never stores visitor
  coordinates in PostgreSQL. Location access requires localhost or HTTPS.
  Map tiles require internet access; a retry message appears if they fail.
- **Build tool**: used **Vite** instead of Create React App, since CRA is deprecated
  and no longer maintained. Everything else (React, Redux Toolkit, React Router,
  React Helmet) matches the required stack exactly.
