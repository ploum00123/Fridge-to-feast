var express = require('express')
var cors = require('cors')
var app = express()

// Get the client
const mysql = require('mysql2')

// Create the connection to database
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fridge_to_feast',
});

app.use(cors())

app.get('/api/all')