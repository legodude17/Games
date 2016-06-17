/*global Phaser, console*/
Function.prototype.method = function (name, fn) {
    'use strict';
    this.prototype[name] = fn;
};
var Hitbox = function (game, x, y, w, h, key, obj) {
    'use strict';
    this.game = game;
    this.x = x;
    this.y = y;
    this.orgin = new Phaser.Point(x, y);
    this.width = w;
    this.height = h;
    this.hitStun = false;
    if (obj.type !== undefined) {
        this.type = obj.type;
        switch (this.type) {
        case 'attack':
            this.atk = obj.atk;
            obj.color = '#f00';
            this.dam = -1;
            this.pow = obj.pow;
            this.angle = obj.angle;
            this.orgin = obj.orgin;
            this.touching = [];
            break;
        case 'wall':
            this.solid = true;
            obj.color = '#000';
            this.dam = obj.damagable ? 0 : -1;
            break;
        case 'player':
            this.solid = false;
            obj.color = '#0f0';
            this.dam = 0;
            this.lives = obj.lives;
            this.defaultAirJumps = this.airJumps = obj.airJumps || 0;
            break;
        case 'item':
            this.solid = 'meh';
            obj.color = '#aaa';
            this.item = obj.item;
            this.dam = -1;
            break;
        }
    }
    this.color = obj.color;
    this.key = key;
    this.grav = obj.grav;
    this.offset = obj.offset || new Phaser.Point(0, 0);
    if (game.hitboxes) {
        this.pos = game.hitboxes.length;
        game.hitboxes.push(this);
    } else {
        this.pos = 0;
        game.hitboxes = [this];
        game.hitboxes.forAll = function (fn) {
            var i;
            for (i = 0; i < game.hitboxes.length; i += 1) {
                fn(game.hitboxes[i], i);
            }
        };
        game.hitboxes.destroyAll = function () {
            game.hitboxes.forAll(function (v) {v.destroy(); });
        };
        game.hitboxes.updateAll = function (pos) {
            game.hitboxes.forAll(function (v, i) {
                if (!v.body.alive) {
                    game.hitboxes.splice(i, 1);
                }
                v.update(pos);
            });
        };
        game.hitboxes.destroyAllOf = function (type) {
            game.hitboxes.forAll(function (v) {
                if (v.type === type) {
                    v.destroy();
                }
            });
        };
        game.hitboxes.showAll = function (i) {
            game.hitboxes.forAll(function (v) {v.show(i); });
        };
        game.hitboxes.hideAll = function () {
            game.hitboxes.forAll(function (v) {v.hide(); });
        };
    }
    this.create();
    Object.defineProperties(this, {
        x: {
            get: function () {
                return this.body.x;
            }.bind(this),
            set: function (v) {
                return (this.body.x = v);
            }.bind(this)
        },
        y: {
            get: function () {
                return this.body.y;
            }.bind(this),
            set: function (v) {
                return (this.body.y = v);
            }.bind(this)
        }
    });
    this.velocity = {};
    Object.defineProperties(this.velocity, {
        x: {
            get: function () {
                return this.body.body.velocity.x;
            }.bind(this),
            set: function (v) {
                return (this.body.body.velocity.x = v);
            }.bind(this)
        },
        y: {
            get: function () {
                return this.body.body.velocity.y;
            }.bind(this),
            set: function (v) {
                return (this.body.body.velocity.y = v);
            }.bind(this)
        }
    });
};
Hitbox.renderBodies = false;
Hitbox.method('create', function () {
    'use strict';
    if (this.skin) {
        this.skin.destroy();
    }
    if (this.body) {
        this.body.destroy();
    }
    if (this.key && (typeof this.key === 'object' || typeof this.key === 'string')) {
        this.skin = this.game.add.image(this.x + this.offset.x, this.y + this.offset.y, this.key);
    } else if (this.key && typeof this.key === 'number') {
        this.skin = this.game.add.graphics(this.x + this.offset.x, this.y + this.offset.y);
        this.skin.beginFill(this.key, 1);
        this.skin.drawRect(0, 0, this.width, this.height);
    }
    var texture = this.game.make.bitmapData(this.width, this.height, null, false);
    texture.rect(0, 0, this.width, this.height, this.color);
    this.body = this.game.add.sprite(this.x, this.y, texture);
    this.game.physics.arcade.enable(this.body);
    this.body.renderable = Hitbox.renderBodies;
    this.body.alpha = 0.5;
    if (this.type === 'player') {
        this.body.checkWorldBounds = true;
        this.body.events.onOutOfBounds.add(function () {
            this.dam = 0;
            var img;
            if (this.x < 0) {
                img = this.game.add.image(this.x, 0, 'death');
                img.angle = 90;
                img.x = 64;
                img.y = this.y - 64;
            } else if (this.x + this.body.width > this.game.width) {
                img = this.game.add.image(this.x, this.game.height - 64, 'death');
                img.angle = -90;
                img.x = this.game.width - img.height;
                img.y = this.y + 64;
            } else if (this.y < 0) {
                img = this.game.add.image(this.x, this.game.height, 'death');
                img.angle = 180;
                img.x += 64;
                img.y = 64;
            } else if (this.y + this.body.height > this.game.height) {
                img = this.game.add.image(this.x, this.game.height - 64, 'death');
            }
            if (this.skin) {
                this.skin.renderable = false;
            }
            setTimeout(function () {
                img.destroy();
                this.x = this.orgin.x;
                this.y = this.orgin.y;
                this.velocity.x = 0;
                this.velocity.y = 0;
                this.skin.renderable = true;
            }.bind(this), 100);
        }.bind(this));
    } else if (this.type === 'wall') {
        this.getBody(true).immovable = true;
    }
    this.body.body.gravity.y = this.grav || 0;
});
Hitbox.method('show', function (show) {
    'use strict';
    this.body.renderable = !show;
});
Hitbox.method('hide', function () {
    'use strict';
    this.show(true);
});
Hitbox.method('update', function (pos) {
    'use strict';
    if (this.skin) {
        this.skin.x = this.body.x + this.offset.x;
        this.skin.y = this.body.y + this.offset.y;
    }
    if (this.type === 'player') {
        this.collide();
    } else if (this.type === 'attack') {
        this.game.hitboxes.forAll(function (hitbox) {
            if (hitbox.type === 'player' && this.touches(hitbox) && hitbox !== this.orgin) {
                if (!this.touching.includes(hitbox)) {
                    hitbox.knockback(this.angle > 0 ? 90 - this.angle : -90 - this.angle, this.pow * (Math.sqrt(hitbox.dam) + 1));
                    hitbox.dam += this.pow / 2;
                    this.touching.push(hitbox);
                } else {
                    var i;
                    for (i = 0; i < this.touching.length; i += 1) {
                        if (this.touching[i] === hitbox) {
                            this.touching.splice(0, 1);
                            return;
                        }
                    }
                }
            }
        }.bind(this));
    }
    if (pos) {
        this.updatePos();
    }
});
Hitbox.method('getBody', function (body) {
    'use strict';
    if (body) {
        return this.body.body;
    }
    return this.body;
});
Hitbox.method('destroy', function () {
    'use strict';
    this.game.hitboxes.splice(this.pos, 1);
    this.body.destroy();
    if (this.skin) {
        this.skin.destroy();
    }
});
Hitbox.method('updatePos', function () {
    'use strict';
    var i;
    for (i = 0; i < this.game.hitboxes.length; i += 1) {
        if (this.game.hitboxes[i] === this) {
            this.pos = i;
            return;
        }
    }
});
Hitbox.method('touches', function (other) {
    'use strict';
    if (!(this.getBody(true) && other.getBody(true))) {
        return false;
    }
    return this.game.physics.arcade.intersects(this.getBody(true), other.getBody(true));
});
Hitbox.method('collide', function () {
    'use strict';
    this.game.hitboxes.forAll(function (v) {
        if (v.solid) {
            this.game.physics.arcade.collide(this.getBody(), v.getBody());
        }
    }.bind(this));
});
Hitbox.method('jump', function (v) {
    'use strict';
    if (!this.hitStun) {
        this.velocity.y = -v;
    }
});
Hitbox.method('move', function (dir, v, stop) {
    'use strict';
    if (this.hitStun) {
        return;
    }
    if (dir === 'right') {
        this.velocity.x = v;
    } else if (dir === 'left') {
        this.velocity.x = -v;
    }
});
Hitbox.method('stop', function (t) {
    'use strict';
    if (this.hitStun) {
        return;
    }
    if (t === 'x') {
        this.velocity.x = 0;
    } else if (t === 'y') {
        this.velocity.y = 0;
    } else {
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
});
Hitbox.method('setSkin', function (key) {
    'use strict';
    this.key = key;
    this.create();
});
Hitbox.method('knockback', function (angle, amount) {
    'use strict';
    this.hitStun = true;
    this.getBody(true).velocity = this.game.physics.arcade.velocityFromAngle(angle, amount);
    setTimeout(function () {this.hitStun = false; }.bind(this), amount * 10);
});
Phaser.GameObjectFactory.method('hitbox', function (x, y, w, h, key, obj) {
    'use strict';
    return new Hitbox(this.game, x, y, w, h, key, obj);
});