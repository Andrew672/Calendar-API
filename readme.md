# 📅 Calendar API (DAViCal + ICS)

A Node.js REST API that allows you to create, fetch, and parse calendar events in `.ics` format using a **DAViCal** server.

## 🚀 Features

- Create calendar events with custom metadata (icon, color, full description…)
- Retrieve raw `.ics` files
- Parse and return events as JSON
- Secure connection using credentials stored in a `.env` file

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the root of the project:

```
DAVICAL_URL=
PORT=PORT=3001
DAVICAL_USERNAME=
DAVICAL_PASSWORD=
```

### 4. Run the server

```bash
node app.js
```

or with nodemon:

```bash
npx nodemon app.js
```

Server will be running at: [http://localhost:3001](http://localhost:3001) (default port : 3001)


## 💬 Examples

### ➕ Create Event (POST `/api/events`)

Send a `POST` request with the following JSON body to create a new calendar event:

```json
{
  "title": "Team Meeting",
  "description": "Weekly sync with the development team",
  "full_description": "Discuss project progress, blockers, and upcoming sprint goals. Everyone must prepare a brief update.",
  "start": "2025-05-09T10:30:00+02:00",
  "end": "2025-05-09T11:30:00+02:00",
  "icon": "planning",
  "color": "#3399ff"
}


