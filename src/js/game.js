/*
 * MeTRoiDVaNiA Phaser.io Game
 * Author: Phil Sanders (philsanders79@gmail.com)
 */

var config = {
    type: Phaser.AUTO,
    width: 256,
    height: 240,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 600 },
        debug: true
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
};

var boundsOffset = 0;
var cursors;
var player;
var doors;
var doorways;
var walls;
var rocks;
var energy;
var orbs;
var enemies;
var bats;
var jumping = false;
var jumpTimer = 0;
var crouching = false;
var playerEnergy = 80;
var weaponBall = false;
var tileSize = 16;
var game = new Phaser.Game(config);

function preload () {
  this.load.setBaseURL('../');
  assets.forEach(function(asset) {
    if (asset.type === 'spritesheet') {
      this.load.spritesheet(asset.name, asset.file, {
        frameWidth: asset.size.w, frameHeight: asset.size.h
      });
    }
    else if (asset.type === 'image') {
      this.load.image(asset.name, asset.file);
    }
  }, this);
}

function create () {
  // map
  doors  = this.physics.add.staticGroup();
  doorways  = this.add.group();
  walls = this.physics.add.staticGroup();
  rocks  = this.physics.add.staticGroup();
  energy  = this.add.group();
  orbs  = this.physics.add.group();
  enemies  = this.add.group();
  bats  = this.add.group();
  buildMap(maps.level_1);

  // player
  player = this.physics.add.sprite(384, 144, 'player');
  player.setSize(16, 31, 8, 6);
  player.setOrigin(0.5, 0.5);
  player.setBounce(0);
  player.setCollideWorldBounds(false);

  // physics
  this.physics.add.collider(player, walls);
  this.physics.add.collider(player, rocks);
  this.physics.add.collider(player, doors);
  this.physics.add.collider(orbs, walls);
  this.physics.add.overlap(player, orbs, pickupWeapon, null, this);

  // animations
  this.anims.create({
    key: 'idle',
    frames: [ { key: 'player', frame: 1 } ],
    frameRate: 1
  });
  this.anims.create({
    key: 'jump',
    frames: [ { key: 'player', frame: 9 } ],
    frameRate: 1,
  });
  this.anims.create({
    key: 'jumpRoll',
    frames: this.anims.generateFrameNumbers('player', { start: 10, end: 13 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 2, end: 4 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 2, end: 4 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'orb_glow',
    frames: this.anims.generateFrameNumbers('orb', { start: 0, end: 3 }),
    frameRate: 20,
    repeat: -1
  });
  orbs.children.iterate(function (orb) {
    orb.anims.play('orb_glow');
  });
  // bats.children.iterate(function (bat) {
  //   bat.velocity.x = -50;
  // });

  // input controls
  cursors = this.input.keyboard.createCursorKeys();
  this.key_Z = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  this.key_X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

  // cameras
  this.cameras.main.setBounds(boundsOffset, 0, 2304, 240);
  this.cameras.main.startFollow(player);

  console.log(player);
}

function update (time, delta) {

  // console.log(time);

  if (cursors.left.isDown) {
    player.setVelocityX(-100);
    player.flipX = true;
    player.anims.play('left', true);
    if (this.key_Z.isDown) {
      playerJumpRoll(time);
    }
  }
  else if (cursors.right.isDown) {
    player.setVelocityX(100);
    player.flipX = false;
    player.anims.play('right', true);
    if (this.key_Z.isDown) {
      playerJumpRoll(time);
    }
  }
  else if (this.key_Z.isDown) {
    jumpTimer = time + 900;
    if (time > jumpTimer) {
      player.setVelocityY(0);
      player.play('idle');
      jumpTimer = 0;
    }
    else {
      playerJump(time);
    }
  }
  else {
    player.setVelocityX(0);
    player.anims.play('idle');
  }

  if (player.body.touching.down) {
    jumpTimer = 0;
    jumping = false;
  }
}

function playerJump(time) {
  player.setVelocityY(-330);
  player.anims.play('jump', true);
  jumping = true;
  console.log('jump', time);
}

function playerJumpRoll(time) {
  player.setVelocityY(-330);
  player.anims.play('jumpRoll', true);
  jumping = true;
  console.log('jump roll', time);
}

function pickupWeapon (player, orb) {
  orb.disableBody(true, true);
  weaponBall = true;
  console.log('weapon: ball');
}
