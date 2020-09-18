const pino = require('pino');
const config = require('config');

const logger = pino({
    level: config.get('loglevel'),
    prettyPrint: true
});

module.exports = logger;
