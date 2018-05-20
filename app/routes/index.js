var express = require('express');
var app = express();
const api = require('./api.js');
app.use('/api',api);
module.exports = function(app, db) {
  api(app, db);
};
