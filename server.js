require('dotenv').config();
var cors = require('cors');
var bodyParser = require('body-parser');
const mongoString = process.env.DATABASE_URL;
const express = require('express');
const mongoose = require('mongoose');
const database = mongoose.connection;
const app = express();

mongoose.connect(mongoString);
database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});

const routes = require('./routes/routes');
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(bodyParser.json());
app.use('/api', routes);
app.listen(8000, () => {
  console.log(`Server Started at ${8000}`);
});
