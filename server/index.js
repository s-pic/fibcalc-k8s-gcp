const redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pg = require('pg');

const connectionSettings = require('./connectionSettings');

// postgres setup

const pgClient = new pg.Pool({
    user: connectionSettings.pgUser,
    host: connectionSettings.pgHost,
    database: connectionSettings.pgDatabase,
    password: connectionSettings.pgPassword,
    port: connectionSettings.pgPort,
    ssl:
        process.env.NODE_ENV !== 'production'
            ? false
            : {rejectUnauthorized: false},
})

pgClient.on("error", (errDetails) => console.error("Lost PG connection", errDetails));

pgClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch((err) => console.error(err));
});

// redis setup

const redisClient = redis.createClient({
    host: connectionSettings.redisHost,
    port: connectionSettings.redisPort,
    retry_strategy: () => 1_000
});

const redisPublisher = redisClient.duplicate(); // because redis client can only be used for one thing at a time (pub/sub)


// express setup

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hi')
})

const VALUES_ENDPOINT_URL_PATH = '/values';

app.get(VALUES_ENDPOINT_URL_PATH + '/all', async (req, res) => {
    const QUERY = 'SELECT * FROM values';
    const {rows} = await pgClient.query(QUERY);
    res.send(rows)
})

app.get(`${VALUES_ENDPOINT_URL_PATH}/current`, async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
})

app.post(VALUES_ENDPOINT_URL_PATH, async (req, res) => {
    const index = req.body.index
    const isTooLargeInput = index > 40 // arbitrary limit
    if (isTooLargeInput) {
        return res.status(422).send('Index too high')
    }

    redisClient.hset(
        'values',
        index,
        'Nothing yet!' // not yet calculated. Worker will update this value
    )

    redisPublisher.publish('insert', index) // processed by worker

    await pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

    res.send({working: true}) // arbitrary response
})

app.listen(5000, err => {
    if (err) {
        console.error(err)
        return
    }
    console.log('Listening')
})