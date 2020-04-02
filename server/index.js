const keys = require('./keys');
const redis = require('redis');

// express app
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost connection'));
pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));

// Redis
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Handlers
app.get('/', (req, res) => {
  res.status(200).send('Hi');
});

app.get('/api', (req, res) => {
  res.status(200).send('Hi API');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.json(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.json(values || {});
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;
  if(+index > 40) {
    return res.status(422).send('Index too high');
  }
  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values (number) VALUES ($1)',  [index]);

  res.json({ working: true });
});

const port = '8181';
app.listen(8181, err => {
  console.log('listening on port', port);
});