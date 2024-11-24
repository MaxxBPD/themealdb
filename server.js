import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'themealdb'
});

db.connect(err => {
    if (err) {
    console.error('Database connection failed:', err.stack);
    return;
    }
    console.log('Connected to database.');
});

app.post('/create-account', (req, res) => {
    const { username, password } = req.body;
    const date = new Date();

    const insertUser = () => {
        const user_id = uuidv4();
        const query = 'INSERT INTO users (user_id, username, password, created_on, last_login, logins) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [user_id, username, password, date, date, 0], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(err.message);
                    if (err.message.includes('users_unique')) {
                        console.error('Username already taken');
                        res.status(409).json({ message: 'Username already taken' });
                    } else {
                        console.error('Duplicate user_id, retrying...');
                        insertUser(); // Retry with a new UUID
                    }
                } else {
                    console.error('Error inserting data:', err);
                    res.status(500).send('Error creating account');
                }
            } else {
                res.status(200).json({ message: 'Account created successfully', user_id: user_id, username: username });
            }
        });
    };

    insertUser();
});

app.post('/attempt-login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('Error querying data:', err);
            res.status(500).json({ message: 'Error logging in' });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Username not found' });
        } else {
            const user = result[0];
            if (user.password === password) {
                const date = new Date();
                const updateQuery = 'UPDATE users SET last_login = ?, logins = logins + 1 WHERE user_id = ?';
                db.query(updateQuery, [date, user.user_id], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating login:', updateErr);
                        res.status(500).json({ message: 'Error updating login' });
                    } else {
                        res.status(200).json({ message: 'Login successful', user_id: user.user_id, username: user.username });
                    }
                });
            } else {
                res.status(401).json({ message: 'Incorrect password' });
            }
        }
    });
});

app.get('/get-favorites', (req, res) => {
    const { user_id } = req.query;
    const query = 'SELECT idMeal, strMeal FROM favorites WHERE user_id = ?';
    db.query(query, [user_id], (err, result) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Error retrieving favorites');
        } else {
            res.status(200).json(result.length ? result : {});
        }
    });
});

app.post('/save-favorite', (req, res) => {
    const { user_id, idMeal, strMeal } = req.body;
    const query = 'INSERT INTO favorites (user_id, idMeal, strMeal) VALUES (?, ?, ?)';
    db.query(query, [user_id, idMeal, strMeal], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error saving favorite');
        } else {
            res.status(200).send('Favorite saved successfully');
        }
    });
});

app.delete('/delete-favorite', (req, res) => {
    const { user_id, idMeal } = req.body;
    const query = 'DELETE FROM favorites WHERE user_id = ? AND idMeal = ?';
    db.query(query, [user_id, idMeal], (err, result) => {
        res.status(200).send('Favorite deleted successfully');
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});