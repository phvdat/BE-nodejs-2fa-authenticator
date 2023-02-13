require('dotenv').config();
var cors = require('cors')
var bodyParser = require('body-parser')
const express = require('express');
const mongoose = require('mongoose');


const app = express();
// app.use(cors())

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(bodyParser.json());
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
	console.log(error)
})

database.once('connected', () => {
	console.log('Database Connected');
})

const routes = require('./routes/routes');

app.use('/api', routes)

app.listen(8000, () => {
	console.log(`Server Started at ${8000}`)
})
