const dotenv = require('dotenv');
const express = require('express');
const logger = require('morgan');

dotenv.config({ path: './.env' });

const app = express();

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(logger('dev'));

app.listen(
  process.env.PORT,
  console.log(`Server running on port http://localhost:${process.env.PORT}`),
);
