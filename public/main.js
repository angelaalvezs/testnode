var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: 0xcccccc,  
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
};

var game = new Phaser.Game(config);

var player;
let keyA;
let keyS;
let keyD;
let keyW;
let stopedDirection = 0;
let animRunningDirection = 0;
let remotePlayers = {};
let remotePlayersAnim = {};
let myId;

function preload() {  

    this.load.spritesheet({
        key: 'player_running_down',
        url: 'assets/images/player/player_running_down.png',
        frameConfig: {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 4
        }
    });

    this.load.spritesheet({
        key: 'player_running_up',
        url: 'assets/images/player/player_running_up.png',
        frameConfig: {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 4
        }
    });

    this.load.spritesheet({
        key: 'player_stopped',
        url: 'assets/images/player/player_stopped_sheet.png',
        frameConfig: {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 3
        }
    });

    this.load.spritesheet({
        key: 'player_running_left',
        url: 'assets/images/player/player_running_left.png',
        frameConfig: {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 3
        }
    });
    this.load.spritesheet({
        key: 'player_running_right',
        url: 'assets/images/player/player_running_right.png',
        frameConfig: {
            frameWidth: 32,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 3
        }
    });
}

function create() {
    this.socket = io();

    console.log(this.Math)
    this.socket.on("connect", ()=>{
        console.log("CONNECTED! MY_ID", this.socket.id);
        myId = this.socket.id;        

        //Get All old players in room
        this.socket.on("get_players_in_room", (ids)=>{
            //console.log(ids);
            //onst unpackedDataIds = msgpackr.unpack(ids);
            ids.forEach((id)=>{
                (id == this.socket.id) ? console.log("pass") : remotePlayers[id] = this.add.sprite(0, 0, 'player_running_down', 1).setOrigin(0.5, 0.5);
                (id == this.socket.id) ? console.log("pass") : remotePlayersAnim[id] = {"d": 0, "r": 0};
            });
        })

    });

    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    this.anims.create({
        key: 'running_down',
        frames: this.anims.generateFrameNumbers('player_running_down'),
        frameRate: 7
    });

    this.anims.create({
        key: 'running_up',
        frames: this.anims.generateFrameNumbers('player_running_up'),
        frameRate: 7
    });

    this.anims.create({
        key: 'player_stopped',
        frames: this.anims.generateFrameNumbers('player_stopped'),
        frameRate: 0
    });

    this.anims.create({
        key: 'player_running_left',
        frames: this.anims.generateFrameNumbers('player_running_left'),
        frameRate: 7
    });

    this.anims.create({
        key: 'player_running_right',
        frames: this.anims.generateFrameNumbers('player_running_right'),
        frameRate: 7
    });


    player = this.physics.add.sprite(100, 100, 'player_running_down', 1).setOrigin(0.5, 0.5);
    keys = {"w": 0, "a": 0, "s": 0,  "d": 0};


    //Add new players and remove in quit
    this.socket.on("new_player_enter", (id)=>{
        //console.log("NEW_PLAYER: ", id);
        remotePlayers[id] = this.add.sprite(100, 100, 'player_running_down', 1).setOrigin(0.5, 0.5);
        remotePlayersAnim[id] = {"d": 0, "r": 0};
    });

    this.socket.on("new_player_close", (id)=>{
        //console.log("QUI_PLAYER: ", id);
        remotePlayers[id].destroy();
        delete remotePlayers[id];
        delete remotePlayersAnim[id];
    });

    this.socket.on("player_toggle_running", (data)=>{
        if(data.id != this.socket.id){
            remotePlayersAnim[data.id].r = data.r;
        }
    });
    this.socket.on("player_toggle_running_dir", (data)=>{
        if(data.id != this.socket.id){
            remotePlayersAnim[data.id].d = data.d;
        }
    });

    //DOWN
    keyW.on('down', (event)=>{
        keys.w = 1;
    });
    keyS.on('down', (event)=> {
        keys.s = 1;
    });
    keyA.on('down', (event)=> {
        keys.a = 1;
    });
    keyD.on('down', (event)=>{
        keys.d = 1;
    });

    //RELEASE
    keyW.on('up', (event)=> {
        keys.w = 0;
        player.anims.play("player_stopped", true);
        player.setFrame(1);
        this.socket.emit("toggle_running", 0);
    });
    keyS.on('up', (event)=> {
        keys.s = 0;
        player.anims.play("player_stopped", true);
        player.setFrame(0);
        this.socket.emit("toggle_running", 0);
    });
    keyA.on('up', (event)=> {
        keys.a = 0;
        player.anims.play("player_stopped", true);
        player.setFrame(3);
        this.socket.emit("toggle_running", 0);
    });
    keyD.on('up', (event)=> {
        keys.d = 0;
        player.anims.play("player_stopped", true);
        player.setFrame(2);
        this.socket.emit("toggle_running", 0);
    });

    /*setInterval(()=>{
    }, 1000/30);*/
}

function update(time, delta) {

    player.setVelocity(0);


    if (keys.w) {
        if (keys.a) {
            player.anims.play("player_running_left", true);
            stopedDirection = 2;
            animRunningDirection = 2;
        } else if (keys.d) {
            player.anims.play("player_running_right", true);
            stopedDirection = 1;
            animRunningDirection = 3;
        } else {
            player.anims.play("running_up", true);
            stopedDirection = 0;
            animRunningDirection = 0;
        }
    } else if (keys.s) {
        if (keys.a) {
            player.anims.play("player_running_left", true);
            stopedDirection = 2;
            animRunningDirection = 2;
        } else if (keys.d) {
            player.anims.play("player_running_right", true);
            stopedDirection = 1;
            animRunningDirection = 1;
        } else {
            player.anims.play("running_down", true);
            stopedDirection = 1;
            animRunningDirection = 1;
        }
    } else if (keys.a) {
        player.anims.play("player_running_left", true);
        stopedDirection = 2;
        animRunningDirection = 2;
    } else if (keys.d) {
        player.anims.play("player_running_right", true);
        stopedDirection = 2;
        animRunningDirection = 3;
    }


    if (keyA.isDown) {
        player.setVelocityX(-10 * delta);
    } else if (keyD.isDown) {
        player.setVelocityX(10 * delta);
    }

    if (keyW.isDown) {
        player.setVelocityY(-10 * delta);
    } else if (keyS.isDown) {
        player.setVelocityY(10 * delta);
    }

    if (keys.w && keys.a || keys.w && keys.d || keys.s && keys.a || keys.s && keys.d) {
        player.body.velocity.normalize().scale(150);
    }


    if(keys.w || keys.a || keys.s || keys.d){
        const pos = {"x" : Math.round(player.x), "y" : Math.round(player.y), "id": this.socket.id};
        this.socket.emit("player_pos_update", pos);
        this.socket.emit("toggle_running", 1);
        this.socket.emit("toggle_running_dir", animRunningDirection);
    }

    this.socket.on("player_moved", (data)=>{
        //console.log(new_dat);

        if(data.id != this.socket.id){
            const lerpDuration = 0.02;

            const newX = Phaser.Math.Interpolation.Linear([remotePlayers[data.id].x, data.x], lerpDuration);
            const newY = Phaser.Math.Interpolation.Linear([remotePlayers[data.id].y, data.y], lerpDuration);

            remotePlayers[data.id].setPosition(newX, newY)
            //remotePlayers[data.id].setPosition(data.x, data.y);
        }
    });

    Object.keys(remotePlayersAnim).forEach(id=>{
        if(remotePlayersAnim[id].r){
            if(remotePlayersAnim[id].d == 0){
                remotePlayers[id].anims.play("running_up", true);
            }
            if(remotePlayersAnim[id].d == 1){
                remotePlayers[id].anims.play("running_down", true);
            }
            if(remotePlayersAnim[id].d == 2){
                remotePlayers[id].anims.play("player_running_left", true);
            }
            if(remotePlayersAnim[id].d == 3){
                remotePlayers[id].anims.play("player_running_right", true);
            }
        }else{
            if(remotePlayersAnim[id].d == 0){
                remotePlayers[id].anims.play("player_stopped", true);
                remotePlayers[id].setFrame(1);
            }
            if(remotePlayersAnim[id].d == 1){
                remotePlayers[id].anims.play("player_stopped", true);
                remotePlayers[id].setFrame(0);
            }
            if(remotePlayersAnim[id].d == 2){
                remotePlayers[id].anims.play("player_stopped", true);
                remotePlayers[id].setFrame(3);
            }
            if(remotePlayersAnim[id].d == 3){
                remotePlayers[id].anims.play("player_stopped", true);
                remotePlayers[id].setFrame(2);
            }
        }
    });

}
