function buildMap(level) {
  for (var i = 0; i < level.length; i++) {
    for (var j = 0; j < level[i].length; j++) {
      //  Walls (immovable)
      if (level[i][j] == 's') {
        walls.create(tileSize * j, tileSize * i, 'slate');
      }
      else if (level[i][j] == 'S') {
        walls.create(tileSize * j, tileSize * i, 'slate2');
      }
      else if (level[i][j] == 'W') {
        walls.create(tileSize * j, tileSize * i, 'wedge');
      }
      else if (level[i][j] == 'w') {
        walls.create(tileSize * j, tileSize * i, 'wedge2');
      }
      else if (level[i][j] == 'b') {
        walls.create(tileSize * j, tileSize * i, 'block');
      }
      else if (level[i][j] == 'g') {
        walls.create(tileSize * j, tileSize * i, 'ground');
      }
      else if (level[i][j] == 'p') {
        walls.create(tileSize * j, tileSize * i, 'pillar');
      }
      else if (level[i][j] == 't') {
        walls.create(tileSize * j, tileSize * i, 'tube');
      }
      else if (level[i][j] == 'T') {
        walls.create(tileSize * j, tileSize * i, 'tube2');
      }
      else if (level[i][j] == 'a') {
        walls.create(tileSize * j, tileSize * i, 'aztek');
      }
      else if (level[i][j] == 'A') {
        walls.create(tileSize * j, tileSize * i, 'aztek2');
      }
      else if (level[i][j] == 'P') {
        walls.create(tileSize * j, tileSize * i, 'pipe');
      }
      else if (level[i][j] == '|') {
        walls.create(tileSize * j, tileSize * i, 'pole');
      }
      else if (level[i][j] == 'v') {
        walls.create(tileSize * j, tileSize * i, 'vent');
      }
      else if (level[i][j] == 'x') {
        walls.create(tileSize * j, tileSize * i, 'wall');
      }
      // Rocks (breakable | immovable)
      else if (level[i][j] == 'r') {
        rocks.create(tileSize * j, tileSize * i, 'rock');
      }
      // Rocks (opens | immovable)
      else if (level[i][j] == 'D') {
        doors.create(tileSize * j, tileSize * i, 'door');
        // door.body.setSize(32,48,16,0);
      }
      else if (level[i][j] == 'E') {
        doors.create(tileSize * j, tileSize * i, 'door2');
        // door2.body.setSize(8,48,0,0);
      }
      else if (level[i][j] == 'd') {
        doorways.create(tileSize * j, tileSize * i, 'doorFrame');
        // doorFrame.bringToTop();
      }
      else if (level[i][j] == 'o') {
        energy.create(tileSize * j, tileSize * i, 'life');
        // life.animations.add('glow',[0,1],20,true);
        // life.play('glow');
      }
      else if (level[i][j] == 'O') {
        orbs.create(tileSize * j, tileSize * i, 'orb');
      }
      //  Enemy
      else if (level[i][j] == '!') {
        enemies.create(tileSize * j, tileSize * i, 'enemy');
      }
      //  Enemy bug
      else if (level[i][j] == '*') {
        enemies.create(tileSize * j, tileSize * i, 'enemyBug');
        //enemyBug.anchor.setTo(.5, .5);
        // enemyBug.animations.add('wiggle',[0,1],10,true);
        // enemyBug.play('wiggle');
      }
      //  Enemy bat
      else if (level[i][j] == '^') {
        bats.create(tileSize * j, tileSize * i, 'enemyBat');
        //enemyBug.anchor.setTo(.5, .5);
        // enemyBat.animations.add('fly',[0,1,2,3],5,true);
        // enemyBat.play('fly');
      }
      //  fire (enemy group)
      else if (level[i][j] == 'f') {
        enemies.create(tileSize * j, tileSize * i, 'fire');
      }
    }
  }
}
