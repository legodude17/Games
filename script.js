/*jslint browser:true*/
/*global console, getFrame, Phaser, Hitbox*/
/*
            this.solid='solid'; // Walls
            this.solid='meh'; //Player objects, items, pushable objects that you can still move through
            this.solid=false; //Clouds, entirely non-soild objects, attacking hitboxes
            
            this.atk=false;
            this.atk='fire';
            this.atk='acid';
            this.atk='atk';
            
            this.dam = -1 //Not damageable (attacks)
            this.dam = 1 //Damage
            
            this.item = null;
            this.item = 'bomb';
            // More items will be added
        */
var player, enemies, Game, game, bullets, speed = 10;
var play, states = {}, keys, func, canMove = true, spaceDown = true, enemy, ATTACKS = {
    left: {
        x: -16,
        y: 11,
        w: 16,
        h: 9,
        angle: 200
    },
    right: {
        x: 32,
        y: 11,
        w: 16,
        h: 9,
        angle: -20
    }
};
function next(key) {
    'use strict';
    if (!Game.state.checkState(key)) {
        throw new Error('Not valid state!');
    }
    game = Game.state.states[key].game;
    Game.state.start(key);
}
function amountTrue() {
    'use strict';
    var args = Array.from(arguments),
        num = args.pop(),
        i,
        count = 0;
    for (i = 0; i < args.length; i += 1) {
        if (args[i]) {
            count += 1;
        }
    }
    return (num === count);
}
function attack(player, dir, type, power) {
    'use strict';
    var atk = ATTACKS[dir], atkbox;
    if (!atk) {
        return;
    }
    atkbox = game.add.hitbox(player.x + atk.x, player.y + atk.y, atk.w, atk.h, null, {
        type: 'attack',
        angle: atk.angle,
        pow: power,
        orgin: player
    });
    player.stop('x');
    player.setSkin(dir + type + 'attack');
    canMove = false;
    setTimeout(function () {player.setSkin('p'); canMove = true; atkbox.destroy(); }, 100);
}
function playerUpdate(player, dir, atk) {
    'use strict';
    if (atk) {
        attack(player, dir, atk, 200);
    }
    if (dir === 'many' || dir === 'nuetral') {
        player.stop('x');
    } else {
        if (canMove) {
            player.move(dir, 200);
        } else {
            player.stop('x');
        }
    }
    if (keys.jump.isDown && canMove) {
        if (player.getBody(true).touching.down) {
            player.jump(500);
        } else if (player.airJumps > 0 && !spaceDown) {
            player.jump(500);
            player.airJumps -= 1;
        }
        spaceDown = true;
    } else {
        spaceDown = false;
    }
    if (player.getBody(true).touching.down) {
        player.airJumps = player.defaultAirJumps;
    }
}
(function defineStates() {
    'use strict';
    states.play = {
        preload: function () {
            game.load.image('p', 'assets/Josh Tecture.png')
                .image('rightlightattack', 'assets/Attacks/RightLightAttack.png')
                .image('leftlightattack', 'assets/Attacks/LeftLightAttack.png')
                .image('uplightattack', 'assets/Attacks/UpLightAttack.png');
        },
        create: function () {
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.create.texture('death', [
                '4.8.B.E..E.B.8.4',
                '4.8.B.EEEE.B.8.4',
                '4.8.B..EE..B.8.4',
                '4.8.B..EE..B.8.4',
                '4.8.BB.EE.BB.8.4',
                '4.8..B....B..8.4',
                '4.88..BBBB..88.4',
                '4..88..BB..88..4',
                '44..88....88..44',
                '.44..88..88..44.',
                '..44..8888..44..',
                '...44..88..44...',
                '....44.88.44....',
                '.....448844.....',
                '......4444......',
                '.......44.......'
            ], 4, 4);
            game.stage.backgroundColor = '#bbbbaa';
            player = game.add.hitbox(600, 100, 32, 32, 'p', {
                type: 'player',
                grav: 1000,
                lives: 3,
                airJumps: 2,
                offset: new Phaser.Point(-16, -32)
            });
            enemy = game.add.hitbox(700, 100, 32, 32, 0xFF0000, {
                type: 'player',
                grav: 1000,
                airJumps: 0,
                offset: new Phaser.Point(0, 0),
                drag: new Phaser.Point(10, 0)
            });
            game.add.hitbox(400, 150, 600, 50, 0xFFFFFF, {
                type: 'wall'
            });
            keys = game.input.keyboard.addKeys({
                'up': Phaser.Keyboard.W,
                'jump': Phaser.Keyboard.SPACEBAR,
                'left': Phaser.Keyboard.A,
                'right': Phaser.Keyboard.D,
                'down': Phaser.Keyboard.S,
                'light': Phaser.Keyboard.J
            });
        },
        update: function () {
            var dir, attack;
            if (keys.right.isDown) {
                dir = 'right';
            }
            if (keys.left.isDown) {
                dir = 'left';
            }
            if (keys.up.isDown) {
                dir = 'up';
            }
            if (keys.down.isDown) {
                dir = 'down';
            }
            if (!amountTrue(keys.down.isDown, keys.up.isDown, keys.left.isDown, keys.right.isDown, 1)) {
                if (keys.down.isDown || keys.up.isDown || keys.left.isDown || keys.right.isDown) {
                    dir = 'many';
                } else {
                    dir = 'nuetral';
                }
            }
            game.hitboxes.updateAll(true);
            if (keys.light.isDown && dir !== 'many' && player.getBody(true).touching.down) {
                attack = 'light';
            }
            playerUpdate(player, dir, attack);
        }
    };
}());
var i;
Game = new Phaser.Game(1250, 600, Phaser.Auto);
for (i in states) {
    if (states.hasOwnProperty(i)) {
        Game.state.add(i, states[i]);
    }
}
next('play');