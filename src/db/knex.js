const config = require('./knexfile');
const enviroment = 'development';
const enviromentConfig = config[enviroment];
const knex = require('knex');
const connection = knex(enviromentConfig);

module.exports = connection;
