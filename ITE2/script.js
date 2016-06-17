/*jslint browser:true*/
/*global ROT, console, Audio*/
var display = new ROT.Display({width: 60, height: 40});
document.body.appendChild(display.getContainer()); /* do not forget to append to page! */
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
        currentFloor: 1,
        floor: {
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
var floors = [
        [
            '                                            ',
            ' Θ.......................................Θ    ',
            ' .........................................    ',
            ' ...........%...%..%%%%..%....%...........    ',
            ' ............%.%..%....%.%....%...........    ',
            ' .............%...%....%.%....%...........    ',
            ' .............%...%....%.%....%...........    ',
            ' .............%....%%%%...%%%%............    ',
            ' .........................................    ',
            ' ...............¡....?....¡...............    ',
            ' ............?.&...........&.?............    ',
            ' ..............&/P...@...P/&..............    ',
            ' ............?.&...........&.?............    ',
            ' ...............8....v....8...............    ',
            ' .........................................    ',
            ' ............$.....$..$..$...$............    ',
            ' ............$.....$..$..$$..$............    ',
            ' ............$.....$..$..$.$.$............    ',
            ' .............$.$.$...$..$..$$............    ',
            ' ..............$.$....$..$...$............    ',
            ' .........................................    ',
            ' Θ.......................................Θ    ',
            '                                            '
        ],
        [
            '       O0o0oO0ooOo0o0Oo          ',
            '   0oOo0o0Oo0oO0o0oO0oOO0oO      ',
            ' oO0............$.........0O     ',
            '0.......!...............¢..oO           ',
            '0O........¢...........ǃ.......0oOooO0o   ',
            'o~..........[..@v??...l.......XXXXXXX^o',
            '0~~~..!.........i.....B....!..00OoOo00" ',
            'O&%~~.....R..................oO  ',
            ' o~~~.......¢............¢."O:   ',
            '  0O~...........".........0o.0    ',
            '   :oo0Oo0oO0o0oXo0oo0oOoOo?BoO   ',
            '   :   O0O0oo0oO0oO0ooOO?.C.b?o0  ',
            '   :   Oo......S.S..$.o0oO.a.b10  ',
            '   :  0O¢.....`.,.`...|||a..C.Oo  ',
            '   :   0o......a......ooo8.a8Oo   ',
            '   :    0oOo.....0oOOo00OO00oo    ',
            '   :      Oo0O.&o%0oo0o           ',
            '   ::::::::::ooOOOo0              '
        ],
        [
            '##########                       ############',
            '#8G`..1..+***        ##########  #...R....$`#',
            '#333333..#  ****     #.$......+**+......."..#',
            '#&C`.....# **  ******-,...!...#  #########X##',
            '#`b.....%##+## *     #.......!#  #.,.,#.a..%#',
            '#####W##++~~~# *     #####X.+##  #,.‚.#.%..a#',
            '#..#.....#~^~# *          * *    #.,.,#,##|##',
            '##,,..1..##### *          * *    #..,.#.,...#',
            '#v$#@.%..+|*******T**********    #...,#,.,..#',
            '#.,#.....#:   *        *         #.R..#.,.,.#',
            '##0####### :  *        *  ########....+,.,.,#',
            ' #X&,¡$P#   : ****T*******|$/|.|.|..`.#.,.,.#',
            ' #X######    :*        *  #######..abG#..,.,#',
            '  *       ******|$$$$$X*        #############',
            '  *********'
        ],
        [
            '######   ################        ',
            '#=@..#  *+.......$.....!#        ',
            '#v...+ * #`.$....,....$.#        ',
            '##### *1*#``..###+##.B..#   #####',
            '       * #&``.#  * #....+***+.¡.#',
            ' ##### * ###### ** ######   #.G.#',
            ' #%$~#* *#....# |  #.``&+***+..a#',
            ' #~%~+   +...G# *  #..``#   ##X##',
            ' #####:  #X...##+###.$.`#     X  ',
            '    #=####XXa...,.......# #####X ',
            '    #%%%%XXXXa.......$..+ #%%%+ ',
            '    #####################:#####: ',
            '                          :::::   '
        ],
        [
            '           :: ',
            '##########l# :',
            '#@0#=,.0,RR#: ',
            '#0.#.,..0..# : ',
            '#0.|#.$.0,D#: ',
            '#,.0.##,0.##: ',
            '#..#,#.....X#v',
            '###########:! '
        ],
        [
            '######         #####',
            '#¡%$%$      :  #..^#',
            '#.@^=D   (**"**+..=#',
            '#¡%$%$:::   !  #..v#',
            '######         #####'
        ],
        [
            "  ##################***||************########",
            '  #&&GX^.@..b&X.`C/#.###|###  *     *#.."D".#',
            '  #~~~~~~~~~~~~~~~~#.#Cabg$###|### * #..."..#',
            '  #..".............#.#&&...XXX...#*  #......#',
            '  #......GS....#####.###|#####...#:* #......#',
            '###,,..........#...#.#  *  #8%$%1#: *+.PG&E.#',
            '#(#P,...".ab...+...+.X|**  #88.11#:  #######',
            '#"###############:#### ::######::',
            '#%%%%%%%%v        :: ::: : :::::::',
            '##########::::::::: :   : :'
        ],
        [
            '              ::::::::: ::',
            '#############:#########:  ::::::::::::::::::::::###########',
            '#?Ca...!....@#Θ+...+..+***         #############..R..!..$`#',
            '#CCb..!B###!###..+.!...#  R***     #.$....&.+..+....Θ.."..#',
            '#abb###...|.|.+&+..+.+.# **  R*****-,...!...############X##',
            '#####v#########...+...%##+## *  :  #..B....!#  #.,1,#.a..%#',
            '  ###,################+|~~R# *  :  ######+##   #,.‚.#.%..a#',
            '  #+|,|#      #CC#B!...#%!&#!*  :      * * *   #&,.,#,##|##',
            '  #&0,0|      ##,,....R##### *  :     * * *R*  #..,.#.,.!1#',
            '  ###|##:     #?$#..%.X.+***|******C * *!* * * #.".,#,.,!.#',
            '        :     #..#!...&#:   *       * * * * * *#.!..#"ǃ.,.#',
            '       ::     #.0#######:   X   | | | * #########B."+".,B,#',
            '       :      #X&,¡$P#:    * * * * * * !|$/|.|.|..`"#!!.,.#',
            '        : :::"#X#####:     *  | | | X   ######%!.abG#..,.,#',
            '         :    :#*#     ***X**|**$$*X:::::::::#############:',
            '         R!!!!#X#*******                      :::::::::::::'
        ],
        [
            '#############',
            '#@........3.#',
            '#.........3.#',
            '#....C....3.#',
            '#...b&b...3.#',
            '#....C....3.#',
            '#.........3.#',
            '#........=3Θ#',
            "############'"
        ]
    ],
    floor,
    original = [],
    fov = new ROT.FOV.DiscreteShadowcasting(function (x, y) {
        'use strict';
        if (floor[y] && floor[y][x]) {
            return !'#X |T+3o0O:'.includes(floor[y][x]);
        }
    }),
    color = {
        '0': '#7EAC90',
        '%R': getRandomColor,
        '/[': '#8B5934',
        '~': '#20B2AA',
        'OG': '#1C8B1C',
        'b': '#AF4374',
        'S': '#8C8799',
        'o¡': '#0f0',
        '.,': '#8B7C7C',
        'B': '#1DCF44',
        '*?81': '#4F4F4F',
        '$': '#FFAF33',
        '`': '#FFF333',
        '¢': '#FB2',
        '@!ǃ': p.color,
        'v^=+-X': '#DFBC75',
        '#|T': '#564646',
        'C': '#F4A60C',
        'a': '#0CD9F4',
        '&': '#F0F40C',
        'Θ': '#5D4980',
        ':': function () {'use strict'; return cheat ? '#0f0' : '#000'; },
        '‚': '#8B8C7C',
        '?': switcher,
        '3': '#3C0065',
        'il': '#2DA24B',
        'W': '#C0C0C0'
    };
function getColor(a) {
    'use strict';
    var i;
    for (i in color) {
        if (color.hasOwnProperty(i) && i.includes(a)) {
            return (typeof color[i] === 'function' ? color[i]() : color[i]);
        }
    }
}
function drawMap() {
    'use strict';
    display.clear();
    var size = 1,
        cy = 1,
        cx,
        txt,
        i,
        j;
    fov.compute(p.x, p.y, 100, function (x, y) {
        cy = Math.max(y, cy);
        i = y;
        j = x;
        if (floor && floor[i] && floor[i][j]) {
            display.draw(j, i, floor[i][j], getColor(floor[i][j]));
        }
    });
    cy = Math.max(cy, 10);
    cy += 2;
    display.drawText(1, cy, 'You have ' + Math.floor(p.health) + ' health.', p.health <= 50 ? '#0f0' : (p.health <= 25 ? '#ff0' : (p.health <= 10 ? '#f00' : getRandomColor())));
    cy += 2;
    display.drawText(1, cy, 'Your attack is ' + p.stats.attack + ' and your defense is ' + p.stats.defense + '.', '#00f');
    for (i in log) {
        if (log.hasOwnProperty(i)) {
            cy += 2;
            txt = log[i].split(':');
            txt = '%c{' + txt.shift() + '}' + txt.join(':');
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
var swi = 1,
    thong = '',
    use;
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
function calcDist(x, y, x2, y2) {
    'use strict';
    return Math.abs(x - x2) + Math.abs(y - y2);
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
    this.name = this.effect.capitalize() + ' potion';
    this.item = true;
}
function Bow(power, range) {
    'use strict';
    this.place = 'Sec';
    this.range = range = range || 2;
    this.use = function () {
        var e, i;
        for (i = 0; i < enemies.length; i += 1) {
            e = enemies[i];
            if (Math.abs(e.x - p.x) < range + 1 && Math.abs(e.y - p.y) < range + 1) {
                e.health -= power;
                message('You zapped a ' + e.name + ' for ' + power + ' damage!', '#0c0');
                return;
            }
        }
        if (thong !== 'No enemies to zap!') {
            message(thong = 'No enemies to zap!', '#0aa');
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
//    console.log(arguments, n);
    this.name = (n || (this.place + ' ' + (this.weapon ? 'Weapon' : 'Armour'))) + ': ' + this.effect;
    this.item = true;
}
var chestLoot = {
        trolly: function () {
            'use strict';
            p.health = Math.random() * 50 / 2;
        },
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
        great: ['$', '$', '$', "Bow", "Potion"]
    },
    objson = [],
    behavior = {
        ',': function (x, y) {
            'use strict';
            var rand = Math.random() * 16 / p.stats.defense;
            p.health -= rand;
            floor[y][x] = '.';
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
            floor[y][x] = '-';
        },
        '-': canMove,
        'v': canMove,
        '¡': function (x, y) {
            'use strict';
            push(new Potion(Math.round(Math.random())));
            floor[y][x] = '.';
            return true;
        },
        '/': function (x, y) {
            'use strict';
            push('raft');
            floor[y][x] = '.';
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
            floor[y][x] = '#';
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
            floor[y][x] = '.';
            x += vx;
            y += vy;
            switch (floor[y][x]) {
            case ',':
                floor[y][x] = '.';
                return true;
            case '.':
                floor[y][x] = '0';
                return true;
            default:
                floor[y - vy][x - vx] = '0';
                noMove('A boulder')();
            }
        },
        'O': noMove('A Bush'),
        'o': noMove('A shrub'),
        '|': canMove,
        '$': function (x, y) {
            'use strict';
            p.inven.gold += 1;
            floor[y][x] = '.';
            return true;
        },
        '&': function (x, y) {
            'use strict';
            push('key');
            floor[y][x] = '.';
            return true;
        },
        'X': function (x, y) {
            'use strict';
            var idx = p.inven.indexOf('key');
            if (idx >= 0) {
                p.inven.splice(idx, 1);
                floor[y][x] = '-';
            } else {
                message("You don't have any keys.", '#DD2');
            }
        },
        '!': function (x, y) {
            'use strict';
            p.health -= 20;
            floor[y][x] = '.';
            return true;
        },
        '%': function (x, y) {
            'use strict';
            p.health = Math.min(p.health + Math.random() * 6 + 1, p.maxHealth);
            floor[y][x] = '.';
            return true;
        },
        'D': function (x, y) {
            'use strict';
            var idx = p.inven.indexOf('portal');
            if (idx >= 0) {
                p.inven.splice(idx, 1);
                floor[y][x] = ')';
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
                floor[y][x] = 'v';
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
            for (i in floor) {
                if (floor.hasOwnProperty(i)) {
                    for (j in floor[i]) {
                        if (floor[i][j] === ' (') {
                            floor[y][x] = ')';
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
            for (i in floor) {
                if (floor.hasOwnProperty(i)) {
                    for (j in floor[i]) {
                        if (floor[i][j] === ')') {
                            floor[y][x] = ' (';
                            p.objectOn = ')';
                            p.x = +j;
                            p.y = +i;
                            floor[p.y][p.x] = '@';
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
            floor[y][x] = '.';
            return true;
        },
        '8': function (x, y) {
            'use strict';
            p.stats.defense += 1;
            message('Your skin hardens.', '#EEC900');
            floor[y][x] = '.';
            return true;
        },
        '1': function (x, y) {
            'use strict';
            p.stats.attack += 1;
            message('You feel empowered.', '#EEC900');
            floor[y][x] = '.';
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
            floor[y][x] = '.';
            p.health = p.health + 3;
            return true;
        },
        'i': function (x, y) {
            'use strict';
            push(new Bow(Math.floor(p.stats.attack * 2 / p.stats.defense)));
            floor[y][x] = '.';
            return true;
        },
        ' ': noMove("The corridor's wall"),
        'l': function (x, y) {
            'use strict';
            push(new Item('Prim', '+' + Math.ceil(Math.random() * p.stats.attack) + ' to attack', 'Magic Sword'));
            floor[y][x] = '.';
            return true;
        },
        'W': noMove('A window'),
        '[': function (x, y) {
            'use strict';
            floor[y][x] = '.';
            var i, v,
                keys = Object.keys(chestLoot),
                rand = Math.floor(ROT.RNG.getUniform() * keys.length),
                thing = chestLoot[keys[rand]];
            message('The chest is ' + keys[rand] + '!', '#00f');
            if (typeof thing === 'function') {
                thing();
            } else {
                for (i = 0; i < thing.length; i += 1) {
                    v = thing[i];
                    switch (v) {
                    case '$':
                        p.inven.gold += 1;
                        break;
                    case 'Bow':
                        push(new Bow(2));
                        break;
                    case 'Potion':
                        push(new Potion(Math.round(ROT.RNG.getUniform())));
                        break;
                    case '%':
                    case 'Food':
                        p.health += 1;
                        break;
                    default:
                        push(v);
                    }
                }
            }
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
                            if ('.*-3'.includes(floor[i + this.y][j + this.x])) {
                                spots.push({
                                    x: j + this.x,
                                    y: i + this.y
                                });
                                if (spots.length) {
                                    spots = spots[Math.floor(Math.random() * spots.length)];
                                    spots.objectOn = floor[spots.y][spots.x];
                                    r = Math.random() * 10;
                                    floor[spots.y][spots.x] = spots.t = r > 5 ? 'Θ' : r > 1.5 ? 'S' : r > 0.2 ? 'G' : 'R';
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
    block = '#+ X' + cheat ? '' : ':',
    toP = new ROT.Path.AStar(p.x, p.y, function (x, y) {
        'use strict';
        if (floor[y] && floor[y][x]) {
            return !block.includes(floor[y][x]);
        }
    }),
    floortxt = [
        "You win! Feel free to keep playing.\nOr you can close the tab and do someting productive. Or leave the tab open for five minuites. Special features!",
        "Press h for help and m to enable messages",
        "Protip: ! is bad and % is good, avoid moving things",
        "Decisions, desicions",
        "Hint: Things are not as they seem. You might as well try everything.",
        "¡ and $ are good",
        "Have fun!",
        "Deja vu? Nope? Well then, welcome to the land of death by poison.",
        'Welcome to the box.'
    ],
    $ellers = [
        {
            floor: 1,
            x: 10,
            y: 4,
            wares: {
                key1: 5
            }
        },
        {
            floor: 1,
            x: 8,
            y: 13,
            wares: {
                key1: 3,
                portal1: 15
            }
        },
        {
            floor: 1,
            x: 12,
            y: 8,
            wares: {
                key1: 2
            }
        },
        {
            floor: 1,
            x: 25,
            y: 8,
            wares: {
                key1: 3
            }
        },
        {
            floor: 1,
            x: 25,
            y: 3,
            wares: {
                key1: 2
            }
        },
        {
            floor: 2,
            x: 8,
            y: 6,
            wares: {
                key1: 3,
                key2: 3,
                key3: 4
            }
        }
    ],
    seller = null,
    sellers = [],
    ware,
    buy = false;
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
    this.vis = this.vis || 5;
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
            message('The ' + this.name + ' hits! -' + dam + ' health.', '#f00');
        } else if (Math.random() < this.move) {
            spots = [];
            for (i = -1; i < 2; i += 1) {
                for (j = -1; j < 2; j += 1) {
                    if (('.-*$%&v^R3,' + (this.t === 'S' ? '~D' : 'D')).includes(floor[i + this.y][j + this.x])) {
                        spots.push({
                            x: j + this.x,
                            y: i + this.y
                        });
                    }
                }
            }
            if (calcDist(this.x, this.y, p.x, p.y) < this.vis) {
                toP.compute(this.x, this.y, function (x, y) {
                    var spot;
                    //console.log(x, y, spots);
                    for (i = 0; i < spots.length; i += 1) {
                        if (spots[i].x === x && spots[i].y === y) {
                            //console.log(spots[i]);
                            spot = spots[i];
                            break;
                        }
                    }
                    //console.log(this, spots, spot);
                    if (!spot) {
                        return;
                    }
                    floor[this.y][this.x] = this.objectOn;
//                    console.log(floor);
//                    console.log(this.y, spot.y);
//                    console.log(floor[spot.y]);
//                    console.log(this.x, spot.x);
//                    console.log(floor[spot.y][spot.x]);
                    this.objectOn = floor[this.y = spot.y][this.x = spot.x];
                    if (this.objectOn === ',') {
                        this.health -= Math.floor(Math.random() * 4);
                        message('A ' + this.name + 'hit a trap.', '#00f');
                        this.objectOn = '.';
                    }
                    floor[this.y = spot.y][this.x = spot.x] = this.t;
                }.bind(this));
            } else if (spots.length) {
                spots = spots[Math.floor(Math.random() * spots.length)];
                floor[this.y][this.x] = this.objectOn;
                this.objectOn = floor[this.y = spots.y][this.x = spots.x];
                if (this.objectOn === ',') {
                    this.health -= Math.floor(Math.random() * 4);
                    this.objectOn = '.';
                }
                floor[this.y = spots.y][this.x = spots.x] = this.t;
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
//    console.log(Array.from(arguments));
    return str;
}
function init() {
    'use strict';
    var i, j;
    play = true;
    floor = floors[p.currentFloor];
//    console.log(p.currentFloor, floors, floor);
    enemies = [];
    thong = '';
    //console.log('floor:', floor);
    for (i = 0; i < floor.length; i += 1) {
        //console.log('Line:', floor[i]);
        for (j = 0; j < floor[i].length; j += 1) {
            if ('@'.includes(floor[i][j])) {
                p.x = +j;
                p.y = +i;
            } else if (defEnemies.hasOwnProperty(floor[i][j])) {
                enemies.push(new Enemy(floor[i][j], +j, +i));
            }
        }
    }
    drawMap();
    log = [];
}
init();
p.inven.gold = 0;
drawMap();
for (j in floors) {
    if (floors.hasOwnProperty(j)) {
        for (i = 0; i < floors[j].length; i += 1) {
            floors[j][i] = floors[j][i].split('');
        }
    }
}

function update() {
    'use strict';
    var i, m1g, idx, y;
    p.health = Math.round(p.health);
    if (play) {
        drawMap();
        if (p.health <= 0) {
            m1g = new window.SpeechSynthesisUtterance("Ouch");
            m1g.lang = 'en-UK';
            window.speechSynthesis.speak(m1g);
            objson = [];
            p.objectOn = '.';
            p.currentFloor = 1;
            p.inven = [];
            p.inven.gold = 0;
            p.health = 50;
            init();
            p.objectOn = 'v';
        }
    } else if (seller) {
        display.clear();
        display.draw('Selling:', 1, 2, '#fff');
        y = 50;
        idx = 0;
        for (i in seller.wares) {
            if (seller.wares.hasOwnProperty(i)) {
                if (ware === idx && buy) {
                    buy = false;
                    if (p.inven.gold >= seller.wares[i]) {
                        p.inven.gold -= seller.wares[i];
                        delete seller.wares[i];
                        push(i.slice(0, -1));
                    }
                } else {
                    display.draw(10, y, (ware === idx ? '> ' : '  ') + i.slice(0, -1) + ': ' + seller.wares[i], '#fff');
                    y += 21;
                    idx += 1;
                }
            }
        }
    } else {
        display.clear();
        display.drawText(1, 1, "You have " + p.inven.gold + ' gold and ' + p.inven.length + ' other items:', '#fff');
        if (!p.inven.gold && !p.inven.length) {
            display.drawText(5, 5, 'Yer broke skrub!', '#fff');
        } else {
            for (i = 0; i < p.inven.length; i += 1) {
                display.drawText(5, 5 + 2 * i, (i === select && !inItem ? '> ' : '  ') + (p.inven[i].name || p.inven[i]), '#fff');
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
                        display.drawText(20, 5 + 2 * idx, (idx === select2 && inItem ? '> ' : '  ') + i, '#fff');
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
function resetSellers() {
    'use strict';
    var i, j, k;
    for (i in $ellers) {
        if ($ellers.hasOwnProperty(i)) {
            sellers.push({});
            for (j in $ellers[i]) {
                if ($ellers[i].hasOwnProperty(j)) {
                    if (typeof $ellers[i][j] === 'object') {
                        sellers[i][j] = {};
                        for (k in $ellers[i][j]) {
                            if ($ellers[i][j].hasOwnProperty(k)) {
                                sellers[i][j][k] = $ellers[i][j][k];
                            }
                        }
                    } else {
                        sellers[i][j] = $ellers[i][j];
                    }
                    floors[$ellers[i].floor][$ellers[i].y][$ellers[i].x] = '¢';
                }
            }
        }
    }
}
resetSellers();
function movePlayer(vx, vy) {
    'use strict';
    var i, x, y;
    //console.log(p.x, vx, p.x + vx, floor[p.y].length, p.x + vx >= floor[p.y].length);
    if (!(behavior[(floor && floor[p.y + vy] && floor[p.y + vy][p.x + vx])] || canMove)(p.x + vx, p.y + vy, vx, vy)) {
        return;
    }
    if (defEnemies.hasOwnProperty(floor[p.y + vy][p.x + vx])) {
        for (i = 0; i < enemies.length; i += 1) {
            if (enemies[i].x === p.x + vx && enemies[i].y === p.y + vy) {
                enemies[i].health -= p.stats.attack;
                message('You attack a ' + enemies[i].name + ' for ' + p.stats.attack + ' damage.', '#0f0', '');
            }
        }
    } else {
        floor[p.y][p.x] = p.objectOn;
        p.y += vy;
        p.x += vx;
        p.objectOn = floor[p.y][p.x];
        if (p.objectOn === '|') {
            p.objectOn = '#';
        }
        floor[p.y][p.x] = '@';
    }
    toP = new ROT.Path.AStar(p.x, p.y, function (x, y) {
        if (floor[y] && floor[y][x]) {
            return !block.includes(floor[y][x]);
        }
    });
    for (i = 0; i < enemies.length; i += 1) {
        if (enemies[i].act()) {
            floor[enemies[i].y][enemies[i].x] = enemies[i].objectOn;
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
    if (k('i')) {
        play = !play;
        seller = null;
    }
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
            objson[p.currentFloor] = p.objectOn;
            floors[p.currentFloor] = floor;
            p.objectOn = objson[p.currentFloor += q('v') ? 1 : q('^') ? -1 : 1 - p.currentFloor] || '.';
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
function alterCheat() {
    'use strict';
    cheat = !cheat;
    fov = new ROT.FOV.DiscreteShadowcasting(function (x, y) {
        if (floor[y] && floor[y][x]) {
            return !('#X T|+3o0O' + cheat ? ':' : '').includes(floor[y][x]);
        }
    });
}
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