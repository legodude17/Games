/*jslint browser:true*/
/*global ROT, console, Audio, show*/
var display = new ROT.Display({width: 60, height: 40});
show(display.getContainer()); /* do not forget to append to page! */
var swi = 0;
function switcher() {
    'use strict';
    return ['#FF0023', '#AF4348', '#AD2D33'][swi = (swi + 1) % 3];
}
var p = {
        tries: 0,
        x: 1,
        y: 1,
        health: 50,
        currentChunk: '0,0',
        chunk: {
            x: 0,
            y: 0
        },
        objectOn: '.',
        inven: [],
        equip: {
            Prim: null,
            Sec: null,
            Head: null,
            Rorso: null,
            Legs: null,
            Feet: null
        },
        color: '#D92323',
        stats: {
            attack: 1,
            defense: 1
        },
        maxHealth: 1000
    },
    cheat = false,
    log = [];
function getRandomColor() {
    'use strict';
    var i, c, l;
    for (i = 0, c = '#', l = '0123456789ABCDEF'; i < 6; i += 1) {
        c += l[Math.floor(Math.random() * 16)];
    }
    return c;
}
var chunks = {
        '0,0': [
            '#+##############',
            '#..............#',
            '+........@.....+',
            '#..............#',
            '#+##############'
        ],
        '1,0': [
            '###########',
            '#.........#',
            '..........#',
            '#.........#',
            '###########'
        ],
        '0,-1': [
            '#########',
            '#.......#',
            '#.......#',
            '#.#######'
        ]
    },
    chunk;
function drawMap() {
    'use strict';
    display.clear();
    var size = 1,
        cy = 1,
        cx,
        txt,
        i,
        j,
        t;
    function color(a, b) {
        if (a.includes(chunk[i][j])) {
            txt = true;
            display.draw(cx, cy, chunk[i][j], b);
        }
        return color;
    }
    for (i in chunk) {
        if (chunk.hasOwnProperty(i)) {
            cx = 1;
            for (j in chunk[i]) {
                if (chunk[i].hasOwnProperty(j)) {
                    color('0', '#7EAC90')('%R', getRandomColor())('&', '#DEA')('/', '#8B5934')('~', '#20B2AA')('OG', '#1C8B1C')('b', '#AF4374')('S', '#8C8799')('o¡', '#0f0')('.,', '#8B7C7C')('B', '#1DCF44')('*?81', '#4F4F4F')('$', '#FFAF33')('`', '#FFF333')('¢', '#FB2')('@!ǃ', p.color)('v^=+-X', '#DFBC75')('#|', '#564646')('C', '#F4A60C')('a', '#0CD9F4')('&', '#F0F40C')('Θ', '#5D4980')(':', cheat ? '#000' : '#0f0')('‚', '#8B8C7C')('?', switcher())('3', '#3C0065')('il', '#2DA24B');
                    if (!txt) {display.draw(cx, cy, chunk[i][j], '#fff'); }
                    cx += 1;
                }
            }
            cy += 1;
        }
    }
    cy += 2;
    display.drawText(1, cy, 'You have ' + Math.floor(p.health) + ' health.', p.health <= 50 ? '#0f0' : (p.health <= 25 ? '#ff0' : (p.health <= 10 ? '#f00' : getRandomColor())));
    cy += 2;
    display.drawText(1, cy, 'Your attack is ' + p.stats.attack + ' and your defense is ' + p.stats.defense + '.', '#00f');
    for (i in log) {
        if (log.hasOwnProperty(i)) {
            cy += 2;
            txt = log[i].split(':');
            t = txt.splice(1);
            txt = '%c{' + txt + '}' + t;
            display.drawText(1, cy, txt, 100);
        }
    }
}
var log = [];
function message(str, color, voice) {
    'use strict';
    log.unshift((color || '#fff') + ':' + str);
    if (log.length > 20) {log.pop(); }
    drawMap();
}
var swi = 1;
var thong = '';
var use;
function noMove(thing) {
    'use strict';
    return function () {
        if (thong === thing) {
            return;
        }
        message((thong = thing) + ' is obstructing your path.', '#FF8700');
    };
}
function canMove() {
    'use strict';
    return true;
}
function calcChunk(x, y) {
    'use strict';
    if (typeof x === 'string') {
        x = x.split(',');
        return [+x[0], +x[1]];
    }
    if (Array.isArray(x)) {
        return x.join(',');
    }
    return x + ',' + y;
}
function push(item) {
    'use strict';
    var i, num = parseInt(item, 10);
    message('You pick up' + (num ? ' ' : ' a ') + (item.name || item) + (num ? 's.' : '.'), '#EEC900');
    if (!num) {
        return p.inven.push(item);
    }
    item = item.slice(([] + num).length + 2);
    for (i = 0; i < num; i += 1) {
        p.inven.push(item);
    }
}
var enemies = [];
function Potion(e) {
    'use strict';
    this.effect = +e === e ? ['healing', 'damage'][e] : e;
    this.place = 'Sec';
    this.use = function (kill) {
        var i;
        switch (this.effect) {
        case 'healing':
            p.health = Math.min(p.health + 4, p.maxHealth);
            break;
        case 'damage':
            for (i in enemies) {
                if (enemies.hasOwnProperty(i)) {
                    if (Math.abs(enemies[i].x - p.x) < 3 && Math.abs(enemies[i].y - p.y) < 3) {
                        enemies[i].health -= 2;
                    }
                }
            }
            break;
        }
        kill();
    };
    this.op = {
        'Equip': function () {
            if (p.equip[this.place]) {
                return;
            }
                      
            p.equip[this.place] = this;
        }.bind(this),
        'Dequip': function () {
            if (p.equip[this.place] !== this) {
                return;
            }
            p.equip[this.place] = null;
        }.bind(this)
    };
    this.name = this.effect + ' potion';
    this.item = true;
}

function Bow(power) {
    'use strict';
    this.place = 'Sec';
    this.use = function () {
        var e, i;
        for (i = 0; i < enemies.length; i += 1) {
            e = enemies[i];
            if (Math.abs(e.x - p.x) < 3 && Math.abs(e.y - p.y) < 3) {
                e.health -= power;
                message('You zapped a ' + e.name + ' for ' + power + ' damage!', '#0c0');
            }
        }
    };
    this.op = {
        'Equip': function () {
            if (p.equip[this.place]) {
                return;
            }
            p.equip[this.place] = this;
        }.bind(this),
        'Dequip': function () {
            if (p.equip[this.place] !== this) {
                return;
            }
            p.equip[this.place] = null;
        }.bind(this)
    };
    this.name = 'Magic Wand';
    this.item = true;
}
function parseEffect(str) {
    'use strict';
    return {
        mod: parseInt(str, 10),
        to: str.split(' ').pop()
    };
}
function Item(place, e, n) {
    'use strict';
    this.effect = e;
    this.place = place;
    if (place === 'Prim' || place === 'Sec') {
        this.weapon = true;
        this.op = {
            'Equip': function () {
                if (p.equip[this.place]) {
                    return;
                }
                p.equip[this.place] = this;
                if (this.effect) {
                    var tmp = parseEffect(this.effect);
                    p.stats[tmp.to] += tmp.mod;
                }
            }.bind(this),
            'Dequip': function () {
                if (p.equip[this.place] !== this) {
                    return;
                }
                p.equip[this.place] = null;
                if (this.effect) {
                    var tmp = parseEffect(this.effect);
                    p.stats[tmp.to] -= tmp.mod;
                }
            }
        };
    } else {
        this.op = {
            'Put on': function () {
                if (p.equip[this.place]) {
                    return;
                }
                p.equip[this.place] = this;
                if (this.effect) {
                    var tmp = parseEffect(this.effect);
                    p.stats[tmp.to] += tmp.mod;
                }
            }.bind(this),
            'Take off': function () {
                if (p.equip[this.place] !== this) {
                    return;
                }
                p.equip[this.place] = null;
                if (this.effect) {
                    var tmp = parseEffect(this.effect);
                    p.stats[tmp.to] -= tmp.mod;
                }
            }
        };
    }
    this.name = (n || (this.place + ' ' + (this.weapon ? 'Weapon' : 'Armour'))) + ': ' + this.effect;
    this.item = true;
}

                   

var chestLoot = {
        trapped: function () {
            'use strict';
            var i;
            p.health -= 2;
            for (i = 0; i < 10; i += 1) {
                p.inven.push("Cursed Item");
            }
        },
        bad: ["$"],
        good: ["Food"],
        great: ["Wand", "Bow", "Potion"]
    },
    objson = [],
    behavior = {
        ',': function (x, y) {
            'use strict';
            var rand = Math.random() * 16 / p.stats.defense;
            p.health -= rand;
            chunk[y][x] = '.';
            message('A trap injures you for ' + Math.round(rand) + ' damage.', '#f00');
            return true;
        },
        'undefined': noMove('The abyss'),
        '.': canMove,
        '#': noMove('A wall'),
        '*': canMove,
        '^': canMove,
        '+': function (x, y) {
            'use strict';
            chunk[y][x] = '-';
        },
        '-': canMove,
        'v': canMove,
        '¡': function (x, y) {
            'use strict';
            push(new Potion(Math.round(Math.random())));
            chunk[y][x] = '.';
            return true;
        },
        '/': function (x, y) {
            'use strict';
            push('raft');
            chunk[y][x] = '.';
            return true;
        },
        '"': function (x, y) {
            'use strict';
            var gold = p.inven.gold, i;
            if (p.inven.length) {
                while (p.inven.length) {
                    i = p.inven.pop();
                    message("That\'s a nice " + (i.name || i) + "... would be a shame if someone stole it", getRandomColor(), 'fr-FR');
                }
                message("Welp. Now you're broke!", '#E8FFBC', 'fr-FR');
            } else {
                message("Wait a minuite, you're already broke!", '#fff', 'fr-FR');
                if (p.inven.gold > 0) {
                    message('Oh... you have gold...', '', 'fr-FR');
                    p.inven.gold = 0;
                    message('And now ya don\'t', '', 'fr-FR');
                }
            }
            chunk[y][x] = '#';
            p.inven.gold = gold;
            return true;
        },
        '~': function () {
            'use strict';
            if (p.inven.includes('raft')) {
                return true;
            }
            return message("You don't have a raft", '#00c');
        },
        '0': function (x, y, vx, vy) {
            'use strict';
            if (vx && vy) {
                return noMove('A boulder')();
            }
            chunk[y][x] = '.';
            x += vx;
            y += vy;
            switch (chunk[y][x]) {
            case ',':
                chunk[y][x] = '.';
                return true;
            case '.':
                chunk[y][x] = '0';
                return true;
            default:
                chunk[y - vy][x - vx] = '0';
                noMove('A boulder')();
            }
        },
        'O': noMove('A Bush'),
        'o': noMove('A shrub'),
        '|': canMove,
        '$': function (x, y) {
            'use strict';
            p.inven.gold += 1;
            chunk[y][x] = '.';
            return true;
        },
        '&': function (x, y) {
            'use strict';
            push('key');
            chunk[y][x] = '.';
            return true;
        },
        'X': function (x, y) {
            'use strict';
            var idx = p.inven.indexOf('key');
            if (idx >= 0) {
                p.inven.splice(idx, 1);
                chunk[y][x] = '-';
            } else {
                message("You don't have any keys.", '#DD2');
            }
        },
        '!': function (x, y) {
            'use strict';
            p.health -= 20;
            chunk[y][x] = '.';
            return true;
        },
        '%': function (x, y) {
            'use strict';
            p.health = Math.min(p.health + Math.random() * 6 + 1, p.maxHealth);
            chunk[y][x] = '.';
            return true;
        },
        'D': function (x, y) {
            'use strict';
            var idx = p.inven.indexOf('portal');
            if (idx >= 0) {
                p.inven.splice(idx, 1);
                chunk[y][x] = ')';
            }
            return true;
        },
        'ǃ': function (x, y) {
            'use strict';
            var idx = p.inven.indexOf('key'),
                mlg = new window.SpeechSynthesisUtterance("Wait, what the hell?");
            mlg.lang = 'en-US';
            window.speechSynthesis.speak(mlg);
            if (idx >= 0) {
                p.inven.splice(idx, 1);
                p.inven.push('portal', 'key', 'bow', "Hey, how'd you figure that one out?");
                p.health = p.health + 5;
                chunk[y][x] = 'v';
            }
            return true;
        },
        '3': noMove('A swamp'),
        ')': function (x, y) {
            'use strict';
            var i, j;
            if (!use) {
                return true;
            }
            for (i in chunk) {
                if (chunk.hasOwnProperty(i)) {
                    for (j in chunk[i]) {
                        if (chunk[i][j] === ' (') {
                            chunk[y][x] = ')';
                            p.objectOn = '(';
                            p.x = +j;
                            p.y = +i;
                            return false;
                        }
                    }
                }
            }
            return true;
        },
        '(': function (x, y) {
            'use strict';
            var i, j;
            if (use) {
                return true;
            }
            for (i in chunk) {
                if (chunk.hasOwnProperty(i)) {
                    for (j in chunk[i]) {
                        if (chunk[i][j] === ')') {
                            chunk[y][x] = ' (';
                            p.objectOn = ')';
                            p.x = +j;
                            p.y = +i;
                            chunk[p.y][p.x] = '@';
                            return false;
                        }
                    }
                }
            }
            return true;
        },
        'P': function (x, y) {
            'use strict';
            push('portal ');
            chunk[y][x] = '.';
            return true;
        },
        '8': function (x, y) {
            'use strict';
            p.stats.defense += 1;
            message('Your skin hardens.', '#EEC900');
            chunk[y][x] = '.';
            return true;
        },
        '1': function (x, y) {
            'use strict';
            p.stats.attack += 1;
            message('You feel empowered.', '#EEC900');
            chunk[y][x] = '.';
            return true;
        },
        '?': function (x, y) {
            'use strict';
            if (Math.random() > 0.5) {
                p.stats.defense += 1;
                message('Your skin hardens.', '#EEC900');
            } else {
                p.stats.attack += 1;
                message('You feel empowered.', '#EEC900');
            }
            chunk[y][x] = '.';
            p.health = p.health + 3;
            return true;
        },
        'i': function (x, y) {
            'use strict';
            push(new Bow(Math.floor(p.stats.attack * 2 / p.stats.defense)));
            chunk[y][x] = '.';
            return true;
        },
        ' ': noMove('The abyss'),
        'l': function (x, y) {
            'use strict';
            push(new Item('Prim', '+' + Math.ceil(Math.random() * p.stats.attack) + ' to attack'), 'Magic Sword');
            chunk[y][x] = '.';
            return true;
        }
    },
    play = true,
    use = false,
    Enemy,
    defEnemies = {
        '`': {
            health: 1,
            move: 1,
            damage: 1,
            name: 'Feather Wasp'
        },
        'G': {
            health: 3,
            move: 0.9,
            damage: 1,
            name: 'Goblin'
        },
        'b': {
            health: 5,
            move: 0.4,
            damage: 2,
            name: 'Bulk'
        },
        'a': {
            health: 1,
            shoot: true,
            move: 0.2,
            damage: 2,
            name: 'Archer'
        },
        'S': {
            health: 3,
            move: 1,
            damage: 1,
            name: 'Snake'
        },
        'C': {
            health: 9,
            move: 1,
            damage: 6,
            name: 'Cat'
        },
        'B': {
            health: 0.1,
            move: 1,
            name: 'Bonk',
            damage: 30
        },
        'Θ': {
            health: 4,
            name: 'Necromancer',
            act: function () {
                'use strict';
                var spots, dam, i, j, r;
                if (this.health <= 0) {
                    return (this.objectOn = '%');
                }
                if (Math.abs(this.x - p.x) < 2 && Math.abs(this.y - p.y) < 2) {
                    dam = Math.round(4 / Math.sqrt(p.stats.defense) / 2);
                    p.health = Math.max(0, p.health - dam);
                    message('The ' + this.name + ' hits!-' + dam + ' health.', '#f00');
                } else if (Math.random() < 0.15) {
                    for (spots = [], i = -1; i < 2; i += 1) {
                        for (j = -1; j < 2; j += 1) {
                            if ('.*-3'.includes(chunk[i + this.y][j + this.x])) {
                                spots.push({
                                    x: j + this.x,
                                    y: i + this.y
                                });
                                if (spots.length) {
                                    spots = spots[Math.floor(Math.random() * spots.length)];
                                    spots.objectOn = chunk[spots.y][spots.x];
                                    r = Math.random() * 10;
                                    chunk[spots.y][spots.x] = spots.t = r > 5 ? 'Θ' : r > 1.5 ? 'S' : r > 0.2 ? 'G' : 'R';
                                    enemies.push(new Enemy(spots));
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    enemies = [],
    select = 0,
    inItem = false,
    select2 = 0,
    thong = '',
    i,
    j,
    block = '#+ ',
    toP = new ROT.Path.AStar(p.x, p.y, function (x, y) {
        'use strict';
        return !block.includes(chunk[y][x]);
    });
Enemy = function Enemy(t, x, y) {
    'use strict';
    var i;
    if (typeof t === 'object') {
        for (i in defEnemies[t.t]) {
            if (defEnemies[t.t].hasOwnProperty(i)) {
                this[i] = defEnemies[t.t][i];
            }
        }
        this.t = t.t;
        this.x = t.x;
        this.y = t.y;
        this.objectOn = t.objectOn || '.';
    } else {
        for (i in defEnemies[t]) {
            if (defEnemies[t].hasOwnProperty(i)) {
                this[i] = defEnemies[t][i];
            }
        }
        this.t = t;
        this.x = x;
        this.y = y;
        this.objectOn = '.';
    }
    this.act = this.act || function () {
        if (this.health <= 0) {
            return true;
        }
        if (this.objectOn === 'R') {
            this.objectOn = '.';
            return true;
        }
        var spots, dam, i, j;
        if (Math.abs(this.x - p.x) < 2 && Math.abs(this.y - p.y) < 2) {
            dam = Math.round(this.damage / Math.sqrt(p.stats.defense)) + 1;
            p.health = Math.max(0, p.health - dam);
            message('The ' + this.name + ' hits!-' + dam + ' health.', '#f00');
        } else if (Math.random() < this.move) {
            spots = [];
            for (i = -1; i < 2; i += 1) {
                for (j = -1; j < 2; j += 1) {
                    if (('.-*$%&v^R3,' + (this.t === 'S' ? '~' : 'D')).includes(chunk[i + this.y][j + this.x])) {
                        spots.push({
                            x: j + this.x,
                            y: i + this.y
                        });
                    }
                }
            }
            if (spots.length) {
                spots = spots[Math.floor(Math.random() * spots.length)];
                chunk[this.y][this.x] = this.objectOn;
                this.objectOn = chunk[this.y = spots.y][this.x = spots.x];
                if (this.objectOn === ',') {
                    this.health -= Math.floor(Math.random() * 4);
                    this.objectOn = '.';
                }
                chunk[this.y = spots.y][this.x = spots.x] = this.t;
            }
        }
    };
};

function isItem(thing) {
    'use strict';
    return !!thing && thing.item;
}

function print(str) {
    'use strict';
    console.log(Array.from(arguments));
    return str;
}
function init() {
    'use strict';
    var i, j;
    play = true;
    chunk = chunks[p.currentChunk];
    console.log(p.currentChunk, chunks, chunk);
    enemies = [];
    thong = '';
    //console.log('chunk:', chunk);
    for (i = 0; i < chunk.length; i += 1) {
        //console.log('Line:', chunk[i]);
        for (j = 0; j < chunk[i].length; j += 1) {
            if ('@'.includes(chunk[i][j])) {
                p.x = +j;
                p.y = +i;
            } else if (defEnemies.hasOwnProperty(chunk[i][j])) {
                enemies.push(new Enemy(chunk[i][j], +j, +i));
            }
        }
    }
    drawMap();
    log = [];
}
init();
p.inven.gold = 0;
drawMap();
var j, i;
for (j in chunks) {
    if (chunks.hasOwnProperty(j)) {
        for (i = 0; i < chunks[j].length; i += 1) {
            chunks[j][i] = chunks[j][i].split('');
        }
    }
}

function update() {
    'use strict';
    var i, m1g, idx;
    p.health = Math.round(p.health);
    if (play) {
        drawMap();
        if (p.health <= 0) {
            m1g = new window.SpeechSynthesisUtterance("Ouch");
            m1g.lang = 'en-UK';
            window.speechSynthesis.speak(m1g);
            objson = [];
            p.objectOn = '.';
            p.currentChunk = 1;
            p.inven = [];
            p.inven.gold = 0;
            p.health = 50;
            init();
        }
    } else {
        display.clear();
        display.drawText(50, 50, "You have " + p.inven.gold + ' gold and ' + p.inven.length + ' other items:', '#fff');
        if (!p.inven.gold && !p.inven.length) {
            display.drawText(70, 100, 'Yer broke skrub!', '#fff');
        } else {
            for (i = 0; i < p.inven.length; i += 1) {
                display.drawText(70, 100 + 25 * i, (i === select && !inItem ? '> ' : '  ') + (p.inven[i].name || p.inven[i]), '#fff');
                if (use && i === select) {
                    if (isItem(p.inven[select]) && !inItem) {
                        inItem = true;
                        use = false;
                    }
                    if (!inItem) {
                        use = false;
                    }
                }
            }
            if (isItem(p.inven[select])) {
                idx = 0;
                for (i in p.inven[select].op) {
                    if (p.inven[select].op.hasOwnProperty(i)) {
                        display.drawText(500, 100 + 25 * idx, (idx === select2 && inItem ? '> ' : '  ') + i, '#fff');
                        if (use && idx === select2) {
                            p.inven[select].op[i]();
                        }
                        idx += 1;
                    }
                }
            }
        }
    }
}

function movePlayer(vx, vy) {
    'use strict';
    var i, x, y;
    //console.log(p.x, vx, p.x + vx, chunk[p.y].length, p.x + vx >= chunk[p.y].length);
    if (p.y + vy >= chunk.length) {
        console.log('Down');
        objson[p.currentChunk] = p.objectOn;
        i = calcChunk(p.currentChunk);
        i[1] += 1;
        p.currentChunk = calcChunk(i);
        if (!chunks[p.currentChunk] || p.objectOn === '*') {
            console.log(p.currentChunk, i, chunks[p.currentChunk]);
            i[1] -= 1;
            p.currentChunk = calcChunk(i);
            console.log('No chunk');
            return noMove('The abyss')();
        }
        chunk[p.y][p.x] = p.objectOn;
        p.objectOn = objson[p.currentChunk] || '.';
        x = p.x;
        init();
        p.y = 0;
        p.x = x;
        chunk[p.y][p.x] = '@';
        return;
    }
    if (p.y + vy < 0) {
        console.log('Up');
        objson[p.currentChunk] = p.objectOn;
        i = calcChunk(p.currentChunk);
        i[1] -= 1;
        p.currentChunk = calcChunk(i);
        console.log(p.currentChunk, i, chunks[p.currentChunk]);
        if (!chunks[p.currentChunk] || p.objectOn === '*') {
            i[1] += 1;
            p.currentChunk = calcChunk(i);
            console.log('No chunk');
            return noMove('The abyss')();
        }
        chunk[p.y][p.x] = p.objectOn;
        p.objectOn = objson[p.currentChunk] || '.';
        x = p.x;
        init();
        p.y = chunk.length - 1;
        p.x = x;
        chunk[p.y][p.x] = '@';
        return;
    }
    if (p.x + vx >= chunk[p.y].length) {
        objson[p.currentChunk] = p.objectOn;
        i = calcChunk(p.currentChunk);
        i[0] += 1;
        p.currentChunk = calcChunk(i);
        if (!chunks[p.currentChunk] || p.objectOn === '*') {
            console.log(p.currentChunk, i, chunks[p.currentChunk]);
            i[0] -= 1;
            p.currentChunk = calcChunk(i);
            console.log('No chunk');
            return noMove('The abyss')();
        }
        chunk[p.y][p.x] = p.objectOn;
        p.objectOn = objson[p.currentChunk] || '.';
        y = p.y;
        init();
        p.y = y;
        p.x = 0;
        chunk[p.y][p.x] = '@';
        return;
    }
    if (p.x + vx < 0) {
        objson[p.currentChunk] = p.objectOn;
        i = calcChunk(p.currentChunk);
        i[0] -= 1;
        p.currentChunk = calcChunk(i);
        if (!chunks[p.currentChunk] || p.objectOn === '*') {
            console.log(p.currentChunk, i, chunks[p.currentChunk]);
            i[0] += 1;
            p.currentChunk = calcChunk(i);
            console.log('No chunk');
            return noMove('The abyss')();
        }
        chunk[p.y][p.x] = p.objectOn;
        p.objectOn = objson[p.currentChunk] || '.';
        y = p.y;
        init();
        p.y = y;
        p.x = chunk[y].length - 1;
        chunk[p.y][p.x] = '@';
        return;
    }
    if (!(behavior[(chunk && chunk[p.y + vy] && chunk[p.y + vy][p.x + vx])] || canMove)(p.x + vx, p.y + vy, vx, vy)) {
        return;
    }
    if (defEnemies.hasOwnProperty(chunk[p.y + vy][p.x + vx])) {
        for (i = 0; i < enemies.length; i += 1) {
            if (enemies[i].x === p.x + vx && enemies[i].y === p.y + vy) {
                enemies[i].health -= p.stats.attack;
                message('You attack a ' + enemies[i].name + ' for ' + p.stats.attack + ' damage.', '#0f0', '');
            }
        }
    } else {
        chunk[p.y][p.x] = p.objectOn;
        p.y += vy;
        p.x += vx;
        p.objectOn = chunk[p.y][p.x];
        if (p.objectOn === '|') {
            p.objectOn = '#';
        }
        chunk[p.y][p.x] = '@';
    }
    for (i = 0; i < enemies.length; i += 1) {
        if (enemies[i].act()) {
            chunk[enemies[i].y][enemies[i].x] = enemies[i].objectOn;
            message('A ' + enemies[i].name + ' died', '#D5D8DC');
            enemies.splice(i, 1);
        }
    }
}

document.onkeydown = function (evt) {
    'use strict';
    if (evt.ctrlKey) {
        return;
    }
    var key = evt.keyCode || evt.which, i, q;
    function k(a) {
        return String.fromCharCode(key).toLowerCase() === a;
    }
    evt.preventDefault();
    if (!play) {
        if (k('w')) {
            if (inItem) {
                select2 -= 1;
            } else {
                select -= 1;
            }
        }
        if (k('s')) {
            if (inItem) {
                select2 += 1;
            } else {
                select += 1;
            }
        }
        if (k('x')) {
            use = true;
        }
        if (k('a')) {
            if (inItem) {
                inItem = false;
            }
        }
    }
    if (!play) {
        return update();
    }
    if (k('w')) {
        movePlayer(0, -1);
    } else if (k('a')) {
        movePlayer(-1, 0);
    } else if (k('s')) {
        movePlayer(0, 1);
    } else if (k('d')) {
        movePlayer(1, 0);
    } else if (k('q')) {
        movePlayer(-1, -1);
    } else if (k('e')) {
        movePlayer(1, -1);
    } else if (k('c')) {
        movePlayer(1, 1);
    } else if (k('z')) {
        movePlayer(-1, 1);
    } else if (k('r') && evt.shiftKey) {
        p.health = 0;
    } else if (k('f') && p.equip.Sec && p.equip.Sec.use) {
        p.equip.Sec.use(function () {
            for (i = 0; i < p.inven.length; i += 1) {
                if (p.inven[i] === p.equip.Sec) {
                    p.inven.splice(i, 1);
                }
            }
            p.equip.Sec = null;
        });
        movePlayer(0, 0);
    } else if (k('n')) {
        movePlayer(0, 0);
    } else if (k('x')) {
        use = true;
        q = function q(a) {
            return a.includes(p.objectOn);
        };
        if (q('v^=')) {
            objson[p.currentChunk] = p.objectOn;
            chunks[p.currentChunk] = chunk;
            p.objectOn = objson[p.currentChunk += q('v') ? 1 : q('^') ? -1 : 1 - p.currentChunk] || '.';
            return init(use = false);
        } else if (q('¢)')) {
            behavior[p.objectOn](p.x, p.y);
        } else if (q('-')) {
            p.objectOn = '+';
        }
        use = false;
    }
    update();
};

function audio(tracks) {
    'use strict';
    var i;
    tracks = tracks.map(function (v) {
        return new Audio(v);
    });
    function help(i) {
        return function () {
            tracks[i].currentTime = 0;
            tracks[(i === tracks.length - 1 ? 0 : i + 1)].play();
        };
    }
    for (i = 0; i < tracks.length; i += 1) {
        tracks[i].addEventListener('ended', help(i));
        tracks[0].play();
    }
}
update();
init();
function maze(place) {
    'use strict';
    var w = 20, h = 20, map = new ROT.Map.DividedMaze(w, h), c = chunks[place] = [];
    for (i = 0; i < h; i += 1) {
        c.push([]);
        for (j = 0; j < w; j += 1) {
            c[i].push([]);
        }
    }
    map.create(function (x, y, i) {
        if (i) {
            c[y][x] = '#';
        } else {
            c[y][x] = '.';
        }
    });
}
function placePassage(chunk, dirr, xory) {
    'use strict';
}
maze('-1,0');