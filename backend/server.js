const express = require('express');
const cors = require('cors');

const routes = require('./routes');

const server = express();
server.use(express.json());

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
server.use(cors(corsOptions));

server.use(routes);

module.exports = server;
