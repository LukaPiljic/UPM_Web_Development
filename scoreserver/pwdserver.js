const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// almost the same as scoreserver.js, the shared settings are in config.js
const {dbConfig, corsOptions, HOST, PORT} = require('./config');

const app = express();

app.use(cors(corsOptions));
app.use(express.json({limit: '10kb'}));

const pool = mysql.createPool(dbConfig);

const MAX_PASSWORD_LENGTH = 100;

function isValidPassword(value) {
    return typeof value === 'string' && value.length > 0 && value.length <= MAX_PASSWORD_LENGTH;
}



// here the new update
app.patch('/api/users/:username', (req, res) => {

    // only logged-in users send a token (the interceptor adds it)
    if (!req.get('Authorization')) {
        return res.status(401).json({error: 'You have to be logged in'});
    }

    const username = req.params.username;
    const {currentPassword, password} = req.body || {};

    if (!isValidPassword(currentPassword)) {
        return res.status(400).json({error: 'Current password is required'});
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({error: `New password is required (max ${MAX_PASSWORD_LENGTH} characters)`});
    }

    // the token comes from the course backend and can't be checked here,
    // so the current password proves that the request really comes from this user.
    // md5 is what the course database uses, so it has to stay for login to keep working.
    // parameterized query to prevent SQL injection
    const query = `
       UPDATE user
       SET password = md5(?)
       WHERE user = ? AND password = md5(?)
    `;

    pool.execute(query, [password, username, currentPassword], (err, result) => {
        if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({error: 'Database update failed'});
        }

        // same answer for "unknown user" and "wrong password", so nobody can find out which usernames exist
        if (result.affectedRows === 0) {
            return res.status(403).json({error: 'Current password is incorrect'});
        }

        res.json({message: 'Password updated successfully'});
    });
});



app.listen(PORT, HOST, () => {
    console.log(`Pwd Server running on http://${HOST}:${PORT}`);
});
