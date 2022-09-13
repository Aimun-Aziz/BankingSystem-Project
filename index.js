const express = require('express');
const app = express();
app.use(express.json());


const Bank = require('./Bank')

app.use('/Bank', Bank);

app.listen(5000, () => console.log('Listening on port 5000...'))