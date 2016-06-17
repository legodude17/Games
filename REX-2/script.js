/*jslint browser:true*/
/*global ROT, console, window, show*/
//function game() {
//    'use strict';
var display, ps, levels, current, color, log, enemies;
function draw() {
    'use strict';
    var i, j, u, cy = 0;
    for (i = 0; i < current.length; i += 1) {
        for (j = 0; j < current[i].length; j += 1) {
            if (current[i][j] === '@') {
                for (u = 0; u < ps.length; u += 1) {
                    if (j === ps[u].x && i === ps[u].y) {
                        display.draw(j, i, '@', ps[u].color);
                    }
                }
            } else {
                display.draw(j, i, current[i][j], color[current[i][j]]);
            }
            cy = Math.max(cy, i);
        }
    }
    cy = Math.max(cy, 10);
    for (i = 0; i < log.length; i += 1) {
        j = log[i].split(':');
        display.drawText(1, cy, '%c{' + j.pop() + '}' + j.join(':'));
    }
}
function update() {
    'use strict';
    draw();
}
function message(str, c) {
    'use strict';
    c = c || '#fff';
    log.push(c + ':' + str);
}
document.onkeydown = function (e) {
    'use strict';
    function k(a) {
        if (typeof a === 'number') {
            return (e.keyCode || e.which) === a;
        }
        return String.fromCharCode(e.keyCode || e.which) === a;
    }
    if (k('r')) {
        message('Hi!', '#f00');
    }
    update();
};
function init() {
    'use strict';
    var i, j, h;
    ps.lvl = 0;
    ps.floor = 0;
    for (i = 0; i < levels.length; i += 1) {
        for (j = 0; j < levels[i].length; j += 1) {
            for (h = 0; h < levels[i][j].length; h += 1) {
                levels[i][j][h] = levels[i][j][h].split('');
            }
        }
    }
    console.log(levels);
    current = levels[ps.lvl][ps.floor];
}
display = new ROT.Display({width: 50, height: 50, bg: '#000', fg: '#fff'});
show(display.getContainer());
color = {
    '#': '#564646'
};
ps = [
    {
        x: 1,
        y: 1,
        hp: 10,
        color: '#00f'
    }
];
levels = [
    [
        [
            '###',
            '#@#',
            '###'
        ]
    ]
];
init();
current = levels[ps.lvl][ps.floor];
log = [];
draw();
//}
//game();