/*global require, console, Buffer*/
var express = require('express');
var fs = require('fs');
var app = express();
var replaceExt = require('replace-ext');
var busboy = require('connect-busboy');
app.use(express["static"]('./'));
app.use(busboy());
app.post('/fileupload', function (req, res) {
    'use strict';
    console.log('post recieved at /fileupload');
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream('./assets/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log('Done');
            res.send('Sucess');
        });
    });
});
app.post('/levels', function (req, res) {
    'use strict';
    console.log('post recieved at /levels');
    var data = '';
    req.on('data', function (chunk) {
        var str = chunk.toString();
        data += str;
        console.log('Data:', str);
    });
    req.on('end', function () {
        fs.readFile('./lvls.json', 'utf8', function (err, str) {
            var lvls;
            console.log('Error:', err, 'Data:', str, 'Data to append:', data);
            try {
                lvls = JSON.parse(str);
                lvls.push(JSON.parse(data));
            } catch (e) {
                console.log(e);
                res.status(400).send({ message: 'Malformed request', error: e.toString() });
                return;
            }
            console.log('Levels:', JSON.stringify(lvls, null, 4));
            fs.writeFile('./lvls.json', JSON.stringify(lvls, null, 4), function (err) {
                if (err) {
                    res.status(500).send({ message: 'Error writing file.', error: err});
                    return;
                }
                res.json({data: JSON.stringify(lvls, null, 4), name: JSON.parse(str).name});
            });
        });
    });
});
app.get('/', function (req, res) {
    'use strict';
    res.redirect('/index.html');
});
app.listen(3000, function () {
    'use strict';
    console.log('Ready captain');
});