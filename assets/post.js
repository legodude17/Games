app.post('/assets/:place', function (req, res) {
    'use strict';
    console.log('/assets/' + req.params.place);
    var writer = fs.createWriteStream(req.params.place);
    req.on('data', function (chunk) {
        console.log('Trying to write...');
        writer.setMaxListeners(20);
        if (!writer.write(chunk)) {
            writer.once('drain', function () {
                console.log('Writing...');
                writer.write(chunk, null, function () {
                    console.log('Writen');
                });
            });
        }
        console.log('data');
    });
    req.on('end', function () {
        console.log('end');
        writer.on('finish', function () {
            console.log('All writes are now complete.');
            console.log(req.params.place);
            fs.appendFile('assets/' + req.params.place, '', function (data) {
                console.log('Append:', data);
                fs.readFile('assets/' + req.params.place, function (data) {
                    console.log('data recieved:', data);
                    switch (req.get('file-type')) {
                    case null:
                    case undefined:
                        console.log('Wrong');
                        break;
                    case 'mp3':
                        replaceExt('assets/' + req.params.place, '.mp3');
                        break;
                    }
                    res.json(JSON.stringify({
                        message: 'Data recieved',
                        data: data
                    }));
                });
            });
        });
        writer.end('');
    });
});
