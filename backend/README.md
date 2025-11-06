# Carpool API

This is the backend API for the carpool application. It is built with Node.js, Express, and SQLite.

## Getting Started

1.  Install dependencies: `npm install`
2.  Start the server: `node server.js`

The server will start on `http://localhost:3001`.

## API Endpoints

### Authentication

*   **POST /api/register**

    *   Registers a new user.
    *   Request body: `{ "name": "John Doe", "email": "john.doe@example.com", "password": "password123" }`

*   **POST /api/login**

    *   Logs in a user.
    *   Request body: `{ "email": "john.doe@example.com", "password": "password123" }`

### Rides

*   **GET /api/rides**

    *   Gets all available rides.

*   **GET /api/rides/:id**

    *   Gets a specific ride by its ID.

*   **POST /api/rides**

    *   Creates a new ride.
    *   Requires authentication.
    *   Request body: `{ "origin": "New York, NY", "destination": "Boston, MA", "departure_time": "2024-07-25T10:00:00Z", "available_seats": 3 }`

*   **POST /api/rides/:id/request**

    *   Requests to join a ride.
    *   Requires authentication.

*   **PUT /api/rides/:ride_id/requests/:request_id**

    *   Accepts or rejects a ride request.
    *   Requires authentication (must be the driver of the ride).
    *   Request body: `{ "status": "accepted" }` or `{ "status": "rejected" }`

### Notifications

*   **GET /api/notifications**

    *   Gets all unread notifications for the authenticated user.
    *   Requires authentication.
