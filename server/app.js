/*jshint node:true*/
'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');
var logger = require('morgan');
var port = process.env.PORT || 7203;

var environment = process.env.NODE_ENV;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(compress());
app.use(logger('dev'));
app.use(cors());

console.log('About to crank up node');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);

app.get('/ping', function (req, res, next) {
    console.log(req.body);
    res.send('pong');
});

switch (environment) {
case 'build':
    console.log('** BUILD **');
    app.use(express.static('./build/'));
    break;
default:
    console.log('** DEV **');
    app.use(express.static('./src/'));
    app.use(express.static('./'));
    app.use(express.static('./tmp'));
    break;
}

app.listen(port, function () {
    console.log('Express server listening on port ' + port);
    console.log('env = ' + app.get('env') +
        '\n__dirname = ' + __dirname +
        '\nprocess.cwd = ' + process.cwd());
});