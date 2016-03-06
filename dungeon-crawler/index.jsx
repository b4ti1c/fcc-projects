class EventManager {
    constructor() {
        this.objects = [];
        this.objectsByName = {};
        this.creatures = [];
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
        const minTop = document.body.scrollTop + 10 * CellSize;
        const maxTop = document.body.scrollTop + document.body.clientHeight - 10 * CellSize;
        const minLeft = document.body.scrollLeft + 10 * CellSize;
        const maxLeft = document.body.scrollLeft + document.body.clientWidth - 10 * CellSize;

        if (PM.getTop() < minTop) document.body.scrollTop = PM.getTop() - 10 * CellSize;
        if (PM.getTop() > maxTop) document.body.scrollTop = PM.getTop() + 10 * CellSize - document.body.clientHeight;
        if (PM.getLeft() < minLeft) document.body.scrollLeft = PM.getLeft() - 10 * CellSize;
        if (PM.getLeft() > maxLeft) document.body.scrollLeft = PM.getLeft() + 10 * CellSize - document.body.clientWidth;
    }

}

const GM = new GameManager();


const Textures = {
    GROUND: 'url(http://previewcf.turbosquid.com/Preview/2014/08/01__19_04_23/dirt4.jpgbf45ffb4-96f9-4ca6-bc54-2012269a6186Small.jpg)',
    WALL: 'url(https://s-media-cache-ak0.pinimg.com/236x/47/9b/f3/479bf37a046c21e20a3e1d47eb935cdf.jpg)',
    ZOMBIE: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/256/Zombie-icon.png)'
};

const CellSize = 10;

class Cell extends React.Component {
    constructor() {
        super();
        this.state = {fogged: true, revealed: false, displayText: ''};
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
    constructor() { 
        super();
        this.texture = Textures.WALL;
    }
}

class Ground extends Cell {
    constructor() { 
        super();
        this.texture = Textures.GROUND;
    } 
}

class Map extends React.Component {
    constructor() {
        super();
        this.mapSize = 100;
        this.cells = new Array(this.mapSize);
        for(var i = 0; i < this.mapSize; i++) {
            this.cells[i] = new Array(this.mapSize);
            for(var j = 0; j < this.mapSize; j++)
                if(i == 0 || i == this.mapSize - 1 ||
                   j == 0 || j == this.mapSize - 1)
                    this.cells[i][j] = Map.Enum.WALL;
                else
                    this.cells[i][j] = Map.Enum.GROUND;
        }
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

        this.health = 10;
        this.color = 'lightgray';
        this.width = 15;

        this.speed = 5;
        this.attackSpeedHz = 2.5;
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
            .catch(err => console.log(err));
    }

    attack(name) {
        if(this.attacking) return 'Already on attack';

        this.attacking = true;

        const displayText = this.state.displayText;
        this.setState({displayText: 'X'});
        this.onAttack();

        setTimeout(() => {
            this.setState({displayText});
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
        //target.health -= this.power;
        target.onDamaged();
    }

    onDamaged() {
        this.die();
    }

    die() {
        this.onDie();
        EM.unregister(this);
        this.props.kill();
    }

    onDie() {}

}

class Zombie extends Creature {
    constructor(props) {
        super();
        this.name = 'zombie';

        this.top = props.top || 300;
        this.left = props.left || 115;

        this.texture = Textures.ZOMBIE;

        this.size = 30;

        // this.moveRandom();
    }


    moveRandom() {
        this.mover = setInterval(() => {
            const direction = ['Up', 'Down', 'Left', 'Right'].sort((a, b) => Math.random() > 0.5)[0];
            this.move(direction);
        }, 1000);
    }

    onDie() {
        clearInterval(this.mover);
        this.mover = undefined;
    }
}

class Player extends Creature {
    constructor() {
        super();
        this.name = 'player';

        this.top = 300;
        this.left = 100;
        this.vision = 7;

        this.speed= 10;

        this.range = 1;

        PM.register(this);
    }

    onAttack() {
        console.log("begin", GM.getOtherCreatures(this));
        const target = GM.getOtherCreatures(this).canAttack[0];
        target && this.damage(target);
    }


    onAttackEnd() {
        console.log("end")
    }
}


class GameWindow extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.state.pickups = [];
        this.state.player = <Player/>;
        this.state.creatures = [
            <Zombie key={1} top={100} kill={this.kill.bind(this, 1)}/>,
            <Zombie key={2} kill={this.kill.bind(this, 2)}/>
        ];
    }

    kill(key) {
        this.setState({creatures: this.state.creatures.filter(comp => comp.key != key)});
    }

    componentDidMount() { 
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

        return (
            <div>
                <Map/>
                {player}
                {creatures}
            </div>
        );
    }
}



ReactDOM.render(<GameWindow />, $('background').get(0));
