/*global Phaser, console, getFrames*/
/*jslint browser:true*/
var game, Game, player, blocks = {}, cursors, sky, ground, lvl = 0,  attempts = 0, sound, text, keys = {
    jump: null,
    pause: null
}, buttons = {}, speed, keyHandlers = [], end, lvls, startAll, fileInput, emitter, defBlocks, pauseBackdrop;
function u(a) {
    'use strict';
    return (a !== undefined);
}
(function getLvls() {
    'use strict';
    var a = new XMLHttpRequest(), ab, lvl, v, i, j;
    a.open('get', 'lvls.json');
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState !== 4) {
            return;
        }
        lvls = JSON.parse(a.responseText);
        for (i = 0; i < lvls.length; i += 1) {
            lvl = lvls[i];
            if (lvl.blocks_string) {
                ab = lvl.blocks_string.split(';');
                for (j = 0; j < ab.length; j += 1) {
                    v = ab[j].split(',');
                    lvl.blocks.push({
                        x: v[0],
                        y: v[1],
                        type: v[2]
                    });
                }
            }
        }
        startAll();
    };
}());
(function addInput() {
    'use strict';
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style = 'display:none;';
    fileInput.name = 'files';
    fileInput.multiple = true;
}());
function preload() {
    'use strict';
    var i, lvl, j;
    game.load.image('sky', 'assets/sky.png')
        .image('ground', 'assets/platform.png')
        .image('star', 'assets/star.png');
    for (i = 0; i < lvls.length; i += 1) {
        lvl = lvls[i];
        for (j in lvl) {
            if (lvl.hasOwnProperty(j)) {
                if (j === 'sound' && lvl[j] !== 'none') {
                    game.load.audio(lvl[j], 'assets/' + lvl[j]);
                } else if (j === 'icon' && lvl[j] !== 'none') {
                    game.load.image(lvl[j], 'assets/' + lvl[j]);
                } else if (j === 'backdrop' && lvl[j] !== 'none') {
                    game.load.image(lvl[j], 'assets/' + lvl[j]);
                }
            }
        }
    }
}

function parse(n) {
    'use strict';
    var i, ab = lvls[lvl], v, block, txt, img, last = 0, offesets = {
        'H': 29
    };
    if (n) {
        if (ab.icon !== 'none') {
            img = game.add.sprite(40, 300, ab.icon);
        }
        txt = game.add.text(100, 300, ab.name, { fontSize: '32px', fill: '#000' });
        setTimeout(function () { txt.destroy(); img.destroy(); }, 300);
    } else {
        text = game.add.text(100, 300, 'Attempt ' + attempts, { fontSize: '32px', fill: '#000' });
    }
    if (ab.sound !== 'none') {
        sound = game.add.audio(ab.sound);
    }
    if (ab.backdrop === 'none') {
        sky = game.add.tileSprite(0, 0, game.width, game.height, 'sky');
    } else {
        sky = game.add.tileSprite(0, 0, game.width, game.height, ab.backdrop);
    }
    sky.sendToBack();
    for (i = 0; i < ab.blocks.length; i += 1) {
        try {
            v = ab.blocks[i];
            if (u(v) && u(v.x) && u(v.y) && u(v.type)) {
                block = blocks[v.type].create(v.x * 48, (536 - (v.y * 48)) - 48 + (offesets[v.type] || 0), v.type);
                block.body.immovable = true;
                last = Math.max(last, v.x);
            }
        } catch (e) {
            console.log(e);
            console.log('Level failed:', v, 'is badly formed.');
        }
    }
    end = game.add.sprite(game.math.snapToCeil(last * 48, game.width) - 4 * 48, 0, 'end');
    game.world.setBounds(0, 0, game.math.snapToCeil(last * 48, game.width), 600);
    game.physics.arcade.enable(end);
    end.scale.setTo(2, 2);
    end.height = game.height;
    end.body.immovable = true;
}
function unpause() {
    'use strict';
    game.paused = false;
    pauseBackdrop.destroy();
    buttons.start.destroy();
}
function pause() {
    'use strict';
    pauseBackdrop = game.add.image(game.camera.x + 25, 100, 'pause-backdrop');
    pauseBackdrop.alpha = 0.5;
    buttons.start = game.add.button(game.camera.x + 400, 200, 'play', unpause);
    game.paused = true;
}
function create() {
    'use strict';
    var ledge, i;
    cursors = game.input.keyboard.createCursorKeys();
    game.create.texture('p', getFrames('p'), 3, 3, 0);
    game.create.texture('particle', getFrames('button'), 1, 1, 0);
    game.create.texture('end', getFrames('end'), 48, 60, 0);
    game.create.texture('pause', getFrames('pause'), 2, 2, 0);
    game.create.texture('pause-backdrop', getFrames('pause-backdrop'), 100, 100);
    game.create.texture('play', getFrames('start'), 128 / 8, 128 / 7, 0);
    for (i in defBlocks) {
        if (defBlocks.hasOwnProperty(i)) {
            blocks[i] = game.add.group();
            game.create.texture(i, getFrames(i), 3, 3, 0);
            blocks[i].enableBody = true;
        }
    }
    buttons.pause = game.add.button(16, game.width - 16, 'pause', pause);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    parse(attempts === 0);
    ground = game.add.sprite(0, game.world.height - 64, 'ground');
    game.physics.arcade.enable(ground);
    ground.scale.setTo(2, 2);
    ground.width = game.world.width;
    ground.body.immovable = true;
    emitter = game.add.emitter(0, 0, 360);
    if (sound) {
        sound.play();
    }
    player = game.add.sprite(48, game.world.height - 150, 'p');
    game.physics.arcade.enable(player);
    player.body.gravity.y = 6000;
    player.body.collideWorldBounds = true;
    player.y = ground.y - player.body.width;
    game.camera.follow(player);
    keys.jump = game.input.keyboard.addKey(32);
    keys.pause = game.input.keyboard.addKey(80);
    keys.pause.onDown.add(function () {
        if (game.paused) {
            unpause();
        } else {
            pause();
        }
    });
    speed = 300;
}
function die() {
    'use strict';
    var i;
    attempts += 1;
    if (sound) {
        sound.destroy();
    }
    end.destroy();
    for (i in blocks) {
        if (blocks.hasOwnProperty(i)) {
            blocks[i].removeAll();
        }
    }
    sky.destroy();
    sky.tilePosition = new Phaser.Point(0, 0);
    player.destroy();
    player.destroy();
    ground.destroy();
    if (text) {
        text.destroy();
    }
    create();
}
function win() {
    'use strict';
    var i;
    lvl += 1;
    attempts = -1;
    if (lvl >= lvls.length) {
        if (sound) {
            sound.destroy();
        }
        for (i in blocks) {
            if (blocks.hasOwnProperty(i)) {
                blocks[i].removeAll();
            }
        }
        sky.destroy();
        sky.tilePosition = new Phaser.Point(0, 0);
        player.destroy();
        player.destroy();
        ground.destroy();
        end.destroy();
        if (text) {
            text.destroy();
        }
        game.add.text(100, 300, 'You Win', {fill: '#aaafaa'});
        game.camera.target = null;
        game.camera.focusOnXY(0, 0);
        game.paused = true;
    } else {
        die();
    }
    return;
}
function update() {
    'use strict';
    var fn, i;
    //player.body.velocity.x = speed;
    player.body.x += 6;
    sky.tilePosition = new Phaser.Point(sky.tilePosition.x + 3, 0);
    sky.x = game.camera.x;
    game.physics.arcade.collide(player, ground);
    for (i in defBlocks) {
        if (defBlocks.hasOwnProperty(i)) {
            game.physics.arcade.collide(player, blocks[i], defBlocks[i]);
        }
    }
    if (game.physics.arcade.collide(player, end, win)) {
        return;
    }
    if (player.x + player.body.width >= game.world.width) {
        console.log('Win');
        win();
    }
    if ((cursors.up.isDown || keys.jump.isDown) && player.body.touching.down) {
        player.body.velocity.y = -1000;
    }
}
function next(key) {
    'use strict';
    if (!Game.state.checkState(key)) {
        throw new Error('Not valid state!');
    }
    game = Game.state.states[key].game;
    Game.state.start(key);
}
var start = {
    preload: function preload() {
        'use strict';
    },
    create: function create() {
        'use strict';
        game.stage.backgroundColor = '#455589';
        game.create.texture('play', getFrames('start'), 20, 20, 0);
        game.create.texture('edit', getFrames('edit'), 20, 20, 0);
        buttons.start = game.add.button(400, 300, 'play', function () {
            next('play');
        });
        buttons.edit = game.add.button(150, 300, 'edit', function () {
            next('edit');
        });
    },
    update: function update() {
        'use strict';
    }
};
var level, canvas, canvasBG, canvasSprite, canvasGrid, ui, part, xy, isDown, remove, selectedBlock, arrow, colors = {
    'R': '#493C2B',
    'D': '#f00',
    'H': '#faa'
}, blockRegy = {};
function refresh() {
    'use strict';
    var i, color, x, y, v;
    for (i in blockRegy) {
        if (blockRegy.hasOwnProperty(i)) {
            v = i.split(',');
            x = +v[0];
            y = +v[1];
            v = blockRegy[i];
            color = colors[v];
            canvas.rect(x * 48, y * 48, 48, 48, color);
        }
    }
    canvas.dirty = true;
}
function save() {
    'use strict';
    var ab = [], a, lvl = {}, saveText = game.add.text(game.width - 200, game.height - 75, 'Your level has been saved.', {fontSize: 15}), i, v, x, y;
    for (i in blockRegy) {
        if (blockRegy.hasOwnProperty(i)) {
            v = i.split(',');
            x = +v[0];
            y = +v[1];
            v = blockRegy[i];
            ab.push({
                x: x,
                y: y,
                type: v
            });
        }
    }
    console.log('Save', ab);
    lvl.blocks = ab;
    lvl.name = window.prompt('What is the name?');
    lvl.icon = window.prompt('What icon?') || 'none';
    lvl.sound = window.prompt('What sound') || 'none';
    lvl.backdrop = window.prompt('What backdrop?') || 'none';
    console.log('Saving...', lvl);
    a = new XMLHttpRequest();
    a.open('post', 'levels');
    console.log('Sent.', JSON.stringify(lvl, null, 4));
    console.log(JSON.parse(JSON.stringify(lvl)));
    a.send(JSON.stringify(lvl, null, 4));
    a.onreadystatechange = function () {
        if (a.readyState !== 4) {
            return;
        }
        console.log(a.status);
        if (a.status !== 200) {
            window.alert('Unknown error!');
            return;
        }
        console.log('Saved');
        saveText.alpha = 1;
        game.add.tween(saveText).to({ alpha: 0 }, 2000, "Linear", true);
    };
    
}
function selectBlock(type) {
    'use strict';
    selectedBlock = type;
    arrow.x = buttons[type].x;
}
function draw(pointer) {
    'use strict';
    var x = game.math.snapToFloor(pointer.x - canvasSprite.x, 48) / 48,
        y = 9 - game.math.snapToFloor(pointer.y - canvasSprite.y, 48) / 48,
        i,
        v,
        y2;
    if (x < 0 || x >= canvas.width / 48 || y < 0 || y >= canvas.height / 48) {
        return;
    }
    xy.text = 'X: ' + x + ' Y: ' + y;
    y2 = 9 - y;
    x *= 48;
    y = 9 - y;
    y *= 48;
    //console.log(remove);
    if (remove) {
        if (blockRegy[x + ',' + y]) {
            console.log('Delete');
            delete blockRegy[x + ',' + y];
            canvas.rect(x, y, 48, 48, '#3f5c67');
            refresh();
            return;
        }
    } else if (isDown && selectedBlock) {
        console.log(y);
        canvas.rect(x, y, 48, 48, colors[selectedBlock]);
        refresh();
        x /= 48;
        console.log(y2);
        blockRegy[x + ',' + y2] = selectedBlock.charAt(0).toUpperCase();
    }
}
function onDown(pointer) {
    'use strict';
    isDown = true;
    remove = keys.remove.isDown;
    draw(pointer);
}
function onUp(pointer) {
    'use strict';
    isDown = false;
    remove = keys.remove.isDown;
}
function createEventListeners() {
    'use strict';
    keys = Object.assign(game.input.keyboard.addKeys(
        {
            'save': Phaser.Keyboard.S,
            'regular': Phaser.Keyboard.R,
            'death': Phaser.Keyboard.D,
            'half': Phaser.Keyboard.H,
            'remove': Phaser.Keyboard.X
        }
    ), keys);
    keys.save.onDown.add(save);
    keys.regular.onDown.add(selectBlock.bind(window, 'regular'));
    keys.death.onDown.add(selectBlock.bind(window, 'death'));
    keys.half.onDown.add(selectBlock.bind(window, 'half'));
    game.input.mouse.capture = true;
    game.input.onDown.add(onDown);
    game.input.onUp.add(onUp);
    game.input.addMoveCallback(draw);
}
function fileUpload(file) {
    'use strict';
    var reader = new window.FileReader(),
        xhr = new XMLHttpRequest(),
        formData = new window.FormData();
    xhr.open("POST", "fileupload");
    formData.append("thefile", file);
    xhr.send(formData);
}
function makeUI() {
    'use strict';
    buttons.left = game.add.button(50, 300 - 80, 'button-left', function () {
        part -= 1;
        refresh();
    });
    buttons.right = game.add.button(game.width - 50 - 80, 300 - 80, 'button-right', function () {
        part -= 1;
        refresh();
    });
    buttons.regular = game.add.button(100, game.height - 100, 'regular', function () {
        selectBlock('regular');
    });
    buttons.death = game.add.button(175, game.height - 100, 'death', function () {
        selectBlock('death');
    });
    buttons['half-death'] = game.add.button(250, game.height - 100, 'half-death', function () {
        selectBlock('half-death');
    });
    buttons.save = game.add.button(game.width - 60, game.height - 55, 'save', save);
    buttons.choose = game.add.button(game.width - 240, game.height - 55, 'button', function () {
        fileInput.click();
    });
    buttons.upload = game.add.button(game.width - 150, game.height - 55, 'button', function () {
        var files = fileInput.files, i;
        for (i = 0; i < files.length; i += 1) {
            fileUpload(files[i]);
        }
    });
    game.add.text(game.width - 315, game.height - 90, 'Files: Select.\tUpload', {tabSize: 64});
}
var edit = (function edit() {
    'use strict';
    return {
        preload: function preload() {
            document.body.appendChild(fileInput);
        },
        create: function create() {
            game.world.setBounds(0, 0, 10000, 600);
            game.create.texture('button-right', getFrames('button-right'), 10, 10);
            game.create.texture('button-left', getFrames('button-left'), 10, 10);
            game.create.texture('regular', getFrames('regular-select'), 10, 10);
            game.create.texture('arrow', getFrames('arrow'), 10, 10);
            game.create.texture('death', getFrames('death-select'), 10, 10);
            game.create.texture('save', getFrames('save'), 5, 5);
            game.create.texture('button', getFrames('button'), 16, 16);
            game.create.texture('half-death', getFrames('half-death-select'), 10, 10);
            game.create.grid('drawingGrid', Math.floor((game.width - 200) / 48) * 48, Math.floor((game.height - 100) / 48) * 48, 48, 48, 'rgba(0,191,243,0.8)');
            arrow = game.add.sprite(-100, -100, 'arrow');
            arrow.y = game.height - arrow.height - 5;
            canvas = game.make.bitmapData(Math.floor((game.width - 200) / 48) * 48, Math.floor((game.height - 100) / 48) * 48);
            canvasBG = game.make.bitmapData(canvas.width + 2, canvas.height + 2);
            canvasBG.rect(0, 0, canvasBG.width, canvasBG.height, '#fff');
            canvasBG.rect(1, 1, canvasBG.width - 2, canvasBG.height - 2, '#3f5c67');
            xy = game.add.text(10, 10, 'X: 0 Y: 0', {font: 'Monospace', fontSize: 15});
            var x = 100,
                y = 0;
            canvasBG.addToWorld(x, y);
            canvasSprite = canvas.addToWorld(x + 1, y + 1);
            canvasGrid = game.add.sprite(x + 1, y + 1, 'drawingGrid');
            canvasGrid.crop(new Phaser.Rectangle(0, 0, game.width - 150, game.height - 64));
            createEventListeners();
            makeUI();
        },
        update: function update() {
            
        }
    };
}());
startAll = function startAll() {
    'use strict';
    Game = new Phaser.Game(1250, 600, Phaser.AUTO, '', {});
    Game.state.add('play', {preload: preload, create: create, update: update});
    Game.state.add('start', start);
    Game.state.add('edit', edit);
    next('start');
};
defBlocks = {
    'R': function (player, obj) {
        'use strict';
        if (player.y + player.height > obj.y && player.y < obj.y + obj.height) {
            console.log('Death');
            die();
            return;
        }
    },
    'D': die,
    'H': die,
    'J': function () {
        'use strict';
        player.body.velocity.y = -2000;
    }
};