# UFO Battle – Web Development (UPM)

Course project for the Web Development course at UPM (ETSISI), 2025/26.

| Folder | Content |
| --- | --- |
| `ufo_battle_game_Task_1/` | Practical task 1: the game in plain HTML, CSS and JavaScript |
| `angular-ufo/` | Practical task 2: the game rebuilt in Angular (with SSR) |
| `scoreserver/` | Small Node.js/Express servers for user records and password updates |

## Backend not included

During the course the game used a university backend for login, registration and the global ranking, plus a course database for records.
Neither the addresses nor the credentials are in this repository. The frontends point to `http://localhost:10000` as a placeholder (`apiUrl` in `angular-ufo/src/app/services/auth.service.ts`, `API_BASE` in `ufo_battle_game_Task_1/js/api.js`).
Without a backend the game itself still runs, but login, registration and records won't work.

## Running

### Angular app
```bash
cd angular-ufo
npm install
npm start        # http://localhost:4200
```

### Score server
The server needs database credentials, which are **not** included in this repository.
```bash
cd scoreserver
cp .env.example .env   # then fill in the values
npm install
npm start              # score server on http://localhost:3000
npm run start:pwd      # password server on http://localhost:3000
```
Requires Node.js 20.6+ (for `--env-file`).

Both servers use port 3000 by default, so run one at a time, or set `PORT` in `.env`.
The optional settings `CORS_ORIGINS`, `HOST` and `PORT` are listed in `.env.example`.

### Task 1 (vanilla JS)
Open `ufo_battle_game_Task_1/index.html` in a browser, or serve the folder with any static server.

## Security notes
This is a course project and isn't meant to be deployed as it is.
- Credentials come only from `scoreserver/.env`, which is gitignored and never committed.
- The servers listen on `127.0.0.1` and accept browser requests only from the Angular app's origins (`CORS_ORIGINS`).
- All SQL queries are parameterized.
- To change a password you have to give your current one: the login token comes from the course backend and can't be checked by this server.
- Some things are fixed by the course backend and database and weren't changed:
  - passwords are stored as unsalted MD5 hashes;
  - login sends the password as a GET query parameter;
  - the token is kept in `localStorage`.
