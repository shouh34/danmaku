const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

let player;
let bullets;
const fireRate = 200; // ショットの間隔
let lastFired = 0;

function preload() {
    this.load.image('player', 'path/to/player.png');
    this.load.image('bullet', 'path/to/bullet.png');
}

function create() {
    player = this.physics.add.sprite(400, 500, 'player').setCollideWorldBounds(true);

    // 弾のグループを作成
    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 20
    });

    this.cursors = this.input.keyboard.createCursorKeys();
}

function update(time) {
    // 左右移動
    player.setVelocityX(0);
    if (this.cursors.left.isDown) player.setVelocityX(-200);
    else if (this.cursors.right.isDown) player.setVelocityX(200);

    // ショット発射
    if (this.cursors.space.isDown && time > lastFired) {
        lastFired = time + fireRate;
        fireDoubleShot();
    }
}

// ダブルショット関数
function fireDoubleShot() {
    const speed = -400;
    const offset = 10;

    // 左側の弾
    const leftBullet = bullets.get(player.x - offset, player.y);
    if (leftBullet) {
        leftBullet.setActive(true).setVisible(true);
        leftBullet.body.velocity.y = speed;
    }

    // 右側の弾
    const rightBullet = bullets.get(player.x + offset, player.y);
    if (rightBullet) {
        rightBullet.setActive(true).setVisible(true);
        rightBullet.body.velocity.y = speed;
    }
}
