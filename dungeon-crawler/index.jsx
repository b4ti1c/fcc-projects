const CellSize = 10;
const MapSize = 75;

class EventManager {
    constructor() {
        this.objects = [];
        this.objectsByName = {};
        this.creatures = [];
        this.hud = null;
        this.pickups = [];
    }

    randomName() {
        return 'abcdefghjkilmnoprsqtuvwxyz'.split('').sort(_ => Math.random() > 0.5).slice(-8).join('');
    }

    getObjects() {
        return Object.keys(this.objects).map(ident => this.objects[ident]);
    }

    register(obj) {
        this.objects.push(obj);

        setTimeout(() => {
            if (obj.name) {
                this.creatures.push(obj);

                if (!this.objectsByName[obj.name]) this.objectsByName[obj.name] = [];
                this.objectsByName[obj.name].push(obj);
            }

            if (obj.type == 'pickup')
                this.pickups.push(obj);
        }, 0);
    }

    unregister(obj) {
        this.objects = this.objects.filter(object => object != obj);

        if (obj.name && this.objectsByName[obj.name])
            delete this.objectsByName[obj.name]
    }

    dispatch(eventName, opt_name, ...params) {
        this.objects
            .filter(obj => opt_name ? opt_name == obj.name : true)
            .forEach(obj => obj[eventName] && obj[eventName](...params));
    }

    dispatchByName(eventName, name, ...params) {
        this.objectsByName[name].forEach(obj => obj[eventName] && obj[eventName](...params));
    }
}

const EM = new EventManager();

class PlayerManager {
    constructor() {}

    register(player) { this.player = player; }
    get(prop) { return this.player[prop]; }

    getTop() { return this.player.top; }
    getLeft() { return this.player.left; }
    getVision() { return this.player.vision; }
    getSize() { return this.player.size };
}

const PM = new PlayerManager();

class GameManager {
    getWalls() {
        return EM.objects
            .filter(obj => !obj.name)
            .filter(cell => {
                return cell instanceof Wall;
            });
    }

    getPickups() {
        return EM.pickups.filter(pickup => !pickup.state.used);
    }

    getAllCreatures() {
        return EM.objects.filter(obj => !!obj.name);
    }

    getNearbyCreatures(self) {
        return this
            .getAllCreatures()
            .filter(creature => creature != self)
            .filter(creature => {
                const dX = Math.pow((self.state.top + self.size / 2) - (creature.state.top + creature.size / 2), 2);
                const dY = Math.pow((self.state.left + self.size / 2) - (creature.state.left + creature.size / 2), 2);
                const vision = Math.pow(self.vision * CellSize + (creature.size / 2), 2);
                
                const canSee = dX + dY < vision;
                return canSee;
            });
    }

    getCreaturesInAttackingRange(self) {
        return this.getNearbyCreatures(self).filter(creature => {
            const dX = Math.pow((self.state.top + self.size / 2) - (creature.state.top + creature.size / 2), 2);
            const dY = Math.pow((self.state.left + self.size / 2) - (creature.state.left + creature.size / 2), 2);
            const attackRange = Math.pow(self.range * CellSize + (creature.size / 2), 2);

            const canAttack = dX + dY <= attackRange;
            return canAttack;
        });
    }

    getOtherCreatures(self) {
        let creatures = {
            self: self,
            all: [],
            canSee: [],
            canAttack: []
        };

        EM.creatures.forEach(creature => {
            if (!creature.name) return;
            if (creature == self) return;
            creatures.all.push(creature);

            if (creature.dead) return;

            const dX = Math.pow((self.state.top + self.size / 2) - (creature.state.top + creature.size / 2), 2);
            const dY = Math.pow((self.state.left + self.size / 2) - (creature.state.left + creature.size / 2), 2);
            const vision = Math.pow(self.vision * CellSize + (creature.size / 2), 2);
            const attackRange = Math.pow(self.range * CellSize + (creature.size / 2), 2);

            if (dX + dY < vision) creatures.canSee.push(creature);
            if (dX + dY <= attackRange) creatures.canAttack.push(creature);
        });

        return creatures;
    }

    playerMove(key) {
        PM.player
            .move(key)
            .then(() => EM.dispatch('updateOverlayState'))
            .then(() => this.focusToPlayer());
    }

    playerAttack() {
        PM.player.attack();
    }

    focusToPlayer() {
        const focusSpace = 7;

        const minTop = document.body.scrollTop + focusSpace * CellSize;
        const maxTop = document.body.scrollTop + document.body.clientHeight - focusSpace * CellSize;
        const minLeft = document.body.scrollLeft + focusSpace * CellSize;
        const maxLeft = document.body.scrollLeft + document.body.clientWidth - focusSpace * CellSize;

        if (PM.getTop() < minTop) document.body.scrollTop = PM.getTop() - focusSpace * CellSize;
        if (PM.getTop() > maxTop) document.body.scrollTop = PM.getTop() + focusSpace * CellSize - document.body.clientHeight;
        if (PM.getLeft() < minLeft) document.body.scrollLeft = PM.getLeft() - focusSpace * CellSize;
        if (PM.getLeft() > maxLeft) document.body.scrollLeft = PM.getLeft() + focusSpace * CellSize - document.body.clientWidth;
    }

}

const GM = new GameManager();


const Textures = {
    GROUND: 'url(http://previewcf.turbosquid.com/Preview/2014/08/01__19_04_23/dirt4.jpgbf45ffb4-96f9-4ca6-bc54-2012269a6186Small.jpg)',
    WALL: 'url(https://s-media-cache-ak0.pinimg.com/236x/47/9b/f3/479bf37a046c21e20a3e1d47eb935cdf.jpg)',
    ZOMBIE: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/256/Zombie-icon.png)',
    ZOMBIE_ATT: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Voodoo-Doll-icon.png)',
    ZOMBIE_DMG: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Slimer-icon.png)',
    DEAD: 'url(http://icons.iconarchive.com/icons/aha-soft/desktop-halloween/128/Skull-and-bones-icon.png)',
    HEALTH: 'url(http://vignette2.wikia.nocookie.net/teamfortress/images/c/cc/Health_icon_TF2.png/revision/latest?cb=20130711173303)',
    SPEED: 'url(http://www.free-icons-download.net/images/speed-skating-event-icon-67554.png)',
    ATTACKSPEED: 'url(http://www.heroesfire.com/images/wikibase/icon/talents/arsenal.png)',
    VISION: 'url(http://onerockinternational.com/wp-content/uploads/2012/09/Icon-DV.jpg)',
    RANGE: 'url(http://www.theaccessproject.org.uk/assets/range-icon-3a2c49a3dc4e22cd734fb4a86de505c3.png)',
    KNIFE: 'url(http://game-icons.net/icons/lorc/originals/png/bowie-knife.png)',
    KATANA: 'url(http://icons.iconarchive.com/icons/yellowicon/tmnt/512/Katana-icon.png)',
    HALBERD: 'url(http://vignette2.wikia.nocookie.net/unisonleague/images/1/16/Gear-Halberd_Render.png/revision/latest/scale-to-width-down/350?cb=20160223064132)',
    PLAYER: 'url(http://icons.iconarchive.com/icons/mattahan/ultrabuuf/128/Street-Fighter-Akuma-icon.png)',
    PLAYER_ATT: 'url(http://icons.iconarchive.com/icons/mattahan/ultrabuuf/128/Street-Fighter-Blanka-icon.png)'
};

const preload = Object.keys(Textures).map(key => {
    const image = new Image();
    image.src = Textures[key].slice(4, -1);

    $(image).appendTo('body').hide();
    //$('body').append(image).hide();
    return image;
})

class Cell extends React.Component {
    constructor(props) {
        super();
        this.state = {fogged: true, revealed: false, displayText: (props && props.displayText) || ''};
        this.size = CellSize;
        EM.register(this);
    }

    componentDidMount() {
        const top = (this.top == undefined) ? this.props.i * this.size : this.top;
        const left = (this.left == undefined) ? this.props.j * this.size : this.left;

        this.setState({
            top: top,
            left: left,
            texture: this.texture,
        });

        setTimeout(() => this.updateOverlayState(), 0);
    }

    static getFogState(cell) {
        const dX = Math.pow((cell.state.top + cell.size / 2) - (PM.getTop() + PM.getSize() / 2), 2);
        const dY = Math.pow((cell.state.left + cell.size / 2) - (PM.getLeft() + PM.getSize() / 2), 2);
        const vision = Math.pow(PM.getVision() * CellSize, 2);

        const fogged = dX + dY >= vision;
        return fogged;
    }

    updateOverlayState() {
        const fogged = Cell.getFogState(this);
        if (this.state.fogged != fogged)
        this.setState({fogged});

        if (!fogged && !this.state.revealed)
            this.setState({revealed: true});
    }

    render() {
        const classes = this.name ? 'creature ' + this.name : '';
        let bgTexture = this.state.texture;
        let cellContent;

        if (this.name) {
            bgTexture = '';
            let shouldDisplay = this.state.revealed && !this.state.fogged;
            cellContent = <cell-content style={{
                                "display": shouldDisplay ? 'block': 'none',
                                "backgroundImage": this.state.texture,
                                "fontSize": this.size + 'px'
                          }}>
                                {this.state.displayText}
                          </cell-content>
        } else {
            let overlayState = '';
            overlayState += this.state.fogged ? ' fogged' : '';
            overlayState += this.state.revealed ? ' revealed' : '';

            cellContent = <cell-overlay class={overlayState}>{this.state.displayText}</cell-overlay>
        }

        return (
            <cell style={{
                "top": this.state.top + 'px',
                "left": this.state.left + 'px',
                "width": this.size + 'px',
                "height": this.size + 'px',
                "backgroundImage": bgTexture
            }} className={classes}>
                {cellContent}
            </cell>
        );
    }
}

class Wall extends Cell {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.WALL;
    }
}

class Ground extends Cell {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.GROUND;
    } 
}

class Map extends React.Component {
    constructor() {
        super();
        this.mapSize = MapSize;
        this.cells = new Array(this.mapSize);
        for(let i = 0; i < this.mapSize; i++) {
            this.cells[i] = new Array(this.mapSize);
            for(let j = 0; j < this.mapSize; j++)
                // if(i == 0 || i == this.mapSize - 1 ||
                //    j == 0 || j == this.mapSize - 1)
                    this.cells[i][j] = Map.Enum.WALL;
                // else
                //     this.cells[i][j] = Map.Enum.GROUND;
        }

        rooms.concat(halls).forEach(room => {
            for(let i = 0; i < room.width; i++)
                for(let j = 0; j < room.height; j++)
                    this.cells[j + room.y][i + room.x] = Map.Enum.GROUND;
        });
    }

    render() {
        const cells = this.cells.map((row, i) => row.map((cell, j) => {
            if (cell == Map.Enum.GROUND)
                return <Ground i={i} j={j}/>
            else
                return <Wall i={i} j={j}/>
        }));

        return (
            <div>
                {cells}
            </div>
        );
    }
}

Map.Enum = {
    GROUND: 'ground',
    WALL: 'wall'
}

class Creature extends Cell {
    constructor() {
        super();

        this.name = 'creature';

        this.dead = false;

        this.level = 1;

        this.health = 10;
        this.maxHealth = this.health;
        this.color = 'lightgray';
        this.width = 15;

        this.speed = 5;
        this.attackSpeedHz = 0.5;
        this.range = 1;
        this.power = 1;

        this.top = 15;
        this.left = 15;

        this.vision = 3;

        this.attacking = false;
    }

    move(direction) {
        return this
            .beforeMove(direction, this.speed)
            .then(speed => {
                switch (direction) {
                    case 'Up':
                    this.top -= speed;
                        break
                    case 'Down':
                    this.top += speed;
                        break
                    case 'Left':
                    this.left -= speed;
                        break
                    case 'Right':
                    this.left += speed;
                        break
                }

                this.setState({top: this.top, left: this.left});
                return {direction, speed};
            })
            .then(moveInfo => this.afterMove(moveInfo))
            .catch(err => {});//console.log(err));
    }

    attack(name) {
        if(this.attacking) return 'Already on attack';

        this.attacking = true;

        const displayText = this.state.displayText;

        const bfrTexture = this.state.texture;

        if (this.attTexture) {
            this.setState({texture: this.attTexture});
        }

        //this.setState({displayText: 'X'});
        this.onAttack();

        setTimeout(() => {
            if (this.attTexture) {
                if (!this.dead)
                    this.setState({texture: bfrTexture});
                // if (this.health <= this.maxHealth * 0.3)
                //     this.setState({texture: this.dmgTexture})
                // else
                //     this.setState({texture: this.texture})
            };
            // this.setState({displayText});
            this.attacking = false;
            this.onAttackEnd();
        }, 1000 / this.attackSpeedHz);
    }

    onAttack() {}
    onAttackEnd() {}

    beforeMove(direction, speed) {
        if (speed <= 0) return Promise.reject('Occupied');

        let nextPos = {
            top: this.top,
            left: this.left
        };

        if (direction == 'Up') nextPos.top -= speed;
        if (direction == 'Down') nextPos.top += speed;
        if (direction == 'Left') nextPos.left -= speed;
        if (direction == 'Right') nextPos.left += speed;

        const available = GM.getOtherCreatures(this).canSee.concat(GM.getWalls()).reduce((pre, cell) => {
            return pre && (nextPos.top >= cell.state.top + cell.size ||
                           nextPos.top + this.size <= cell.state.top ||
                           nextPos.left >= cell.state.left + cell.size ||
                           nextPos.left + this.size <= cell.state.left);
        }, true);

        if (available)
            return Promise.resolve(speed);
        else
            return this.beforeMove(direction, speed - 1);
    }

    afterMove() {
        this.updateOverlayState();        
    }


    componentDidMount() {
        super.componentDidMount();

        this.$elem = ReactDOM.findDOMNode(this);
        
        if(!this.texture)
            this.setState({displayText: this.name.slice(0, 1).toUpperCase()});
    }

    damage(target) {
        const min_dmg = this.power * (this.level - 1);
        const max_dmg = this.power * (this.level + 0.5);

        const dmg = Math.random() * (max_dmg - min_dmg) + min_dmg;

        target.health -= dmg;
        target.onDamaged();
    }

    onDamaged() {
        console.log(this.name + ' got damaged and has health ' + this.health)
        if (this.health > 0 && this.health <= this.maxHealth * 0.3) {
            this.setState({texture: this.dmgTexture});
        }
        if (this.health <= 0) this.die();
    }

    die() {
        this.onDie();
        EM.unregister(this);
        //this.props.kill();
    }

    onDie() {
        console.log('ok got dead');
        this.dead = true;
        this.setState({texture: Textures.DEAD});
    }

}

class NPC extends Creature {
    constructor(props) {
        super();
        //this.name = 'zombie';

        this.top = props.top || 40;
        this.left = props.left || 40;
        this.xp = 1;

        // this.texture = Textures.ZOMBIE;

        // this.size = CellSize;

        this.moveRandom();
    }


    moveRandom() {
        this.mover = setInterval(() => {
            let direction = ['Up', 'Down', 'Left', 'Right'].sort((a, b) => Math.random() > 0.5)[0];
            const others = GM.getOtherCreatures(this);
            const player = others.canSee.filter(creature => creature.name == 'player')[0];

            if(player) {
                const dT = this.top - player.top;
                const dL = this.left - player.left;

                if (Math.abs(dL) > Math.abs(dT)) {
                    if (player.left >= this.left) direction = 'Right';
                    if (player.left < this.left) direction = 'Left';
                } else {
                    if (player.top >= this.top) direction = 'Down';
                    if (player.top < this.top) direction = 'Up';
                }

                const mayAttack = others.canAttack.filter(creature => creature.name == 'player')[0];
                if (mayAttack) {
                    this.attack();
                }
            }

            this.move(direction);
        }, 250);
    }

    onAttack() {
        console.log('Damaging player')
        this.damage(PM.player);
    }

    onDie() {
        super.onDie();
        clearInterval(this.mover);
        this.mover = undefined;
        PM.player.gainXP(this.xp);
    }
}

class Zombie extends NPC {
    constructor(props) {
        super(props);
        this.name = 'zombie';
        this.texture = Textures.ZOMBIE;
        this.dmgTexture = Textures.ZOMBIE_DMG;
        this.attTexture = Textures.ZOMBIE_ATT;
        this.size = CellSize;
        this.xp = 10;
        this.vision = 2;
        this.range = 1;
        this.power = 2;
        this.speed = 3;
        this.attackSpeedHz = 1;
        this.health = 10;
        this.maxHealth = 10;
    }
}

class Player extends Creature {
    constructor() {
        super();
        this.name = 'player';

        const startingRoom = rooms[0];

        this.top = Math.floor(startingRoom.cY) * CellSize;
        this.left = Math.floor(startingRoom.cX) * CellSize;
        this.vision = 200;

        this.xp = 0;

        this.speed= 5;

        this.range = 1;

        this.power = 3;

        this.weapon = 'Punch';

        this.size = 10;

        this.health = 10;
        this.maxHealth = 10;

        this.attackSpeedHz = 1;

        this.texture = Textures.PLAYER;
        this.attTexture = Textures.PLAYER_ATT;

        PM.register(this);

        this.regenerate();
    }

    componentDidMount() {
        super.componentDidMount();
        EM.hud.update(this);
    }

    afterMove(){
        super.afterMove(); 
        const pickedup = GM.getPickups().filter(pickup => {
            return !(this.top >= pickup.state.top + pickup.size ||
                this.top + this.size <= pickup.state.top ||
                this.left >= pickup.state.left + pickup.size ||
                this.left + this.size <= pickup.state.left);
        })[0];

        if (pickedup) {
            pickedup.affect(this);
            EM.hud.update(this);
        }
    }

    onAttack() {
        console.log("begin", GM.getOtherCreatures(this).canAttack);
        const target = GM.getOtherCreatures(this).canAttack[0];
        target && this.damage(target);
    }

    onAttackEnd() {
        console.log("end");
    }

    onDamaged() {
        super.onDamaged();
        EM.hud.update(this);
    }

    gainXP(xp) {
        this.xp += xp;
        if (this.xp >= 10 * (this.level * (this.level + 1) / 2)) {
            this.level++;
            this.maxHealth = this.level * 10;
            this.health = this.maxHealth;
            EM.hud.update(this);
        }
    }

    regenerate() {
        setInterval(() => {
            const amount = (this.level / 4) / 16;
            if (this.health < this.maxHealth) {
                this.health += amount;
                if (this.health > this.maxHealth)
                    this.health = this.maxHealth;

                EM.hud.update(this);
            }
        },250);
    }
}

class PlayerHUD extends React.Component {
    constructor() {
        super();
        EM.hud = this;
        this.state = {player: {health: 0, maxHealth: 0,damage: null, level: null, power: null, weapon: null, vision: null, speed: null, range: 0, attackSpeedHz: 0, xp: 0}};
    }

    update(player) {
        this.setState({player});
    }

    render() {
        return (
            <hud>
                <huditem>Level: {this.state.player.level}</huditem>
                <huditem>Health: {this.state.player.health.toFixed(1)} / {this.state.player.maxHealth}</huditem>
                <huditem>Att. Power: {this.state.player.power}</huditem>
                <huditem>Weapon: {this.state.player.weapon}</huditem>
                <huditem>Vision: {this.state.player.vision}</huditem>
                <huditem>Walk Speed: {this.state.player.speed}</huditem>
                <huditem>Att. Range: {this.state.player.range.toFixed(2)}</huditem>
                <huditem>Att. Speed (Hz): {this.state.player.attackSpeedHz.toFixed(2)}</huditem>
                <huditem>XP: {this.state.player.xp} / {this.state.player.level * (this.state.player.level + 1) * 10 / 2}</huditem>
            </hud>
        );
    }
}


class PickUp extends Cell {
    constructor(...args) { 
        super(...args);
        this.type = 'pickup';
        this.pickupType = 'default';
        this.state.used = false;
    }

    render() {
        if (this.state.used) return (<div></div>);

        return super.render();
    }
}

class Health extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.HEALTH;
        this.pickupType = 'health';
    }

    affect(player) {
        player.health += 10;        
        this.setState({used: true});
    }
}

class Speed extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.SPEED;
        this.pickupType = 'speed';
    }

    affect(player) {
        player.speed += Math.floor(Math.random() * 3) + 1;      
        this.setState({used: true});
    }
}

class AttackSpeed extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.ATTACKSPEED;
        this.pickupType = 'attackSpeedHz';
    }

    affect(player) {
        player.attackSpeedHz += Math.random();
        if (player.attackSpeedHz <= 0) player.attackSpeedHz = 5;        
        this.setState({used: true});
    }
}

class Vision extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.VISION;
        this.pickupType = 'vision';
    }

    affect(player) {
        player.vision += Math.floor(Math.random() * 3) + 1;         
        this.setState({used: true});
    }
}

class Range extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.RANGE;
        this.pickupType = 'range';
    }

    affect(player) {
        player.range += Math.random();      
        this.setState({used: true});
    }
}

class Weapon extends PickUp {
    constructor(...args) { 
        super(...args);
        this.pickupType = 'power';
    }
}

class Knife extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.KNIFE;
    }

    affect(player) {
        player.weapon = 'Knife';
        player.power = 10; 
        this.setState({used: true});
    }    
}

class Katana extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.KATANA;
    } 

    affect(player) {
        player.weapon = 'Katana';
        player.power = 30; 
        this.setState({used: true});
    } 
}

class Halberd extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.HALBERD;
    }

    affect(player) {
        player.weapon = 'Halberd';
        player.power = 50; 
        this.setState({used: true});
    }  
}


class GameWindow extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.state.pickups = [];
        this.state.player = <Player/>;
        this.state.pickups = rooms.map((room, id) => {
            let pickup = '';
            let pickup2 = '';

            if (Math.random() > 0.3) {
                pickup = this.generateRandomPickupInPosition(this.generateRandomPointInRoom(room));
                if (Math.random() > 0.6) {
                    pickup2 = this.generateRandomPickupInPosition(this.generateRandomPointInRoom(room));
                }
            }

            return (
                <div key={'p' + id}>
                    {pickup}
                    {pickup2}
                </div>
                

                // <Cell i={pos.y} j={pos.x} displayText={id.toString()}/>

                //<Zombie key={id} top={pos.y * CellSize} left={pos.x * CellSize} displayText={id.toString()}/>
            );
        });

        this.state.creatures = rooms.map((room, id) => {
            const pos = this.generateRandomPointInRoom(room);

            return (
                <Zombie key={'npc' + id} top={pos.y * CellSize} left={pos.x * CellSize}/>
            );
        });
            // const pos = this.generateRandomPointInRoom(room);
            // const pickup = this.generateRandomPickupInPosition(pos);

        //     return (
        //         // pickup

        //         // <Cell i={pos.y} j={pos.x} displayText={id.toString()}/>

        //         //<Zombie key={id} top={pos.y * CellSize} left={pos.x * CellSize} displayText={id.toString()}/>
        //     );
        // });

        /*[
            <Zombie key={1} top={100} kill={this.kill.bind(this, 1)}/>,
            <Zombie key={2} kill={this.kill.bind(this, 2)}/>
        ]; */
    }

    generateRandomPointInRoom(room) {
        return {
            x: (room.x + 1) + Math.random() * (room.width - 1),
            y: (room.y + 1) + Math.random() * (room.height - 1)
        };
    };

    generateRandomPickupInPosition(pos) {        
        const val = Math.floor(Math.random() * 6);
        const randomID = this.generateRandomId();

        switch (val) {
            case 0: return <Health key={randomID} i={pos.y} j={pos.x}/>
            case 1: return <Speed key={randomID} i={pos.y} j={pos.x}/>
            case 2: return <AttackSpeed key={randomID} i={pos.y} j={pos.x}/>
            case 3: return <Vision key={randomID} i={pos.y} j={pos.x}/>
            case 4: return <Range key={randomID} i={pos.y} j={pos.x}/>
            case 5: 
                const wep = Math.floor(Math.random() * 3);
                switch (wep) {
                    case 0: return <Knife key={randomID} i={pos.y} j={pos.x}/>
                    case 1: return <Katana key={randomID} i={pos.y} j={pos.x}/>
                    case 2: return <Halberd key={randomID} i={pos.y} j={pos.x}/>
                    default: return;
                }
                return;    
            default:
                return;
        }
    }

    generateRandomId() {
        return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    kill(key) {
        this.setState({creatures: this.state.creatures.filter(comp => comp.key != key)});
    }

    componentDidMount() { 
        setTimeout(_ => GM.focusToPlayer(), 0);

        $('body').get(0).addEventListener('keydown', e => {

            if (e.keyIdentifier == 'Right' ||
               e.keyIdentifier == 'Left' ||
               e.keyIdentifier == 'Up' ||
               e.keyIdentifier == 'Down'){

                e.preventDefault(); 
                GM.playerMove(e.keyIdentifier);
            }

            if (e.keyIdentifier == 'U+0020') { //Space
                e.preventDefault(); 
                GM.playerAttack();
            }
        });
    }


    render() {
        const player = this.state.player;
        const creatures = this.state.creatures;
        const pickups = this.state.pickups;

        return (
            <div>
                <Map/>
                {player}
                {creatures}
                {pickups}
                <PlayerHUD/>
            </div>
        );
    }
}


ReactDOM.render(<GameWindow />, $('background').get(0));
