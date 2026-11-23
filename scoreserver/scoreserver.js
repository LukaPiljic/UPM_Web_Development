// import the express-framework
const express = require('express');

// import the mySQL library, so we can communicate with the database
const mysql = require('mysql2');

// for Cross Origin Res. Sharing, since Angular runs on port 4200 but the server on port 3000
const cors = require('cors');

// db credentials, allowed origins, host and port (all from environment variables)
const {dbConfig, corsOptions, HOST, PORT} = require('./config');

// this actually creates the express application
const app = express();

// only allow requests from the Angular app (see config.js)
app.use(cors(corsOptions));

// to parse json payloads (small limit, we only ever get tiny bodies)
app.use(express.json({limit: '10kb'}));


// creating a connection-pool
const pool = mysql.createPool(dbConfig);




// I name it user-records because I can better distinguish between the both endpoints /records and /records/{username}
// because under /records I understand: "list all records of *all* players"
app.get('/api/user-records/:username', (req, res) => {


    const username = req.params.username;

    // SQL stmt from the task description, parameterized to prevent SQL injection
    const query = `
        SELECT user          as username,
               punctuation,
               ufos,
               disposed_time as disposedTime,
               record_date   as recordDate
        FROM record
        WHERE user = ?
        ORDER BY punctuation DESC LIMIT 10
    `;

    // the pool now actually executes the stmt
    pool.execute(query, [username], (err, results) => {
        if (err) { // callback function
            console.error(err);
            return res.status(500).json({error: 'Database error'});
        }
        res.json(results); // sends the list of scores back
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Score Server running on http://${HOST}:${PORT}`);
});
