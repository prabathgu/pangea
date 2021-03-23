
const continents = ['north_america', 'eurasia', 'india', 'south_america', 'africa', 'antarctica', 'australia' ];

var selected // The currently selected piece
var rotator // The rotation widget

var isMoving // Set to true when a piece is moved
var isBackgroundClick // Set to true when user clicks on the clear background

class Title extends Phaser.Scene {
    constructor() {
        super('title');
    }

    preload () {
        this.load.image('title', 'title.png');
    }

    create() {
        let { width, height } = this.sys.game.canvas;
        this.add.image(width/2, height/2, 'title');
    
        
        console.log('Hello');
        
        new Bubble(this, width / 2 - 150, height / 2 + 150, '  Click to Begin  ').setCallback(() => {
            this.scene.start('game');
        })
    }
}

class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }

    preload () {
        this.load.image('fossil_key', 'fossil_key.png');
        this.load.image('rotator', 'rotate.png');
        continents.forEach(continent => {
            this.load.image(continent, continent + '.png');
        })
    }

    create () {
        let { width, height } = this.sys.game.canvas;
        let fossil_key = this.add.image(width/2, height-100, 'fossil_key');
        let scale = 0.75;
        fossil_key.displayWidth = scale * (width - 300);
        fossil_key.displayHeight = scale * fossil_key.height * (width - 300) / fossil_key.width;

        let x = 100, y = 250;
        continents.forEach(continent => {
            let image = this.add.sprite(0, y, continent).setInteractive({
                useHandCursor: true, pixelPerfect: true, draggable: true });

            // Position it relative to the previous x position
            x += image.displayWidth/2;
            image.x = x;

            image.on('pointerover',function(pointer){
                if (!rotator.visible) {
                    image.tint = 0.5 * 0xffffff;
                }
            });
            image.on('pointerout',function(pointer){
                if (!rotator.visible) {
                    image.tint = 0xffffff;
                }
            });
            image.on('pointerdown',function(pointer){
                if (selected && selected!=image) {
                    selected.tint = 0xffffff;
                }
                selected = image;
                selected.tint = 0.5 * 0xffffff;
                this.children.bringToTop(selected);
                isMoving = false;
                rotator.setVisible(false);
                isBackgroundClick = false;
            }, this);
            image.on('pointerup',function(pointer){
                isBackgroundClick = false;
                if (!isMoving) {
                    let radius = Math.min(selected.height, selected.width)*2/3;
                    rotator.x = selected.x + Math.cos(selected.rotation - Math.PI/2) * radius;
                    rotator.y = selected.y + Math.sin(selected.rotation - Math.PI/2) * radius;
                    rotator.setRotation(selected.rotation);
                    rotator.setVisible(true);
                    this.children.bringToTop(rotator);
                }
            }, this);

            x += image.displayWidth/2 + 30;
            if (x >= width - 200) {
                y += 300;
                x = 100;
            }
        });

        //  The pointer has to move 16 pixels before it's considered as a drag
        this.input.dragDistanceThreshold = 16;

        this.input.on('dragstart', function (pointer, gameObject) {
            if (gameObject != rotator) {
                isMoving = true;
            }
        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if (gameObject == rotator) {
                // Phaser uses rh clockwise rotation (0 = right) so offset by Math.PI/2
                let angleRad = Phaser.Math.Angle.Between(selected.x, selected.y, dragX, dragY) + Math.PI/2;
                selected.setRotation(angleRad);
                rotator.setRotation(angleRad);
                let radius = Math.min(selected.height, selected.width)*2/3;
                rotator.x = selected.x + Math.cos(selected.rotation - Math.PI/2) * radius;
                rotator.y = selected.y + Math.sin(selected.rotation - Math.PI/2) * radius;
            } else {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
        });

        this.input.on('dragend', function (pointer, gameObject) {
            if (gameObject == rotator) {
                isBackgroundClick = false;
            }
        });

        rotator = this.add.sprite(0, 0, 'rotator').setInteractive(
            {useHandCursor: true, pixelPerfect: true, draggable: true });
        rotator.setVisible(false);
        rotator.on('pointerdown',function(pointer){
            isBackgroundClick = false;
        });
        rotator.on('pointerup',function(pointer){
            isBackgroundClick = false;
        });

        this.input.on('pointerdown', function(pointer){
            isBackgroundClick = true;
        });
        this.input.on('pointerup', function(pointer){
            if (isBackgroundClick) {
                if (selected) {
                    selected.tint = 0xffffff;
                    selected = null;
                }
                rotator.setVisible(false);
            }
        });

        isMoving = false;
        isBackgroundClick = false;
    }
    
}

let config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        width: 1405,
        height: 900
    },
    backgroundColor: '#FFFFFF',
    scene: [Title, Game]
};

let game = new Phaser.Game(config);
