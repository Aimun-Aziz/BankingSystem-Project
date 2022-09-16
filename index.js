const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

const Bank = require('./Bank')

app.use('/Bank', Bank);

app.listen(port, () => console.log('Listening on port 5000...'))