# Schedigo Frontend

This project is a vanilla JavaScript frontend for the **Schedigo** calendar application.
It interacts with a backend API to manage user accounts, events, and group schedules.

## Features
- Day, week and month calendar views
- Create, edit and delete events
- Search events by keyword or date
- Manage user groups and memberships
- Authentication with login, registration and email verification

## Repository Structure
- `public/` – HTML pages, CSS styles and static assets
- `controllers/` – controllers that bind models to views
- `models/` – data models representing accounts, events and other entities
- `services/` – API client and service wrappers used to talk to the backend
- `views/` – JavaScript modules implementing UI components

## Getting Started
1. Clone the repository.
2. Run a static HTTP server from the `public/html` directory. Examples:
   ```bash
   # Using Python
   python3 -m http.server 5500 --directory public/html
   # Or using http-server (npm)
   npx http-server public/html -p 5500
   ```
3. Open `http://localhost:5500/login.html` in your browser and sign in or register.
4. After logging in, navigate to `index.html` to access the calendar.

The frontend expects a backend running at `https://se_backend.hrzn.run/public_api`. Update `services/api.js` if you need to change this endpoint.

## Contributing
Pull requests are welcome. Please keep the code style consistent with the existing modules.