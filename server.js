/*global require, console, Buffer*/
var express = require('express');
var app = express();
app.use(express["static"]('./'));
app.get('/', function (req, res) {
    'use strict';
    res.redirect('/index.html');
});
app.get('/docs', function (req, res) {
    'use strict';
    res.redirect('/phaser-2.4.6/docs/classes.list.html');
});
app.listen(3000, function () {
    'use strict';
    console.log('Ready captain');
});