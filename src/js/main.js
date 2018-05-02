/*
 * Metroidvavia
 */

var metroidvania = {
  preload: function() {
    assets.forEach(function(asset) {
      if (asset.type === 'spritesheet')
        game.load.spritesheet(asset.name, asset.file, asset.size.w, asset.size.h);
      else if (asset.type === 'image') {
        game.load.image(asset.name, asset.file);
      }
    });
  },
  create: function() {
    //  Scale game to window
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //  Set the background color to blue
    game.stage.backgroundColor = '#000000';
    //  Start the Arcade physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //  Add the physics engine to all game objects
    game.world.enableBody = true;
    //  Image Smoothing
    game.world.smoothed = false;

    //  Player Controls
    this.cursor = game.input.keyboard.createCursorKeys();
    this.left = game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.up = game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.down = game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.right = game.input.keyboard.addKey(Phaser.Keyboard.D);

    /*
     *  this actually makes the game unplayable... for now
     */
    this.cursor.left.onDown.add(this.moveLeft, this);
    this.left.onDown.add(this.moveLeft, this);
    this.cursor.right.onDown.add(this.moveRight, this);
    this.right.onDown.add(this.moveRight, this);

    //  Double tap 'down' to crouch ( must have weaponBall )
    this.cursor.down.onDown.add(this.playerCrouch, this);
    this.down.onDown.add(this.playerCrouch, this);

    //  fire weapon
    this.fire = game.input.keyboard.addKey(Phaser.Keyboard.X);
    this.fire2 = game.input.keyboard.addKey(Phaser.Keyboard.M);
    this.fire.onDown.add(this.fireWeapon, this);
    this.fire2.onDown.add(this.fireWeapon, this);

    //  jump
    this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.jumpButton2 = game.input.keyboard.addKey(Phaser.Keyboard.N);
    this.jumpTimer = 0;
    this.jumpButton.onDown.add(this.playerJump, this);
    this.jumpButton2.onDown.add(this.playerJump, this);

    //  CREATE THE LEVEL
    //  Set the map bounds
    this.boundsOffset = 0; //  used to offset map bounds when moving through doors
    game.world.setBounds(this.boundsOffset, 0, 2304, 240);

    //  Create groups that will contain our objects
    this.doors = game.add.group();
    this.doorways = game.add.group();
    this.walls = game.add.group();
    this.rocks = game.add.group();
    this.energy = game.add.group();
    this.orbs = game.add.group();
    this.enemies = game.add.group();
    this.bats = game.add.group();

    this.buildMap(maps.level_1);

    //  CREATE PLAYER
    //  Create the player
    this.player = game.add.sprite(384, 193, 'player');
    this.player.smoothed = false;
    this.player.anchor.setTo(.5, 1);
    this.player.body.setSize(16,31,8,6);
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    game.camera.follow(this.player);
    this.player.body.collideWorldBounds = true;
    this.player.body.gravity.y = 600;

    //  Player animations
    this.player.animations.add('load',[0],1,true);
    this.player.animations.add('stand',[1],1,true);
    this.playerLeft = this.player.animations.add('left',[2,3,4],20,true);
    this.playerRight = this.player.animations.add('right',[2,3,4],20,true);
    this.player.animations.add('up',[5],1,true);
    this.player.animations.add('runPointUp',[6,7,8],1,true);
    this.player.animations.add('jump',[9],1,true);
    this.player.animations.add('jumpRoll',[10,11,12,13],20,true);
    this.player.animations.add('ball',[14,15,16,17],15,true);

    this.playerLeft.enableUpdate = true;
    this.playerRight.enableUpdate = true;

    //  If player jumping
    this.jumping = false;
    //  If crouching crouching
    this.crouching = false;
    //  Player energy
    this.playerEnergy = 80;

    //  Weapon stash
    this.weaponRapid = false;
    this.weaponBall = false;
    this.weaponBomb = false;
    this.weaponJump = false;

    //  CREATE WEAPON
    //  Default weapon
    this.bulletTime = 0;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 100; i++) {
      var b = this.bullets.create(0, 0, 'bullet');
      b.name = 'bullet' + i;
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.events.onOutOfBounds.add(function(){
        b.kill()
      });
    }
  },
  update: function() {
    //  Make the player collide with walls
    game.physics.arcade.collide(this.player, [this.walls,this.doors,this.rocks]);

    //  Bullets collide with walls and doorways
    game.physics.arcade.collide(this.bullets, [this.walls], this.bulletKill, null, this);

    //  Open doors with bullets
    game.physics.arcade.overlap(this.doors, this.bullets, this.openDoor, null, this);

    //  Bullets break rocks
    game.physics.arcade.overlap(this.rocks, this.bullets, this.breakRock, null, this);

    //  Walk through doors
    game.physics.arcade.overlap(this.player, this.doorways, this.walkThroughDoor, null, this);

    //  Kill enemies
    game.physics.arcade.overlap(this.enemies, this.bullets, this.killEnemy, null, this);

    // Kill bats
    game.physics.arcade.overlap(this.bats, this.bullets, this.killEnemy, null, this);

    //  Pickup energy
    game.physics.arcade.overlap(this.player, this.energy, this.pickupEnergy, null, this);

    //  Pickup weapon
    game.physics.arcade.overlap(this.player, this.orbs, this.pickupWeapon, null, this);

    //  Die and restart
    game.physics.arcade.overlap(this.player, this.enemies, this.killPlayer, null, this);

    //  Die and restart
    game.physics.arcade.overlap(this.player, this.bats, this.killPlayer, null, this);

    //  Move the player
    if (this.cursor.left.isDown || this.left.isDown) {
      if (this.player.body.touching.down && this.crouching === false)
        this.player.play('left');
      else if (this.cursor.up.isDown)
        this.player.play('runPointUp');
      this.player.scale.x = -1;
      this.player.body.velocity.x = -100;
    }
    else if (this.cursor.right.isDown || this.right.isDown) {
      if (this.player.body.touching.down && this.crouching === false)
        this.player.play('right');
      else if (this.cursor.up.isDown)
        this.player.play('runPointUp');
      this.player.scale.x = 1;
      this.player.body.velocity.x = 100;
    }
    else if (this.cursor.up.isDown || this.up.isDown) {
      if(this.crouching){
        this.crouching = false;
        this.player.body.velocity.y = -100;
      }
      this.player.play('up');
    }
    //  Crouching ball spin
    else if (this.crouching) {
      this.player.play('ball');
    }
    else {
      if (this.crouching === false){
        this.jumping = false;
        this.player.body.setSize(16,31,8,6);
        if (game.time.now > this.jumpTimer) {
          this.player.play('stand');
          this.player.body.velocity.x = 0;
        }
      }
    }

    //  Kill jump timer when on the ground. Fixes continuous side to side movement when to landing bug
    if (this.player.body.touching.down) {
      this.jumpTimer = 0;
    }

    if (this.cursor.down.downDuration(250) || this.down.downDuration(250)) {
      // double tap code
      //console.log('hold down');
    }

    //this.yourButton.events.onInputDown.add(this.confirmDoubleClick, this);

    //  Bring objext to the foreground (doorways, overhangs, etc)
    game.world.bringToTop(this.doorways);
  },
  moveLeft: function() {
    this.player.scale.x = -1;
    this.player.body.velocity.x = -100;
  },
  moveRight: function() {
    this.player.scale.x = 1;
    this.player.body.velocity.x = 100;
  },
  playerJump: function() {
    if (game.time.now > this.jumpTimer && this.player.body.touching.down) {

      if ((this.left.isDown || this.cursor.left.isDown) || (this.right.isDown || this.cursor.right.isDown)){
        this.player.play('jumpRoll');
      } else
        this.player.play('jump');

      //console.log('jumping');
      this.jumping = true;
      this.player.body.velocity.y = -310;
      this.jumpTimer = game.time.now + 900;
    }
  },
  playerCrouch: function() {
    if (this.weaponBall === true) {
      if (!this.secondClick) {
        //console.log('single click');
        this.secondClick = true;
        this.time.events.add(300, function() {
          this.secondClick = false;
        },this);
        return;
      }
      //console.log ("double click");
      this.crouching = true;
      this.player.body.setSize(16,16,8,15);
    }
  },
  fireWeapon: function() {
    if (this.crouching === false) {
      if (game.time.now > this.bulletTime) {
        bullet = this.bullets.getFirstExists(false);
        if (bullet) {
          bullet.lifespan = 100;
          bullet.anchor.setTo(0.5, 0.5);
          //  fire up
          if (this.cursor.up.isDown || this.up.isDown) {
            if (this.player.scale.x === 1)
              bullet.reset(this.player.x + 2, this.player.y - 41);
            else
              bullet.reset(this.player.x - 2, this.player.y - 41);

            bullet.body.velocity.y = -400;
          }
          //  fire down ( must be jumping ? )
          else if ((this.cursor.down.isDown || this.down.isDown)){
            if (this.player.body.touching.down === false){
              bullet.reset(this.player.x - 2, this.player.y - 12);
              bullet.body.velocity.y = 400;
            }
          }
          //  fire left
          else if (this.player.scale.x === 1) {
            bullet.reset(this.player.x + 9, this.player.y - 28);
            bullet.body.velocity.x = 400;
          }
          //  fire right
          else if (this.player.scale.x === -1) {
            bullet.reset(this.player.x - 9, this.player.y - 28);
            bullet.body.velocity.x = -400;
          }
          this.bulletTime = game.time.now + 100;
        }
      }
    }
  },
  //  Pickup energy
  pickupEnergy: function(player, energy) {
    energy.kill();
    this.playerEnergy +=  2;
    console.log(this.playerEnergy);
  },
  //  Pickup weapon
  pickupWeapon: function(player, orb) {
    orb.kill();
    this.weaponBall = true;
  },
  //  Kill the player
  killPlayer: function() {
    this.playerEnergy -=  5;
    console.log(this.playerEnergy);
    //  knock player back
    if (this.player.body.touching.right)
      this.player.x -= 10;
    if (this.player.body.touching.left)
      this.player.x += 10;
    //  kill player
    if (this.playerEnergy <= 0)
      game.state.start('metroid');
  },
  //  Kill bullet when it hit walls and doorways
  bulletKill: function(bullet) {
    bullet.kill();
  },
  //  Kill enemies
  killEnemy: function(enemy,bullet) {
    bullet.kill();
    enemy.kill();
  },
  //  Break rocks
  breakRock: function(rock,bullet) {
    bullet.kill();
    rock.kill();
    game.time.events.add(Phaser.Timer.SECOND + 6000, function(){
      console.log('rock rest');
      rock.reset(rock.x,rock.y);
    }, this).autoDestroy = true;
  },
  //  Open door
  openDoor: function(door,bullet) {
    bullet.kill();
    door.kill();
    console.log('door open');
    game.time.events.add(Phaser.Timer.SECOND + 500, function(){
      console.log('door rest');
      door.reset(door.x,door.y);
    }, this).autoDestroy = true;
  },
  //  Traverse doorway
  walkThroughDoor: function() {
    boundsWidth = game.world.bounds.width;
    roomNumber = 0;
    if (this.player.scale.x === 1){
      //this.player.x += 9; //  numdge player through door
      //game.world.setBounds(boundsWidth,0,1024,240);
      this.boundsOffset = this.boundsOffset + boundsWidth;
    }
    else {
      //this.player.x -= 9; //  nudge player through door
      //game.world.setBounds(0,0,1024,240);
      this.boundsOffset = this.boundsOffset - boundsWidth;
    }
    //console.log(this.boundsOffset);
  },
  buildMap: function(level) {
    //  Create the level by going through the array
    for (var i = 0; i < level.length; i++) {
      for (var j = 0; j < level[i].length; j++) {
        //  Create a poll and add it to the 'walls' group
        if (level[i][j] == 's') {
          var slate = game.add.sprite(16*j, 16*i, 'slate');
          slate.body.immovable = true;
          this.walls.add(slate);
        }
        else if (level[i][j] == 'S') {
          var slate2 = game.add.sprite(16*j, 16*i, 'slate2');
          slate2.body.immovable = true;
          this.walls.add(slate2);
        }
        else if (level[i][j] == 'W') {
          var wedge = game.add.sprite(16*j, 16*i, 'wedge');
          wedge.body.immovable = true;
          this.walls.add(wedge);
        }
        else if (level[i][j] == 'w') {
          var wedge2 = game.add.sprite(16*j, 16*i, 'wedge2');
          wedge2.body.immovable = true;
          this.walls.add(wedge2);
        }
        else if (level[i][j] == 'b') {
          var block = game.add.sprite(16*j, 16*i, 'block');
          block.body.immovable = true;
          this.walls.add(block);
        }
        else if (level[i][j] == 'r') {
          var rock = game.add.sprite(16*j, 16*i, 'rock');
          rock.body.immovable = true;
          this.rocks.add(rock);
        }
        else if (level[i][j] == 'g') {
          var ground = game.add.sprite(16*j, 16*i, 'ground');
          ground.body.immovable = true;
          this.walls.add(ground);
        }
        else if (level[i][j] == 'p') {
          var pillar = game.add.sprite(16*j, 16*i, 'pillar');
          pillar.body.immovable = true;
          this.walls.add(pillar);
        }
        else if (level[i][j] == 't') {
          var tube = game.add.sprite(16*j, 16*i, 'tube');
          tube.body.immovable = true;
          this.walls.add(tube);
        }
        else if (level[i][j] == 'T') {
          var tube2 = game.add.sprite(16*j, 16*i, 'tube2');
          tube2.body.immovable = true;
          this.walls.add(tube2);
        }
        else if (level[i][j] == 'a') {
          var aztek = game.add.sprite(16*j, 16*i, 'aztek');
          aztek.body.immovable = true;
          this.walls.add(aztek);
        }
        else if (level[i][j] == 'A') {
          var aztek2 = game.add.sprite(16*j, 16*i, 'aztek2');
          aztek2.body.immovable = true;
          this.walls.add(aztek2);
        }
        else if (level[i][j] == 'P') {
          var pipe = game.add.sprite(16*j, 16*i, 'pipe');
          pipe.body.immovable = true;
          this.walls.add(pipe);
        }
        else if (level[i][j] == '|') {
          var pole = game.add.sprite(16*j, 16*i, 'pole');
          pole.body.immovable = true;
          this.walls.add(pole);
        }
        else if (level[i][j] == 'v') {
          var vent = game.add.sprite(16*j, 16*i, 'vent');
          vent.body.immovable = true;
          this.walls.add(vent);
        }
        //  Create a wall and add it to the 'walls' group
        else if (level[i][j] == 'x') {
          var wall = game.add.sprite(16*j, 16*i, 'wall');
          wall.body.immovable = true;
          this.walls.add(wall);
        }
        else if (level[i][j] == 'D') {
          var door = game.add.sprite(16*j, 16*i, 'door');
          door.body.setSize(32,48,16,0);
          door.body.immovable = true;
          this.doors.add(door);
        }
        else if (level[i][j] == 'E') {
          var door2 = game.add.sprite(16*j, 16*i, 'door2');
          door2.body.setSize(8,48,0,0);
          door2.body.immovable = true;
          this.doors.add(door2);
        }
        else if (level[i][j] == 'd') {
          var doorFrame = game.add.sprite(16*j, 16*i, 'doorFrame');
          doorFrame.bringToTop();
          doorFrame.body.immovable = true;
          this.doorways.add(doorFrame);
        }
        //  Create a coin and add it to the 'coins' group
        else if (level[i][j] == 'o') {
          var life = game.add.sprite(16*j, 16*i, 'life');
          life.animations.add('glow',[0,1],20,true);
          life.play('glow');
          this.energy.add(life);
        }
        else if (level[i][j] == 'O') {
          var orb = game.add.sprite(16*j, 16*i, 'orb');
          orb.animations.add('glow',[0,3],20,true);
          orb.play('glow');
          this.orbs.add(orb);
        }
        //  Enemy
        else if (level[i][j] == '!') {
          var enemy = game.add.sprite(16*j, 16*i, 'enemy');
          this.enemies.add(enemy);
        }
        //  Enemy bug
        else if (level[i][j] == '*') {
          var enemyBug = game.add.sprite(16*j, 16*i, 'enemyBug');
          //enemyBug.anchor.setTo(.5, .5);
          enemyBug.animations.add('wiggle',[0,1],10,true);
          enemyBug.play('wiggle');
          this.enemies.add(enemyBug);
        }
        //  Enemy bat
        else if (level[i][j] == '^') {
          var enemyBat = game.add.sprite(16*j, 16*i, 'enemyBat');
          //enemyBug.anchor.setTo(.5, .5);
          enemyBat.animations.add('fly',[0,1,2,3],5,true);
          enemyBat.play('fly');
          this.bats.add(enemyBat);
        }
        //  fire (enemy group)
        else if (level[i][j] == 'f') {
          var fire = game.add.sprite(16*j, 16*i, 'fire');
          this.enemies.add(fire);
        }
      }
      this.bats.setAll('body.velocity.x', -50);
    }
  },
  render: function() {
    //game.debug.spriteInfo(this.player, 32, 32);
    //game.debug.body(this.player, 'rgba(173,255,47,0.5)');
    //this.walls.forEachAlive(this.renderGroup, this, 'rgba(255, 0, 0, 0.2)');
    //this.doors.forEachAlive(this.renderGroup, this, 'rgba(0, 216, 255, 0.41)');
    //this.doorways.forEachAlive(this.renderGroup, this, 'rgba(0, 118, 255, 0.2)');
    //this.enemies.forEachAlive(this.renderGroup, this, 'rgba(255, 0, 186, 0.2)');
    //this.rocks.forEachAlive(this.renderGroup, this, 'rgba(255, 108, 0, 0.5)');
  },
  renderGroup: function(group,color) {
    game.debug.body(group,color);
  }
};
