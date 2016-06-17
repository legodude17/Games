/*jslint node:true*/
'use strict';
var log = require('single-line-log').stdout,
    fs = require('fs'),
    ASQ = require('asynquence');
module.exports = function () {
    ASQ(function (done) {
        fs.appendFile('./target.txt', 'troll', done);
    }).then(function (done, msg) {
        var ws = fs.createWriteStream('./target.txt');
        function writeOneMillionTimes(writer, data, encoding, callback) {
            var i = 1000000;
            function write() {
                var ok = true, percentage;
                do {
                    i -= 1;
                    if (i === 0) {
                        // last time!
                        writer.write(data, encoding, callback);
                    } else {
                        // see if we should continue, or wait
                        // don't pass the callback, because we're not done yet.
                        ok = writer.write(data, encoding);
                        percentage = 100 - Math.floor(100 * i / 1000000);
                        log('Writing file: [' + percentage + '%]', 1000000 - i, 'times writen');
                    }
                } while (i > 0 && ok);
                if (i > 0) {
                    // had to stop early!
                    // write some more once it drains
                    writer.once('drain', write);
                }
            }
            write();
        }
        writeOneMillionTimes(ws, 'ol', 'utf-8', function () {
            log.clear();
            console.log('Done');
            done();
        });
    }).then(function (done, msg) {
        var result = '',
            size = fs.statSync('./target.txt').size,
            stream = fs.createReadStream('./target.txt'),
            read = 0;
        stream.on('data', function (data) {
            read += data.length;
            result += data;
            var percentage = Math.floor(100 * read / size);
            log('Reading file\n[' + percentage + '%]', read, 'bytes read');
        });
        stream.on('end', function () {
            console.log('');
            console.log('Done');
        });
    });
};