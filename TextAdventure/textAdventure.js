/*jslint node:true*/
'use strict';
var colors = require('colors'),
    log = require('single-line-log').stdout,
    fs = require('fs');
function parse_style_string(str) {
    var index = str.indexOf('%j{'), end, style, styles;
    while (index >= 0) {
        end = str.indexOf('}');
        style = str.slice(index + 3, end);
        console.log(style);
        styles.push(style);
        str = str.split('');
        str.splice(index, Math.abs(index - end - 1));
        str = str.join('');
        console.log(str);
        index = str.indexOf('%j{');
    }
    styles.forEach(function (v) {
        str = str[v];
    });
    return str;
}
function parse_story(str) {
    var rooms = JSON.parse(str),
        room,
        i,
        j,
        temp,
        temp2,
        vars = {};
    function initRoom(inits) {
        inits.forEach(function (v) {
            vars[v.name] = v.value;
        });
    }
    function switchRoom(name) {
        var temp;
        if (room) {
            temp = room;
            console.log(room.outro);
        }
        room = rooms[name];
        if (!room) {
            console.log('No room'.red);
            room = temp;
            return;
        }
        console.log(room.intro);
        initRoom(room.init);
    }
    function checkParams(params) {
        var res = true;
        params.forEach(function (v) {
            if (vars[v.name] !== v.value) {
                res = false;
                return;
            }
        });
        return res;
    }
    function dir(name, dirr) {
        return function () {
            if (checkParams(dirr.params)) {
                console.log(dirr.effect.outro);
                switchRoom(dirr.effect.to);
            } else {
                console.log(dirr.fail);
            }
        };
    }
    function cmd(j, cmnd) {
        return function () {
            if (checkParams(cmnd.params)) {
                cmnd.effect.forEach(function (v) {
                    vars[v.name] = v.value;
                });
                console.log(cmnd.text);
            } else {
                console.log(cmnd.fail);
            }
        };
    }
    for (i in rooms) {
        if (rooms.hasOwnProperty(i)) {
            temp = rooms[i].directions;
            for (j in temp) {
                if (temp.hasOwnProperty(j)) {
                    temp2 = temp[j];
                    temp[j] = dir(j, temp2);
                }
            }
            temp = rooms[i].commands;
            for (j in temp) {
                if (temp.hasOwnProperty(j)) {
                    temp2 = temp[j];
                    temp[j] = cmd(j, temp2);
                }
            }
        }
    }
    switchRoom('Home');
    return function (str) {
        if (str.split(' ')[0] === 'get') {
            console.log(vars[str.split(' ')[1]].yellow);
        }
        if (room.commands[str]) {
            room.commands[str]();
        } else if (room.directions[str]) {
            room.directions[str]();
        }
    };
}
var recieve = (function game() {
    var state = 'name', name, doStory;
    console.log('What should I call you?');
    return function (data) {
        if (data === 'exit' || data === 'done') {
            process.exit('User-input');
        }
        if (state === 'name') {
            name = data;
            console.log('I will call you %s.'.green, name);
            fs.readFile('./rooms.json', function (err, data) {
                doStory = parse_story(data.toString());
                state = 0;
            });
        } else {
            doStory(data);
        }
    };
}());
parse_style_string('hi%j{moo}hi');
function main(process) {
    process.stdin.on('readable', function () {
        var chunk = process.stdin.read();
        if (chunk !== null) {
            chunk = chunk.toString().slice(0, -1);
            recieve(chunk);
        }
    });
    process.on('exit', function (code) {
        console.log('Goodbye'.red.underline);
    });
    process.on('SIGINT', function () {
        process.exit();
    });
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = main;
} else {
    main();
}