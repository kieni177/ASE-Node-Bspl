import express from 'express';
import { Pool } from 'pg';
import bodyParser from "body-parser";


class Person  {
 id: Number;
 name: String;
};

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5432,
});
const app = express();
const port = 3000;
app.use(bodyParser.json())

app.get('/', async (req, res) => {
    try {
        const now = await pool.query('SELECT * from NOW()');
        res.status(200);
        res.send(now.rows[0].now);
    } catch (err) {
        console.log(err.stack)
    }
});

app.get('/person', async (req, res)  => {
    try {
        const person = await pool.query('SELECT * from PERSON');
        res.send(person.rows);
    } catch (err) {
        console.log(err.stack)
    }
});

app.get('/person/:id', async (req, res)  => {
    try {
        const person = await pool.query('SELECT * from PERSON where id = ' + req.params.id  );
        res.send(person.rows);
    } catch (err) {
        console.log(err.stack)
    }
});

app.post('/person', async (req, res)  => {
    try {
        let person: Person = req.body;
        res.send(person);
    } catch (err) {
        console.log(err.stack)
    }
});


app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
});
