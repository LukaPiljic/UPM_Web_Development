// shared settings for scoreserver.js and pwdserver.js
// everything is read from environment variables (see .env.example), never hardcode credentials

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
}

// database configuration, which is on page 6 of the task description
const dbConfig = {
    host: process.env.DB_HOST, // the url of the db server
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME
};

// only the Angular dev server (4200) and the SSR server (4000) may call the API from a browser
const corsOptions = {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:4200,http://localhost:4000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
};

// listen on localhost only, so the server is not reachable from the rest of the network
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);

module.exports = {dbConfig, corsOptions, HOST, PORT};
