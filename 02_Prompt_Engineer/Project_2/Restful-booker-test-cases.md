# Restful Booker API Test Cases

This document covers test cases for the documented Restful Booker API endpoints, including happy paths, error scenarios, and edge cases.

## 1. Auth: Create Token (`POST /auth`)

1.1 Happy path: valid credentials
- Request: `POST https://restful-booker.herokuapp.com/auth`
- Body: `{"username": "admin", "password": "password123"}`
- Expected: `200 OK`, response contains non-empty `token`

1.2 Error scenario: invalid credentials
- Request: same endpoint
- Body: `{"username": "admin", "password": "wrongpassword"}`
- Expected: authentication failure (e.g. `403 Forbidden` or `401 Unauthorized`), no token returned

1.3 Error scenario: missing username
- Request: `POST /auth`
- Body: `{"password": "password123"}`
- Expected: validation failure (client error), error message indicating missing username

1.4 Error scenario: missing password
- Request: `POST /auth`
- Body: `{"username": "admin"}`
- Expected: validation failure, error message indicating missing password

1.5 Edge case: empty username and password
- Request: `POST /auth`
- Body: `{"username": "", "password": ""}`
- Expected: authentication failure and clear error response

## 2. Booking: Get Booking IDs (`GET /booking`)

2.1 Happy path: retrieve all booking IDs
- Request: `GET https://restful-booker.herokuapp.com/booking`
- Expected: `200 OK`, JSON array of objects with `bookingid`

2.2 Happy path: filter by firstname and lastname
- Request: `GET /booking?firstname=Sally&lastname=Brown`
- Expected: `200 OK`, array of booking IDs matching those names

2.3 Happy path: filter by date range
- Request: `GET /booking?checkin=2014-03-13&checkout=2014-11-13`
- Expected: `200 OK`, booking IDs for bookings with checkin and/or checkout within the range

2.4 Error scenario: invalid date format
- Request: `GET /booking?checkin=03-13-2014&checkout=2014/11/13`
- Expected: client error (e.g. `400 Bad Request`) or empty results with an error message about date format

2.5 Edge case: query with no matches
- Request: `GET /booking?firstname=NoSuchName&lastname=Nobody`
- Expected: `200 OK`, empty array

2.6 Edge case: partial query values
- Request: `GET /booking?firstname=Sally`
- Expected: `200 OK`, valid array of booking IDs for first name only

## 3. Booking: Get Booking by ID (`GET /booking/:id`)

3.1 Happy path: retrieve booking JSON by valid ID
- Request: `GET https://restful-booker.herokuapp.com/booking/1`
- Header: `Accept: application/json`
- Expected: `200 OK`, valid booking JSON with `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates`, `additionalneeds`

3.2 Happy path: retrieve booking XML by valid ID
- Request: same endpoint
- Header: `Accept: application/xml`
- Expected: `200 OK`, valid XML response with booking data

3.3 Error scenario: non-existing booking ID
- Request: `GET /booking/999999`
- Expected: `404 Not Found` or equivalent error response

3.4 Error scenario: invalid ID type
- Request: `GET /booking/abc`
- Expected: client error or `404 Not Found`, no booking data

3.5 Edge case: ID zero or negative
- Request: `GET /booking/0` and `GET /booking/-1`
- Expected: `404 Not Found` or validation error

## 4. Booking: Create Booking (`POST /booking`)

4.1 Happy path: create booking with JSON body
- Request: `POST https://restful-booker.herokuapp.com/booking`
- Header: `Content-Type: application/json`
- Body: valid booking JSON
- Expected: `200 OK`, response contains `bookingid` and returned `booking` object matching request data

4.2 Happy path: create booking with XML body
- Request: `POST /booking`
- Header: `Content-Type: text/xml`
- Body: valid booking XML
- Expected: `200 OK`, XML booking response containing created booking data

4.3 Happy path: create booking with URL-encoded form data
- Request: `POST /booking`
- Header: `Content-Type: application/x-www-form-urlencoded`
- Body: valid form-encoded booking values
- Expected: `200 OK`, response contains `bookingid` and booking details

4.4 Error scenario: missing required fields
- Request: `POST /booking` with JSON missing `firstname` or `lastname`
- Expected: validation failure `400 Bad Request`, error message about missing fields

4.5 Error scenario: invalid date format in bookingdates
- Request: `POST /booking` with `checkin=01-01-2018` or `checkout=01/01/2019`
- Expected: validation error or rejection due to invalid date format

4.6 Edge case: zero or negative totalprice
- Request: `POST /booking` with `totalprice: 0` and `totalprice: -10`
- Expected: either success if allowed by API or explicit validation error; verify behavior is consistent and documented

4.7 Edge case: very long `additionalneeds`
- Request: `POST /booking` with a very long string in `additionalneeds`
- Expected: success or an appropriate validation error if there is a max length limit

## 5. Booking: Update Booking (`PUT /booking/:id`)

5.1 Happy path: full update with valid auth token and JSON
- Setup: create a booking, get auth token from `/auth`
- Request: `PUT https://restful-booker.herokuapp.com/booking/{id}`
- Headers: `Content-Type: application/json`, `Accept: application/json`, `Cookie: token=<token>` or `Authorization: Basic ...`
- Body: complete booking JSON with changed values
- Expected: `200 OK`, response contains updated booking data matching request values

5.2 Error scenario: unauthorized without token
- Request: same endpoint without `Cookie` or `Authorization`
- Expected: `403 Forbidden` or `401 Unauthorized`

5.3 Error scenario: invalid/expired token
- Request: same endpoint with invalid token
- Expected: `403 Forbidden` or `401 Unauthorized`

5.4 Error scenario: update with invalid content type
- Request: `PUT /booking/{id}` with `Content-Type: application/xml` but JSON body
- Expected: rejection or validation error

5.5 Edge case: update only one field with full payload defaults
- Request: `PUT /booking/{id}` with valid JSON but only one field changed and others preserved
- Expected: `200 OK`, returned booking contains all required fields and new value applied

5.6 Edge case: update non-existing booking ID
- Request: `PUT /booking/999999`
- Expected: `404 Not Found` or error indicating booking not found

## 6. Booking: Partial Update Booking (`PATCH /booking/:id`)

6.1 Happy path: partial update with token and JSON
- Request: `PATCH /booking/{id}`
- Headers: `Content-Type: application/json`, `Accept: application/json`, `Cookie: token=<token>`
- Body: `{"firstname":"James","lastname":"Brown"}`
- Expected: `200 OK`, response contains updated fields while preserving others

6.2 Error scenario: no auth token provided
- Request: same endpoint without auth
- Expected: `403 Forbidden` or `401 Unauthorized`

6.3 Error scenario: invalid partial field value
- Request: `PATCH /booking/{id}` with invalid `depositpaid` type or malformed date
- Expected: validation error or `400 Bad Request`

6.4 Edge case: patch with empty body
- Request: `PATCH /booking/{id}` with empty JSON `{}` or no body
- Expected: either `200 OK` with no changes or `400 Bad Request` depending on API rules; verify actual behavior and document it

6.5 Edge case: patch non-existing booking
- Request: `PATCH /booking/999999`
- Expected: `404 Not Found`

## 7. Booking: Delete Booking (`DELETE /booking/:id`)

7.1 Happy path: delete booking with auth token
- Setup: create booking, get auth token
- Request: `DELETE https://restful-booker.herokuapp.com/booking/{id}`
- Header: `Cookie: token=<token>` or `Authorization: Basic ...`
- Expected: `201 Created` or `200 OK` depending on implementation; verify booking is removed by calling `GET /booking/{id}` returns `404`

7.2 Error scenario: delete without auth token
- Request: `DELETE /booking/{id}` without auth
- Expected: `403 Forbidden` or `401 Unauthorized`

7.3 Error scenario: delete with invalid token
- Request: `DELETE /booking/{id}` with invalid token
- Expected: `403 Forbidden` or `401 Unauthorized`

7.4 Edge case: delete already deleted booking
- Request: delete the same booking twice
- Expected: first request succeeds, second request returns `404 Not Found` or equivalent error

7.5 Edge case: delete invalid ID format
- Request: `DELETE /booking/abc`
- Expected: client error or `404 Not Found`

## 8. Ping: Health Check (`GET /ping`)

8.1 Happy path: ping the server
- Request: `GET https://restful-booker.herokuapp.com/ping`
- Expected: `201 Created`, response body contains `"OK"`

8.2 Error scenario: unsupported method on ping
- Request: `POST /ping`
- Expected: `405 Method Not Allowed` or similar error

8.3 Edge case: ping with extra query parameters
- Request: `GET /ping?test=1`
- Expected: `201 Created` or `200 OK`, endpoint should still be up; verify service handles extra parameters gracefully

## Notes
- For endpoints requiring auth, test both `Cookie: token=<token>` and `Authorization: Basic ...` when applicable.
- When creating and modifying bookings, preserve id references and validate that the API reflects changes correctly.
- If the API returns a different status code than the expected documented code, record the actual status and response details as part of the test result.
- For error and edge cases, always assert both HTTP status and the error payload or message.

## JIRA Test Cases

### AUTH-001: Create auth token with valid credentials
- Summary: Verify that `POST /auth` returns a valid token for correct credentials.
- Preconditions: API is reachable and valid credentials exist.
- Steps to Reproduce:
  1. Send `POST https://restful-booker.herokuapp.com/auth`.
  2. Set header `Content-Type: application/json`.
  3. Use body:
     ```json
     {"username": "admin", "password": "password123"}
     ```
  4. Inspect the HTTP response status and JSON body.
- Expected Result: `200 OK`, response JSON contains non-empty `token` value.
- Actual Result: Not executed yet.

### AUTH-002: Reject auth with invalid credentials
- Summary: Verify that `POST /auth` rejects login attempts with wrong password.
- Preconditions: API is reachable.
- Steps to Reproduce:
  1. Send `POST https://restful-booker.herokuapp.com/auth`.
  2. Set header `Content-Type: application/json`.
  3. Use body:
     ```json
     {"username": "admin", "password": "wrongpassword"}
     ```
  4. Inspect the HTTP response status and JSON body.
- Expected Result: `401 Unauthorized` or `403 Forbidden`; no token returned; error message indicates invalid credentials.
- Actual Result: Not executed yet.

### BOOKING-001: Retrieve booking details by valid ID
- Summary: Verify that `GET /booking/{id}` returns booking data for a valid booking ID.
- Preconditions: API is reachable, booking ID `1` exists.
- Steps to Reproduce:
  1. Send `GET https://restful-booker.herokuapp.com/booking/1`.
  2. Set header `Accept: application/json`.
  3. Inspect the HTTP response status and response payload.
- Expected Result: `200 OK`; response contains `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates`, and `additionalneeds`.
- Actual Result: Not executed yet.

### BOOKING-002: Return 404 for non-existing booking ID
- Summary: Verify that `GET /booking/{id}` returns a not found error for missing booking ID.
- Preconditions: API is reachable.
- Steps to Reproduce:
  1. Send `GET https://restful-booker.herokuapp.com/booking/999999`.
  2. Set header `Accept: application/json`.
  3. Inspect the HTTP response status and response payload.
- Expected Result: `404 Not Found` or equivalent error; no booking data returned.
- Actual Result: Not executed yet.

### BOOKING-003: Create booking with valid JSON payload
- Summary: Verify that `POST /booking` creates a booking and returns matching booking data.
- Preconditions: API is reachable.
- Steps to Reproduce:
  1. Send `POST https://restful-booker.herokuapp.com/booking`.
  2. Set header `Content-Type: application/json`.
  3. Use body:
     ```json
     {
       "firstname": "John",
       "lastname": "Doe",
       "totalprice": 150,
       "depositpaid": true,
       "bookingdates": {
         "checkin": "2025-10-01",
         "checkout": "2025-10-10"
       },
       "additionalneeds": "Breakfast"
     }
     ```
  4. Inspect the HTTP response status and JSON body.
- Expected Result: `200 OK`; response contains `bookingid`; returned booking object matches the request payload.
- Actual Result: Not executed yet.

### BOOKING-004: Reject booking creation with invalid date format
- Summary: Verify that `POST /booking` returns validation error for malformed dates.
- Preconditions: API is reachable.
- Steps to Reproduce:
  1. Send `POST https://restful-booker.herokuapp.com/booking`.
  2. Set header `Content-Type: application/json`.
  3. Use body:
     ```json
     {
       "firstname": "Jane",
       "lastname": "Smith",
       "totalprice": 100,
       "depositpaid": false,
       "bookingdates": {
         "checkin": "01-10-2025",
         "checkout": "10/15/2025"
       },
       "additionalneeds": "None"
     }
     ```
  4. Inspect the HTTP response status and JSON body.
- Expected Result: `400 Bad Request` or validation error; error message indicates invalid booking date format.
- Actual Result: Not executed yet.

### DELETE-001: Verify delete requires auth token
- Summary: Verify that `DELETE /booking/{id}` denies deletion without authentication.
- Preconditions: API is reachable, booking ID exists.
- Steps to Reproduce:
  1. Send `DELETE https://restful-booker.herokuapp.com/booking/1`.
  2. Do not include any auth header or cookie.
  3. Inspect the HTTP response status and response payload.
- Expected Result: `401 Unauthorized` or `403 Forbidden`; booking is not deleted.
- Actual Result: Not executed yet.

### PING-001: Health check with `GET /ping`
- Summary: Verify that `GET /ping` returns service health status.
- Preconditions: API is reachable.
- Steps to Reproduce:
  1. Send `GET https://restful-booker.herokuapp.com/ping`.
  2. Inspect the HTTP response status and response body.
- Expected Result: `201 Created` or `200 OK`; response body contains `OK`.
- Actual Result: Not executed yet.
