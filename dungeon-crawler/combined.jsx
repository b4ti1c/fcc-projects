const MapSize = 75;

const rand = function(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (num > max) num = max;

    return num;
}

class Leaf {
    constructor(x, y, width, height) {
        this.minLeafSize = 15;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    split() {
        if (this.leftChild != null || this.rightChild != null) return false;

        let splitHorizontal = Math.random() > 0.5;

        if (this.width > this.height * 1.25) splitHorizontal = false;
        if (this.height > this.width * 1.25) splitHorizontal = true;

        let max = (splitHorizontal ? this.height : this.width) - this.minLeafSize;
        if (max <= this.minLeafSize) return false;

        let splitPosition = rand(max, this.minLeafSize);

        if (splitHorizontal) {
            this.leftChild = new Leaf(this.x, this.y, this.width, splitPosition);
            this.rightChild = new Leaf(this.x, this.y + splitPosition, this.width, this.height - splitPosition);
        } else {
            this.leftChild = new Leaf(this.x, this.y, splitPosition, this.height);
            this.rightChild = new Leaf(this.x + splitPosition, this.y, this.width - splitPosition, this.height);
        }

        return true;
    }

    createRooms() {
        if (this.leftChild != null || this.rightChild != null){
            if (this.leftChild != null) this.leftChild.createRooms();
            if (this.rightChild != null) this.rightChild.createRooms();

            if (this.leftChild != null && this.rightChild != null)
                this.createHall(this.leftChild.getRoom(), this.rightChild.getRoom());
        } else {
            let roomSize = {
                width: rand(4, this.width - 2),
                height: rand(4, this.height - 2)
            };

            let roomPos = {
                x: rand(1, this.width - roomSize.width - 1),
                y: rand(1, this.height - roomSize.height - 1)
            };

            this.room = {
                x: this.x + roomPos.x,
                y: this.y + roomPos.y,
                width: roomSize.width,
                height: roomSize.height
            };
        }
    }

    getRoom() {
        if (this.room) return this.room;

        let leftChildRoom, rightChildRoom;

        if (this.leftChild != null) leftChildRoom = this.leftChild.getRoom();
        if (this.rightChild != null) rightChildRoom = this.rightChild.getRoom();

        if (leftChildRoom == null && rightChildRoom == null) return null;
        if (rightChildRoom == null) return leftChildRoom;
        if (leftChildRoom == null) return rightChildRoom;

        if (Math.random() > 0.5) return leftChildRoom;
        else return rightChildRoom;
    }

    createHall(leftRoom, rightRoom) {
        this.halls = [];

        let point1 = {
            x: rand(leftRoom.x + 1, leftRoom.x + leftRoom.width - 1),
            y: rand(leftRoom.y + 1, leftRoom.y + leftRoom.height - 1)
        };

        let point2 = {
            x: rand(rightRoom.x + 1, rightRoom.x + rightRoom.width - 1),
            y: rand(rightRoom.y + 1, rightRoom.y + rightRoom.height - 1)
        };

        let width = point2.x - point1.x;
        let height = point2.y - point1.y;

        if (width < 0) {
            if (height < 0) {
                if (Math.random() < 0.5) {
                    this.halls.push({x: point2.x, y: point1.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point2.x, y: point2.y, width: 2, height: Math.abs(height)});
                } else {
                    this.halls.push({x: point2.x, y: point2.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point1.x, y: point2.y, width: 2, height: Math.abs(height)});
                }
            } else if (height > 0) {
                // if (Math.random() < 0.5) {
                    this.halls.push({x: point2.x, y: point1.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point2.x, y: point1.y, width: 2, height: Math.abs(height)});
                // } else {
                //     this.halls.push({x: point2.x, y: point2.y, width: Math.abs(width), height: 2});
                //     this.halls.push({x: point1.x, y: point1.y, width: 2, height: Math.abs(height)});
                // }
            } else this.halls.push({x: point2.x, y: point2.y, width: Math.abs(width), height: 2});
        } else if (width > 0) {
            if (height < 0) {
                // if (Math.random() < 0.5) {
                    this.halls.push({x: point1.x, y: point2.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point1.x, y: point2.y, width: 2, height: Math.abs(height)});
                // } else {
                //     this.halls.push({x: point1.x, y: point1.y, width: Math.abs(width), height: 2});
                //     this.halls.push({x: point2.x, y: point2.y, width: 2, height: Math.abs(height)});
                // }
            } else if (height > 0) {
                if (Math.random() < 0.5) {
                    this.halls.push({x: point1.x, y: point1.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point2.x, y: point1.y, width: 2, height: Math.abs(height)});
                } else {
                    this.halls.push({x: point1.x, y: point2.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point1.x, y: point1.y, width: 2, height: Math.abs(height)});
                }
            } else this.halls.push({x: point1.x, y: point1.y, width: Math.abs(width), height: 2});
        } else { //width == 0
            if (height < 0) this.halls.push({x: point2.x, y: point2.y, width: 2, height: Math.abs(height)});
            else if (height > 0) this.halls.push({x: point1.x, y: point1.y, width: 2, height: Math.abs(height)});
        }
    }
}


const maxLeafSize = 20;

let leafs = [];
let root = new Leaf(0, 0, MapSize, MapSize);

leafs.push(root);

let didSplit = true;

while (didSplit) {
    didSplit = false;

    leafs.forEach(leaf => {
        if (leaf.leftChild == null && leaf.rightChild == null)
            if(leaf.width > maxLeafSize || leaf.height > maxLeafSize || Math.random() > 0.75)
                if(leaf.split()) {
                    leafs.push(leaf.leftChild);
                    leafs.push(leaf.rightChild);
                    didSplit = true;
                }
    });
}

root.createRooms();

let rooms = [];
let halls = [];

leafs.forEach(leaf => {
    leaf.room && rooms.push(leaf.room)
    leaf.halls && leaf.halls.forEach(hall => halls.push(hall));
});

rooms = rooms.map(room => {
    room.cX = room.x + room.width / 2;
    room.cY = room.y + room.height / 2;

    return room;
});

const startRoom = rooms.reduce((pre, cur) => {
    const area = cur.width * cur.height;
    if (area < pre) return cur;
    return pre;
}, 9999999);

rooms.sort((A, B) => {
    const posA = Math.pow(A.cX - startRoom.cX, 2) + Math.pow(A.cY - startRoom.cY, 2);
    const posB = Math.pow(B.cX - startRoom.cX, 2) + Math.pow(B.cY - startRoom.cY, 2);

    if(posA <= posB) return -1;
    return 1;
});

window.rooms = rooms;
window.halls = halls;


const CellSize = 40;

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
        if (PM.player.dead) return;

        PM.player
            .move(key)
            .then(() => EM.dispatch('updateOverlayState'))
            .then(() => this.focusToPlayer())
            .catch(err => console.log(err));
    }

    playerAttack() {
        if (PM.player.dead) return;

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

    registerWindow(gameWindow) {
        this.gameWindow = gameWindow;
    }

    playerIsDead() {
        this.gameWindow.playerIsDead();
    }

    bossIsDead() {
        this.gameWindow.bossIsDead();
    }
}

const GM = new GameManager();


const Textures = {
    GROUND: 'url(http://previewcf.turbosquid.com/Preview/2014/08/01__19_04_23/dirt4.jpgbf45ffb4-96f9-4ca6-bc54-2012269a6186Small.jpg)',
    // WALL: 'url(https://s-media-cache-ak0.pinimg.com/236x/47/9b/f3/479bf37a046c21e20a3e1d47eb935cdf.jpg)',
    WALL: 'url(http://pre04.deviantart.net/f153/th/pre/i/2014/037/2/0/tileable_brick_texture_by_bhaskar655-d75b94u.jpg)',
    ZOMBIE: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/256/Zombie-icon.png)',
    ZOMBIE_ATT: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Voodoo-Doll-icon.png)',
    ZOMBIE_DMG: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Slimer-icon.png)',
    SKELETON: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Slasher-icon.png)',
    SKELETON_ATT: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Voodoo-Doll-icon.png)',
    SKELETON_DMG: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Scream-icon.png)',
    IMP: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Ghoul-icon.png)',
    IMP_ATT: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Voodoo-Doll-icon.png)',
    IMP_DMG: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Freddie-icon.png)',
    BOSS: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Red-Skull-icon.png)',
    BOSS_ATT: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Sea-Monster-icon.png)',
    BOSS_DMG: 'url(http://icons.iconarchive.com/icons/hopstarter/halloween-avatars/128/Slasher-2-icon.png)',
    DEAD: 'url(http://icons.iconarchive.com/icons/aha-soft/desktop-halloween/128/Skull-and-bones-icon.png)',
    HEALTH: 'url(http://vignette2.wikia.nocookie.net/teamfortress/images/c/cc/Health_icon_TF2.png/revision/latest?cb=20130711173303)',
    SPEED: 'url(http://www.free-icons-download.net/images/speed-skating-event-icon-67554.png)',
    ATTACKSPEED: 'url(http://www.heroesfire.com/images/wikibase/icon/talents/arsenal.png)',
    VISION: 'url(http://onerockinternational.com/wp-content/uploads/2012/09/Icon-DV.jpg)',
    RANGE: 'url(http://www.theaccessproject.org.uk/assets/range-icon-3a2c49a3dc4e22cd734fb4a86de505c3.png)',
    STRENGTH: 'url(http://vignette1.wikia.nocookie.net/infinitecrisis/images/3/36/Swamp_Thing_Warrior_King_Ability.jpg/revision/latest?cb=20141204025132)',
    REGENERATION: 'url(http://hydra-media.cursecdn.com/pathofexile.gamepedia.com/1/1c/Life_Regeneration_passive_icon.png?version=b49d0118eb4559089d7fe3e4f199915c)',
    KNIFE: 'url(http://game-icons.net/icons/lorc/originals/png/bowie-knife.png)',
    KATANA: 'url(http://icons.iconarchive.com/icons/yellowicon/tmnt/512/Katana-icon.png)',
    HALBERD: 'url(http://vignette2.wikia.nocookie.net/unisonleague/images/1/16/Gear-Halberd_Render.png/revision/latest/scale-to-width-down/350?cb=20160223064132)',
    
    PLAYER_HEALTHY: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/healthy.png)',
    PLAYER_HEALTHY_HIT: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/healthy-hit.png)',
    PLAYER_HEALTHY_HAPPY: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/healthy-happy.png)',

    PLAYER_OK: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/ok.png)',
    PLAYER_OK_HIT: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/ok-hit.png)',
    PLAYER_OK_HAPPY: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/ok-happy.png)',

    PLAYER_WOUNDED: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/wounded.png)',
    PLAYER_WOUNDED_HIT: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/wounded-hit.png)',
    PLAYER_WOUNDED_HAPPY: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/wounded-happy.png)',

    PLAYER_CRITICAL: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/critical.png)',
    PLAYER_CRITICAL_HIT: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/critical-hit.png)',
    PLAYER_CRITICAL_HAPPY: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/critical-happy.png)',

    PLAYER_DEADLY: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/deadly.png)',
    PLAYER_DEADLY_HIT: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/deadly-hit.png)',
    PLAYER_DEADLY_HAPPY: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/deadly-happy.png)',

    PLAYER_DEAD: 'url(http://game-resources.hazarilhan.com/dungeon-crawler/doomfaces/dead.png)'

    // PLAYER: 'url(http://icons.iconarchive.com/icons/mattahan/ultrabuuf/128/Street-Fighter-Akuma-icon.png)',
    // PLAYER_ATT: 'url(http://icons.iconarchive.com/icons/mattahan/ultrabuuf/128/Street-Fighter-Blanka-icon.png)'
};

const preloadTextures = Object.keys(Textures).map(key => {
    const image = new Image();
    image.src = Textures[key].slice(4, -1);

    $(image).appendTo('body').hide();
    return image;
});

const SoundsToPreload = {
    THEME: 'http://game-resources.hazarilhan.com/dungeon-crawler/theme.mp3',
    BOSS_GREET: 'http://game-resources.hazarilhan.com/dungeon-crawler/boss-greet.wav',
    BOSS_HIT: 'http://game-resources.hazarilhan.com/dungeon-crawler/boss-hit.wav',
    BOSS_DMG: 'http://game-resources.hazarilhan.com/dungeon-crawler/boss-dmg.wav',
    BOSS_DIE: 'http://game-resources.hazarilhan.com/dungeon-crawler/boss-die.wav',
    ZOMBIE_GREET: 'http://game-resources.hazarilhan.com/dungeon-crawler/zombie-greet.wav',
    ZOMBIE_HIT: 'http://game-resources.hazarilhan.com/dungeon-crawler/zombie-hit.wav',
    ZOMBIE_DMG: 'http://game-resources.hazarilhan.com/dungeon-crawler/zombie-dmg.wav',
    ZOMBIE_DIE: 'http://game-resources.hazarilhan.com/dungeon-crawler/zombie-die.wav',
    SKELETON_GREET: 'http://game-resources.hazarilhan.com/dungeon-crawler/skeleton-greet.wav',
    SKELETON_HIT: 'http://game-resources.hazarilhan.com/dungeon-crawler/skeleton-hit.wav',
    SKELETON_DMG: 'http://game-resources.hazarilhan.com/dungeon-crawler/skeleton-dmg.wav',
    SKELETON_DIE: 'http://game-resources.hazarilhan.com/dungeon-crawler/skeleton-die.wav',
    IMP_GREET: 'http://game-resources.hazarilhan.com/dungeon-crawler/imp-greet.wav',
    IMP_HIT: 'http://game-resources.hazarilhan.com/dungeon-crawler/imp-hit.wav',
    IMP_DMG: 'http://game-resources.hazarilhan.com/dungeon-crawler/imp-dmg.wav',
    IMP_DIE: 'http://game-resources.hazarilhan.com/dungeon-crawler/imp-die.wav',
    PUNCH: 'http://game-resources.hazarilhan.com/dungeon-crawler/punch.wav',
    KNIFE: 'http://game-resources.hazarilhan.com/dungeon-crawler/knife.wav',
    KATANA: 'http://game-resources.hazarilhan.com/dungeon-crawler/katana.wav',
    HALBERD: 'http://game-resources.hazarilhan.com/dungeon-crawler/halberd.wav',
    SWING: 'http://game-resources.hazarilhan.com/dungeon-crawler/swing.wav',
    WALK: 'http://game-resources.hazarilhan.com/dungeon-crawler/walk.wav',
    WALK2: 'http://game-resources.hazarilhan.com/dungeon-crawler/walk2.wav',
    PICKUP: 'http://game-resources.hazarilhan.com/dungeon-crawler/pickup.wav',
    PLAYER_HEALTHY_HIT: 'http://game-resources.hazarilhan.com/dungeon-crawler/player-healthy-hit.wav',
    PLAYER_WOUNDED_HIT: 'http://game-resources.hazarilhan.com/dungeon-crawler/player-wounded-hit.wav',
    PLAYER_CRITICAL_HIT: 'http://game-resources.hazarilhan.com/dungeon-crawler/player-critical-hit.wav',
    PLAYER_DEADLY_HIT: 'http://game-resources.hazarilhan.com/dungeon-crawler/player-deadly-hit.wav',
    PLAYER_DIE: 'http://game-resources.hazarilhan.com/dungeon-crawler/player-die.wav',
    PLAYER_LEVEL: 'http://game-resources.hazarilhan.com/dungeon-crawler/player-level.wav'
};

const Sounds = {};
Object.keys(SoundsToPreload).forEach(key => {
    const audio = new Audio();
    audio.src = SoundsToPreload[key];

    $(audio).appendTo('body').hide();
    Sounds[key] = audio;
});

Sounds.THEME.loop = true;

class Cell extends React.Component {
    constructor(props) {
        super();
        this.state = {fogged: true, revealed: false, displayText: (props && props.displayText) || ''};
        this.size = CellSize;
        EM.register(this);
    }

    componentDidMount() {
        const top = (this.top == undefined) ? this.props.i * CellSize : this.top;
        const left = (this.left == undefined) ? this.props.j * CellSize : this.left;

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
        let classes = this.name ? 'creature ' + this.name : '';
        classes += this.state.texture == Textures.DEAD ? ' dead' : '';
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

            if (this.type != 'pickup' || !this.state.revealed) overlayState += this.state.fogged ? ' fogged' : '';
            overlayState += this.state.revealed ? ' revealed' : '';

            cellContent = <cell-overlay class={overlayState}>{this.state.displayText}</cell-overlay>
        }

        let playerRange = '';

        // if (this.name == 'player' || this.name == 'boss' && !this.dead) {
        if (this.name == 'player' && !this.dead) {
            const size = (this.state.range * 2) * CellSize + 10;
            const offset = this.name == 'player' ? (40 - size) / 2 : -66;

            //CellSize = 40
            //40 * (2 * range) + 10 = end
            //end - 40 / 2 = offset

            //40 40 0 0
            //90 90 -25 -25 -> 1
            //170 170 -65 -65 -> 2
            //250 250 -105 -105 ->3

            playerRange = <playerrange style={{
                    "width": size + 'px',
                    "height": size + 'px',
                    "top": offset + 'px',
                    "left": offset + 'px'
                }}></playerrange>
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
                {playerRange}
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

        this.state.showHealth = false;
        this.state.health = this.health;

        this.regenerationRate = 1;

        this.healthColor = 'rgba(154,4,36,1)';
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
    }

    attack(name) {
        if(this.attacking) return 'Already on attack';

        this.attacking = true;
        this.onAttack();


        const displayText = this.state.displayText;

        const bfrTexture = this.state.texture;

        if (this.attTexture) {
            this.setState({texture: this.attTexture});
        }

        //this.setState({displayText: 'X'});

        setTimeout(() => {
            if (this.attTexture) {
                if (!this.dead) {
                    this.setHealthTextures();
                    // this.setState({texture: bfrTexture});
                    // if (!bfrTexture) {
                    //     this.setState({texture: this.texture});
                    // }
                } else {
                    if (this.name == 'player') this.setState({texture: Textures.PLAYER_DEAD});
                    else this.setState({texture: Textures.DEAD});
                }
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

    calcMinDmg() { return 0; }
    calcMaxDmg() { return 1; }

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

        const creatures = GM.getOtherCreatures(this);

        const available = creatures.canSee.concat(GM.getWalls()).reduce((pre, cell) => {
            return pre && (nextPos.top >= cell.state.top + cell.size ||
                           nextPos.top + this.size <= cell.state.top ||
                           nextPos.left >= cell.state.left + cell.size ||
                           nextPos.left + this.size <= cell.state.left);
        }, true);

        if (this.name == 'player') {
             creatures.canSee.forEach(creature => !creature.mover && creature.moveRandom && creature.moveRandom());
        }

        if (available) return Promise.resolve(speed);
        else return this.beforeMove(direction, speed - 1);
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
        const min_dmg = this.calcMinDmg();
        const max_dmg = this.calcMaxDmg();

        let dmg = Math.random() * (max_dmg - min_dmg) + min_dmg;
        if (dmg < 0) dmg = 0;

        target.health -= dmg;
        target.onDamaged();

        this.hitSound.play();
    }

    onDamaged() {
        console.log(this.name + ' got damaged and has health ' + this.health);
        this.setState({health: this.health});
        if (this.health > 0 && this.health < this.maxHealth) this.setState({showHealth: true});
        if (this.health > 0 && this.health <= this.maxHealth * 0.3) {
            if (this.dmgTexture)
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
        console.log('ok got dead', this);
        this.setState({showHealth: false});
        this.dieSound.play();
        this.dead = true;        
    }

    render() {
        let cell = super.render();
        if (!this.state.showHealth) return cell;
        if (!this.state.revealed || this.state.fogged) return cell;

        return (
            <div>
                <healthbar style={{"top": this.state.top - 13 + 'px', 
                                  "left": this.state.left + 'px',
                                  "width": this.size + 'px',
                                  "border": '1px solid ' + this.healthColor
                                }}></healthbar>
                <healthfill style={{"top": this.state.top - 13 + 'px', 
                                  "left": this.state.left + 'px',
                                  "width": (this.size * this.state.health / this.maxHealth) + 'px',
                                  "background": this.healthColor
                                }}></healthfill>
                {cell}
            </div>
        );
    }
}


class NPCMoveManager {
    constructor() {
        this.requests = [];
        setInterval(_ => this.moveNpcs(), 40);
    }

    add(request) {
        if (request.execute && request.distance) this.requests.push(request);
        else console.log('Invalid request');
    }

    moveNpcs() {
        this.requests
            .sort((r1, r2) => r1.distance - r2.distance)
            .slice(0, 2)
            .forEach(request => request.execute());
        this.requests = [];
    }
}

const NPCMM = new NPCMoveManager();


class NPC extends Creature {
    constructor(props) {
        super();

        this.top = props.top || 40;
        this.left = props.left || 40;
        this.xp = 1;

        this.regenerate();
        this.hasGreeted = false;

    }

    componentDidMount() {
        super.componentDidMount();
        this.maxHealth = this.baseHealth * this.level;
        this.health = this.maxHealth;
    }


    moveRandom() {
        let direction = 'Up';

        function getRandomDir() {
            setTimeout(() => {
                direction = ['Up', 'Down', 'Left', 'Right'].sort((a, b) => Math.random() > 0.5)[0];
                getRandomDir();
            }, Math.random() * 1500);
        }

        getRandomDir();

        this.mover = setInterval(() => {
            let maxMoveRange = PM.player.vision + 2;
            if (maxMoveRange > 12) maxMoveRange = 12;

            if ((Math.pow(PM.player.top - this.top, 2) + Math.pow(PM.player.left - this.left, 2)) > Math.pow(maxMoveRange * CellSize, 2)) return;

            // let direction = ['Up', 'Down', 'Left', 'Right'].sort((a, b) => Math.random() > 0.5)[0];
            let alt_direction = '';
            const others = GM.getOtherCreatures(this);
            const player = others.canSee.filter(creature => creature.name == 'player')[0];

            if (player && !this.hasGreeted) {
                const canSeeMe = GM.getOtherCreatures(player).canSee.filter(creature => creature == this);

                if (canSeeMe) {
                    this.greetSound.play();
                    this.hasGreeted = true;
                }
            }

            if(player) {
                const dT = (this.top + (this.size / 2)) - (player.top + (player.size / 2));
                const dL = (this.left + (this.size / 2)) - (player.left + (player.size / 2));

                if (player.left + (player.size / 2) >= this.left + (this.size / 2)) direction = 'Right';
                if (player.left + (player.size / 2) < this.left + (this.size / 2)) direction = 'Left';
                if (player.top + (player.size / 2) >= this.top + (this.size / 2)) alt_direction = 'Down';
                if (player.top + (player.size / 2) < this.top + (this.size / 2)) alt_direction = 'Up';

                if (Math.abs(dT) > Math.abs(dL)) {
                   let tmp_direction = alt_direction;
                   alt_direction = direction;
                   direction = tmp_direction;
                } 

                const mayAttack = others.canAttack.filter(creature => creature.name == 'player')[0];
                if (mayAttack) {
                    this.attack();
                }
            }

            const dX = Math.pow((this.top + this.size / 2) - (PM.player.top + PM.player.size / 2), 2);
            const dY = Math.pow((this.left + this.size / 2) - (PM.player.left + PM.player.size / 2), 2);

            const moveRequest = {
                distance: dX + dY,
                execute: () => {
                    this
                        .move(direction)
                        .catch(err => { 
                            //console.log(`Monster cant move to ${direction}. Will try ${alt_direction}`);
                            return this.move(alt_direction);
                        })
                        .catch(err => {/* console.log('Cant move there either, giving up...') */ });
                }
            };
            
            NPCMM.add(moveRequest);
           
        }, 25);
    }

    onAttack() {
        console.log('Damaging player')
        this.damage(PM.player);
    }

    regenerate() {
        this.regenerationInterval = setInterval(() => {
            const amount = (this.level * this.regenerationRate / 4) / 16;
            if (this.health < this.maxHealth) {
                this.health += amount;
                if (this.health > this.maxHealth)
                    this.health = this.maxHealth;
            }

            if (this.health >= this.maxHealth) this.setState({showHealth: false});
            
            this.setHealthTextures(this.attacking);
            // if (this.health >= this.maxHealth * 0.3 && this.state.texture != this.texture && !this.attacking) 
            //     this.setState({texture: this.texture}); 

            this.setState({health: this.health});
        },250);
    }

    onDamaged() {
        super.onDamaged();
        if (this.health > 0) this.dmgSound.play();
    }

    setHealthTextures(opt_prevent_update) {
        if (this.health > this.maxHealth * 0.3) this.texture = this.defTexture;
        else if (this.health > 0) this.texture = this.dmgTexture;
        else this.texture = Textures.DEAD;

        if (!opt_prevent_update && this.state.texture != this.texture) this.setState({texture: this.texture});
       
    }

    calcMinDmg() { return (this.level - 1) * 2; }
    calcMaxDmg() { return this.power * (1 + 0.1 * this.level); }

    onDie() {
        super.onDie();
        this.setState({texture: Textures.DEAD});

        clearInterval(this.mover);
        clearInterval(this.regenerationInterval);
        this.mover = undefined;
        this.regenerate = undefined;

        let moddedXp = 0;
        if (PM.player.level < this.level) moddedXp = this.xp * 1.75;
        if (PM.player.level == this.level) moddedXp = this.xp;
        if (PM.player.level > this.level) moddedXp = this.xp * this.level / PM.player.level;

        PM.player.gainXP(moddedXp);
    }
}

class Zombie extends NPC {
    constructor(props) {
        super(props);
        this.name = 'zombie';
        this.texture = this.defTexture = Textures.ZOMBIE;
        this.dmgTexture = Textures.ZOMBIE_DMG;
        this.attTexture = Textures.ZOMBIE_ATT;
        this.greetSound = Sounds.ZOMBIE_GREET;
        this.hitSound = Sounds.ZOMBIE_HIT;
        this.dmgSound = Sounds.ZOMBIE_DMG;
        this.dieSound = Sounds.ZOMBIE_DIE;
        this.size = CellSize;
        this.xp = 7;
        this.vision = 2.5;
        this.range = 1;
        this.power = 2;
        this.speed = 1.5;
        this.attackSpeedHz = 0.5;
        this.baseHealth = 8;
        this.level = props.level || (Math.random() > 0.25 ? 1 : 2);
    }
}

class Skeleton extends NPC {
    constructor(props) {
        super(props);
        this.name = 'skeleton';
        this.texture = this.defTexture = Textures.SKELETON;
        this.dmgTexture = Textures.SKELETON_DMG;
        this.attTexture = Textures.SKELETON_ATT;
        this.greetSound = Sounds.SKELETON_GREET;
        this.hitSound = Sounds.SKELETON_HIT;
        this.dmgSound = Sounds.SKELETON_DMG;
        this.dieSound = Sounds.SKELETON_DIE;
        this.size = CellSize * 1.35;
        this.xp = 18;
        this.vision = 5;
        this.range = 1.35;
        this.power = 6;
        this.speed = 3.75;
        this.attackSpeedHz = 1;
        this.level = props.level || (Math.random() > 0.5 ? 2 : 3);
        this.baseHealth = 20;
    }
}

class Imp extends NPC {
    constructor(props) {
        super(props);
        this.name = 'imp';
        this.texture = this.defTexture = Textures.IMP;
        this.dmgTexture = Textures.IMP_DMG;
        this.attTexture = Textures.IMP_ATT;
        this.greetSound = Sounds.IMP_GREET;
        this.hitSound = Sounds.IMP_HIT;
        this.dmgSound = Sounds.IMP_DMG;
        this.dieSound = Sounds.IMP_DIE;
        this.size = CellSize * 1.8;
        this.xp = 31;
        this.vision = 7;
        this.range = 2;
        this.power = 6.5;
        this.speed = 7.5;
        this.attackSpeedHz = 1.5;
        this.baseHealth = 27;
        this.level = props.level || (Math.random() > 0.05 ? 4 : 5);
    }
}

class Boss extends NPC {
    constructor(props) {
        super(props);
        this.name = 'boss';
        this.texture = this.defTexture = Textures.BOSS;
        this.dmgTexture = Textures.BOSS_DMG;
        this.attTexture = Textures.BOSS_ATT;
        this.greetSound = Sounds.BOSS_GREET;
        this.hitSound = Sounds.BOSS_HIT;
        this.dmgSound = Sounds.BOSS_DMG;
        this.dieSound = Sounds.BOSS_DIE;
        this.size = CellSize * 4;
        this.xp = 150;
        this.vision = 10;
        this.range = 3.5;
        this.power = 15;
        this.speed = 5;
        this.attackSpeedHz = 1;
        this.baseHealth = 80;
        this.level = props.level || 7;   
        this.regenerationRate = 6; 
        this.state.range = this.range;
    }

    onDie() {
        super.onDie();
        GM.bossIsDead();
    }
}

class Player extends Creature {
    constructor() {
        super();
        this.name = 'player';

        const startingRoom = rooms[0];

        this.top = Math.floor(startingRoom.cY) * CellSize;
        this.left = Math.floor(startingRoom.cX) * CellSize;
        this.vision = 2.5;

        this.xp = 0;

        this.speed= 3.5;

        this.range = 1;
        this.state.range = this.range;

        this.power = 1.25;

        this.weapon = 'Punch';

        this.size = CellSize;

        this.health = 10;
        this.maxHealth = 10;

        this.attackSpeedHz = 1;

        // this.setHealthTextures();
        this.texture = Textures.PLAYER_HEALTHY;
        this.attTexture = Textures.PLAYER_HEALTHY_HIT;
        this.happyTexture = Textures.PLAYER_HEALTHY_HAPPY;

        this.swingSound = Sounds.SWING;
        this.walkSound = Sounds.WALK;
        this.walkSound2 = Sounds.WALK2;
        this.hitSound = Sounds.PUNCH;
        this.dieSound = Sounds.PLAYER_DIE;
        this.levelSound = Sounds.PLAYER_LEVEL;

        this.regenerationRate = 1;
        this.strength = 0;
        this.healthColor = 'rgba(1,112,212,1)';

        PM.register(this);

        this.regenerate();
        this.canPlayWalk = true;

        $(this.walkSound).on('ended', _ => this.canPlayWalk = true);
        $(this.walkSound2).on('ended', _ => this.canPlayWalk = true);
    }

    componentDidMount() {
        super.componentDidMount();
        EM.hud.update(this);
    }

    afterMove({direction, speed}){
        super.afterMove({direction, speed}); 
        const pickedup = GM.getPickups().filter(pickup => {
            return !(this.top >= pickup.state.top + pickup.size ||
                this.top + this.size <= pickup.state.top ||
                this.left >= pickup.state.left + pickup.size ||
                this.left + this.size <= pickup.state.left);
        })[0];

        if (pickedup) {
            pickedup.affect(this);
            EM.hud.update(this);
            this.beHappy();
        }

        if (this.canPlayWalk) {
            this.canPlayWalk = false;
            Math.random() > 0.35 ? this.walkSound.play() : this.walkSound2.play();
        }
    }

    beHappy() {
        //const prvTexture = this.state.texture;
        this.isHappy = true;
        this.setState({texture: this.happyTexture});
        setTimeout(_ => {
            this.setState({texture: this.texture});
            this.isHappy = false;
        }, 1200);
    }

    onAttack() {
        console.log("begin", GM.getOtherCreatures(this).canAttack);
        const target = GM.getOtherCreatures(this).canAttack[0];

        if (target) this.damage(target);
        else this.swingSound.play();
    }

    onAttackEnd() {
        console.log("end");
    }

    onDamaged() {
        super.onDamaged();
        EM.hud.update(this);
        this.setHealthTextures();
        if (this.health > 0) this.playDamagedSound();
    }

    setHealthTextures(opt_prevent_update) {
        if (this.health >= this.maxHealth * 0.8) {
            this.texture = Textures.PLAYER_HEALTHY;
            this.attTexture = Textures.PLAYER_HEALTHY_HIT;
            this.happyTexture = Textures.PLAYER_HEALTHY_HAPPY;
        } else if (this.health >= this.maxHealth * 0.6) {
            this.texture = Textures.PLAYER_OK;
            this.attTexture = Textures.PLAYER_OK_HIT;
            this.happyTexture = Textures.PLAYER_OK_HAPPY;
        } else if (this.health >= this.maxHealth * 0.4) {
            this.texture = Textures.PLAYER_WOUNDED;
            this.attTexture = Textures.PLAYER_WOUNDED_HIT;
            this.happyTexture = Textures.PLAYER_WOUNDED_HAPPY;
        } else if (this.health >= this.maxHealth * 0.2) {
            this.texture = Textures.PLAYER_CRITICAL;
            this.attTexture = Textures.PLAYER_CRITICAL_HIT;
            this.happyTexture = Textures.PLAYER_CRITICAL_HAPPY;
        } else if (this.health > 0) {
            this.texture = Textures.PLAYER_DEADLY;
            this.attTexture = Textures.PLAYER_DEADLY_HIT;
            this.happyTexture = Textures.PLAYER_DEADLY_HAPPY;
        } else this.texture = Textures.PLAYER_DEAD;

        if (!opt_prevent_update)
            if (this.health > 0 && this.state.texture != this.texture) this.setState({texture: this.texture});
    }

    playDamagedSound() {
        if (this.health > this.maxHealth * 0.75) Sounds.PLAYER_HEALTHY_HIT.play();
        else if (this.health > this.maxHealth * 0.5) Sounds.PLAYER_WOUNDED_HIT.play();
        else if (this.health > this.maxHealth * 0.25) Sounds.PLAYER_CRITICAL_HIT.play();
        else Sounds.PLAYER_DEADLY_HIT.play();
    }

    // calcMinDmg() { return (this.power + this.strength / 5) * (this.level - 1 / this.level); }
    calcMinDmg() { return Math.pow(this.power + this.strength / 5, 1 - 1 / this.level); }
    calcMaxDmg() { return Math.pow(this.power + this.strength / 5, 1 + (this.level - 1) / 10); }
    // calcMaxDmg() { return (this.power + this.strength / 5) * (this.level + (this.level - 1) / 10); }

    gainXP(xp) {
        this.xp += xp;
        while (this.xp >= 10 * (this.level * (this.level + 1) / 2)) {
            this.levelUp();
        }

        EM.hud.update(this);
    }

    levelUp() {
        this.beHappy();
        this.level++;
        this.maxHealth = this.level * 10;
        if (this.health < this.maxHealth - 10) this.health += 10;
        else if (this.health < this.maxHealth) this.health = this.maxHealth;

        this.range += 0.1;
        this.setState({range: this.range});

        this.attackSpeedHz += 0.05;
        this.vision += 0.5;
        this.speed += 1;
        this.strength += 2;

        this.regenerationRate += 0.125;
        this.levelSound.play();
        this.setHealthTextures();
    }

    cheat() {
        this.vision = 200;
        this.speed = 15;
        this.strength = 40;
        this.range = 7.5;
        this.setState({range: this.range});
        this.regenerationRate += 5;
        this.power = 10;
        this.attackSpeedHz = 4;
        this.health = 1000;

        EM.hud.update(this); 
        this.levelSound.play();   
        this.updateOverlayState();
        EM.dispatch('updateOverlayState')
    }

    regenerate() {
        this.regenerationInterval = setInterval(() => {
            const amount = (this.level * this.regenerationRate / 4) / 8;
            if (this.health < this.maxHealth) {
                this.health += amount;
                if (this.health > this.maxHealth)
                    this.health = this.maxHealth;

                EM.hud.update(this);
            }
            if (this.health >= this.maxHealth) this.setState({showHealth: false});
            this.setState({health: this.health});
            this.setHealthTextures(this.attacking || this.isHappy);
        },250);
    }

    onDie() {
        super.onDie();
        clearInterval(this.regenerationInterval);
        this.setHealthTextures();
        this.regenerationInterval = undefined;
        GM.playerIsDead();
        this.setState({texture: Textures.PLAYER_DEAD});
    }
}

class PlayerHUD extends React.Component {
    constructor() {
        super();
        EM.hud = this;
        this.state = {player: {health: 0, maxHealth: 0,damage: 0, level: 0, power: 0, weapon: '', vision: 0, speed: 0, range: 0, attackSpeedHz: 0, xp: 0, regenerationRate: 0, calcMinDmg: () => 0, calcMaxDmg: () => 0}};
    }

    update(player) {
        this.setState({player});
    }

    render() {
        const min_dmg = this.state.player.calcMinDmg();//(this.state.player.power + this.state.player.strength / 5) * (this.state.player.level - 1 / this.state.player.level);
        const max_dmg = this.state.player.calcMaxDmg();//(this.state.player.power + this.state.player.strength / 5) * (this.state.player.level + (this.state.player.level - 1) / 10);

        return (
            <hud>
                <huditem>Level: {this.state.player.level}</huditem>
                <huditem>Health: {this.state.player.health.toFixed(1)} / {this.state.player.maxHealth}</huditem>
                <huditem>Weapon: {this.state.player.weapon}</huditem>
                <huditem>Damage: {min_dmg.toFixed(1)} ~ {max_dmg.toFixed(1)}</huditem>
                <huditem>Att. Per Sec.: {this.state.player.attackSpeedHz.toFixed(2)}</huditem>
                <huditem>Dmg. Per Sec.: {(this.state.player.attackSpeedHz * (min_dmg + max_dmg) / 2).toFixed(2)}</huditem>
                <huditem>Att. Range: {this.state.player.range.toFixed(2)}</huditem>
                <huditem>Vision: {this.state.player.vision.toFixed(1)}</huditem>
                <huditem>Walk Speed: {this.state.player.speed}</huditem>
                <huditem>Regeneration Rate: {this.state.player.regenerationRate.toFixed(2)}</huditem>
                <huditem>XP: {this.state.player.xp.toFixed(1)} / {this.state.player.level * (this.state.player.level + 1) * 10 / 2}</huditem>
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
        this.state.shown = false;
        this.pickupSound = Sounds.PICKUP;
        this.size = CellSize / 2;
        this.pickupText = '';
    }

    affect(player) {
        this.pickupSound.play();
        this.setState({used: true});
    }

    render() {
        if (this.state.used) {
            setTimeout(_ => this.setState({shown: true}), 1500);

            if (this.state.shown) return (<div></div>);
            else return (<pickup-text style={{"top": this.state.top + 'px', 
                                              "left": this.state.left + 'px',
                                              "width": '250px'}}>
                        {this.pickupText}</pickup-text>);
        }


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
        player.health += 15;
        this.pickupText = '+15 Health';        
        super.affect(player);
        player.setHealthTextures();
    }
}

class Speed extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.SPEED;
        this.pickupType = 'speed';
    }

    affect(player) {
        const amount = Math.floor(Math.random() * 4) + 1;
        player.speed += amount;
        this.pickupText = `+${amount.toFixed(2)} Walk speed`;   
        super.affect(player);
    }
}

class AttackSpeed extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.ATTACKSPEED;
        this.pickupType = 'attackSpeedHz';
    }

    affect(player) {
        const amount = Math.random();
        player.attackSpeedHz += amount;
        if (player.attackSpeedHz <= 0) player.attackSpeedHz = 5;
        this.pickupText = `+${amount.toFixed(2)} Attack speed`;        
        super.affect(player);
    }
}

class Vision extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.VISION;
        this.pickupType = 'vision';
    }

    affect(player) {
        const amount = Math.random() / 2;
        player.vision += amount;
        this.pickupText = `+${amount.toFixed(2)} Vision`;              
        super.affect(player);
    }
}

class Range extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.RANGE;
        this.pickupType = 'range';
    }

    affect(player) {
        const amount = Math.random() / 3;
        player.range += amount;      
        player.setState({range: player.range});
        this.pickupText = `+${amount.toFixed(2)} Attack range`;        

        if (player.range > player.vision)
            player.vision = player.range;
        super.affect(player);
    }
}

class Strength extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.STRENGTH;
        this.pickupType = 'strength';
    }

    affect(player) {
        const amount = Math.floor(Math.random() * 6) + 1;
        player.strength += amount;
        this.pickupText = `+${amount.toFixed(2)} Strength`;           
        super.affect(player);
    }
}

class Regeneration extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.REGENERATION;
        this.pickupType = 'regeneration';
    }

    affect(player) {
        const amount = Math.random() / 1.2; 
        player.regenerationRate += amount;  
        this.pickupText = `+${amount.toFixed(2)} Regeneration`;           
        super.affect(player);
    }
}

class Weapon extends PickUp {
    constructor(...args) { 
        super(...args);
        this.pickupType = 'power';
    }

    affect(player) {
        super.affect(player);
    }
}

class Knife extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.KNIFE;
    }

    affect(player) {
        this.pickupText = player.power <= 3 ? `Picked up Knife` : 'Dismissing weapon';           
        super.affect(player);
        if (player.power > 3) return;

        player.weapon = 'Knife';
        player.power = 3; 
        player.hitSound = Sounds.KNIFE;
        
    }    
}

class Katana extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.KATANA;
    } 

    affect(player) {
        this.pickupText = player.power <= 5 ? `Picked up Katana` : 'Dismissing weapon';           
        super.affect(player);
        if (player.power > 5) return;

        player.weapon = 'Katana';
        player.power = 5;
        player.hitSound = Sounds.KATANA;
        
    } 
}

class Halberd extends PickUp {
    constructor(...args) { 
        super(...args);
        this.texture = Textures.HALBERD;
    }

    affect(player) {
        this.pickupText = player.power <= 7 ? `Picked up Halberd` : 'Dismissing weapon';           
        super.affect(player);
        if (player.power > 7) return;

        player.weapon = 'Halberd';
        player.power = 7;  
        player.hitSound = Sounds.HALBERD;
        
    }  
}


class GameWindow extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.state.gameStarted = false;
        this.state.endMessage = '';
        this.state.gameEnd = false;
        this.state.pickups = [];
        this.state.player = <Player/>;
        this.state.pickups = rooms.map((room, id) => {
            if (id == rooms.length - 1) return ('');

            let pickup = '';
            let pickup2 = '';
            let pickup3 = '';

            if (id == 0 || Math.random() > 0.05) {
                pickup = this.generateRandomPickupInPosition(this.generateRandomPointInRoom(room));
                if (Math.random() > 0.5) {
                    pickup2 = this.generateRandomPickupInPosition(this.generateRandomPointInRoom(room));
                    if (Math.random() > 0.15)
                        pickup3 = this.generateRandomPickupInPosition(this.generateRandomPointInRoom(room));
                }
            }

            return (
                <div key={'p' + id}>
                    {pickup}
                    {pickup2}
                    {pickup3}
                </div>
            );
        });

        this.state.creatures = rooms.map((room, id) => {
            const creatures = this.generateRandomEnemiesInRoom(room, id / (rooms.length - 1));
            return (
                <div key={'room' + id}>
                    {creatures}
                </div>
            );
        });

        GM.registerWindow(this);
    }

    playerIsDead() {
        this.setState({gameEnd: true, endMessage: 'You are dead'});
        console.log('hello player');
    }

    bossIsDead() {
        this.setState({gameEnd: true, endMessage: 'You killed the boss!'});
        console.log('hello boss');
    }

    generateRandomPointInRoom(room) {
        return {
            x: (room.x + 1) + Math.random() * (room.width - 2),
            y: (room.y + 1) + Math.random() * (room.height - 2)
        };
    };

    generateRandomEnemyInPosition(pos, hardness) {
        const randomID = this.generateRandomId();
        const hardIncrLevel = Math.random() > 0.9 ? 1 : 0;
        const defIncrLevel = Math.random() > 0.5 ? 1 : 0;
        
        if (hardness == 0){
            return '';
        } else if (hardness < 0.2) {
            return <Zombie key={'npc' + randomID} top={pos.y * CellSize - CellSize / 2} left={pos.x * CellSize - CellSize / 2} level={1}/>
        } else if (hardness < 0.4) {
            if (Math.random() < 0.75)
                return <Zombie key={'npc' + randomID} top={pos.y * CellSize - CellSize / 2} left={pos.x * CellSize - CellSize / 2} level={2 + hardIncrLevel}/>
            else
                return <Skeleton key={'npc' + randomID} top={pos.y * CellSize - CellSize * 1.35 / 2} left={pos.x * CellSize - CellSize * 1.35 / 2} level={2}/>
        } else if (hardness < 0.6) {
            return <Skeleton key={'npc' + randomID} top={pos.y * CellSize - CellSize * 1.35 / 2} left={pos.x * CellSize - CellSize * 1.35 / 2} level={2 + defIncrLevel + hardIncrLevel}/>
        } else if (hardness < 0.8) {
            if (Math.random() < 0.75)
                return <Skeleton key={'npc' + randomID} top={pos.y * CellSize - CellSize * 1.35 / 2} left={pos.x * CellSize - CellSize * 1.35 / 2} level={3 + defIncrLevel}/>
            else
                return <Imp key={'npc' + randomID} top={pos.y * CellSize - CellSize * 1.8 / 2} left={pos.x * CellSize - CellSize * 1.8 / 2} level={3 + hardIncrLevel}/>
        } else if (hardness < 1) {
            return <Imp key={'npc' + randomID} top={pos.y * CellSize - CellSize * 1.8 / 2} left={pos.x * CellSize - CellSize * 1.8 / 2} level={4 + defIncrLevel}/>
        } else
            return <Boss key={'npc' + randomID} top={pos.y * CellSize - CellSize * 4 / 2} left={pos.x * CellSize - CellSize * 4 / 2} level={7}/>
    }

    generateRandomEnemiesInRoom(room, hardness) {
        if (hardness == 0) return '';
        if (hardness == 1) return [this.generateRandomEnemyInPosition({x: room.cX, y: room.cY}, 1)]

        const maxCount = Math.ceil(10 * (1 - hardness));
        const actualCount = hardness < 1 ? Math.ceil(Math.random() * maxCount) : 1;
        let positions = [];

        for (var i = 0; i < actualCount; i++) {
            let retry = 1000;
            let available = false;
            let pos;
            while (!available && retry > 0) {
                pos = this.generateRandomPointInRoom(room);
                available = positions.reduce((pre, cur) => {
                    return pre && (pos.y >= cur.y + 2 ||
                                   pos.y + 2 <= cur.y ||
                                   pos.x >= cur.x + 2 ||
                                   pos.x + 2 <= cur.x);
                }, true);

                retry--;
            }

            if (available) positions.push(pos);
        }

        return positions.map(pos => this.generateRandomEnemyInPosition(pos, hardness));
    }

    generateRandomPickupInPosition(pos) {        
        const val = Math.floor(Math.random() * 8);
        const randomID = this.generateRandomId();

        switch (val) {
            case 0: return <Health key={randomID} i={pos.y} j={pos.x}/>
            case 1: return <Speed key={randomID} i={pos.y} j={pos.x}/>
            case 2: return <AttackSpeed key={randomID} i={pos.y} j={pos.x}/>
            case 3: return <Vision key={randomID} i={pos.y} j={pos.x}/>
            case 4: return <Range key={randomID} i={pos.y} j={pos.x}/>
            case 5: return <Strength key={randomID} i={pos.y} j={pos.x}/>
            case 6: return <Regeneration key={randomID} i={pos.y} j={pos.x}/>
            case 7: 
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

        const pressedKeys = [];
        $('body').get(0).addEventListener('keyup', e => pressedKeys[e.keyCode] = false );
        $('body').get(0).addEventListener('keydown', e => {
            pressedKeys[e.keyCode] = true;
            if (pressedKeys[39] || pressedKeys[37] || pressedKeys[38] || pressedKeys[40] || pressedKeys[32])
                e.preventDefault(); 
        });

        setInterval(_ => {
            if (pressedKeys[39]) GM.playerMove('Right');
            if (pressedKeys[38]) GM.playerMove('Up');
            if (pressedKeys[37]) GM.playerMove('Left');
            if (pressedKeys[40]) GM.playerMove('Down');

            if (pressedKeys[32]) GM.playerAttack();

            if (pressedKeys[65] && pressedKeys[83] && pressedKeys[68] && pressedKeys[70]) PM.player.cheat();
        }, 40);
    }

    start() {
        this.setState({gameStarted: true});
        GM.focusToPlayer();
        Sounds.THEME.play();     
    }

    restart() {
        window.location.reload();
    }

    render() {
        const player = this.state.player;
        const creatures = this.state.creatures;
        const pickups = this.state.pickups;

        let endingMessage = '';

        if (this.state.gameEnd) {
            endingMessage = <ender><msg>{this.state.endMessage}</msg><rld onClick={this.restart}>Play Again</rld></ender>;
        }

        let startingMessage = '';

        if (!this.state.gameStarted) {
            startingMessage = 
                            <starter>
                                <heading>Welcome to Batilc's Dungeon</heading>
                                <heading2>Instructions</heading2>
                                <ul>
                                    <li> Arrows to move </li>
                                    <li> Space to attack </li>
                                    <li> Scroll around to see the map you discovered so far </li>
                                    <li> Kill the boss somewhere in the dungeon </li>
                                    <li> Have fun! </li>
                                </ul>
                                <heading2>Gamer's Guide</heading2>
                                <ul>
                                    <li> Scroll down on this popup to get to the `close` button :) </li>
                                    <li> Try to have your screen size at least 800 x 600 </li>
                                    <li> Everything is generated at random </li>
                                    <li> Each room (except start) contains 1 or more monsters </li>
                                    <li> Each room (except boss room) may contain up to 3 upgrades. Make sure you collect them all</li>
                                    <li> A monster's skin changes when it attacks and damages you </li>
                                    <li> A monster's skin changes when it has low health. It regenerates health as well </li>
                                    <li> Monsters get tougher the more you get away from the starting room. Don't wander off until you are strong enough </li>
                                    <li> The white circle indicates your reach. Time to time, you may kite the monsters </li>
                                    <li> You can hold space button to maximize your DPS </li>
                                    <li> Picking up another weapon overrides your current one only if it is better.</li>
                                    <li> Make sure to reach a high level before fighting the boss </li>
                                    <li> If RNJesus hates you, you may not be able to facetank the boss although you cleared out the whole map </li>
                                    <li> You will know its the boss when you see it </li>
                                </ul>
                                <dismiss onClick={this.start.bind(this)}> Close </dismiss>
                            </starter>
        }

        return (
            <div>
                {startingMessage}
                <Map/>
                {creatures}
                {pickups}
                {player}
                <PlayerHUD/>
                {endingMessage}
            </div>
        );
    }
}

ReactDOM.render(<GameWindow />, $('background').get(0));
