// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by over-population.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
class CellManager {
    constructor(width, height) {
        this.cells = {};

        this.width = width;
        this.height = height;
        this.total = width * height;
    }

    register(id, methods) {
        this.cells[id] = methods;
    }

    updateCell(id, state) {
        this.cells[id] && this.cells[id].isAlive() != state && this.cells[id].set(state);
    }

    updateAll(state) {
        if(!state) state = false;
        Object.keys(this.cells).forEach(id => this.cells[id].set(state));
    }

    computeNeighborIds(id) {
        id = parseInt(id, 10);

        let tl = id - this.width - 1, 
            t = id - this.width ,
            tr = id - this.width + 1,
            l = id - 1, 
            r = id + 1, 
            bl = id + this.width - 1, 
            b = id + this.width, 
            br = id + this.width + 1;

        if (id % this.width == 0) {  //cell is on the right edge
            tr = id - this.width - this.width + 1;
            r = id - this.width + 1;
            br = id + 1;
        }

        if ((id - 1) % this.width == 0) {  //cell is on the left edge
            tl = id - 1;
            l = id + this.width - 1;
            bl = id + this.width + this.width - 1;
        }

        if (id <= this.width) {  //cell is on the top edge
            tl = id + this.width * (this.height - 1) - 1;
            t = id + this.width * (this.height - 1);
            tr = id + this.width * (this.height - 1) + 1;
        }

        if (id > this.width * (this.height - 1)) {  //cell is on the bottom edge
            bl = id - this.width * (this.height - 1) - 1;
            b = id - this.width * (this.height - 1);
            br = id - this.width * (this.height - 1) + 1;
        }

        //More controls for extreme cells on both of the edges
        
        if ((id - 1) % this.width == 0 && id <= this.width) //top-left cell
            tl = this.width * this.height;
        if ((id - 1) % this.width == 0 && id > this.width * (this.height - 1)) //bottom-left cell
            bl = this.width;
        if (id % this.width == 0 && id <= this.width) //top-right cell
            tr = this.width * (this.height - 1) + 1;
        if (id % this.width == 0 && id > this.width * (this.height - 1)) //bottom-right cell
            br = 1;

        return [tl, t, tr, l, r, bl, b, br];
    }

    iterate() {
        let newGeneration = {};

        Object.keys(this.cells).forEach(id => {
            let cell = this.cells[id];
            let neighbours = this.computeNeighborIds(id);

            let aliveNeighbourCount = neighbours.map(id => this.cells[id].isAlive())
                                                .reduce((prev, cur) => {
                                                    if (cur) return prev + 1;
                                                    return prev;
                                                }, 0);
            let cellFate = false;

            if (aliveNeighbourCount == 3 ||
                aliveNeighbourCount == 2 && cell.isAlive())
                cellFate = true;

            newGeneration[id] = cellFate;
        });

        Object.keys(newGeneration).forEach(id => this.updateCell(id, newGeneration[id]));
    }
}

const CM = new CellManager(75, 50);


class Cell extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {};
        this.state.alive = false;

        CM.register(this.props.id, {
            isAlive: () => this.state.alive,
            set: this.toggleLife.bind(this)
        });
    }

    toggleLife(alive) {
        if(alive == undefined || alive == null)
            alive = !this.state.alive;
        this.setState({alive});
    }

    mouseDown() {
        this.toggleLife();
        this.props.mouseIsDown(!this.state.alive);
    }

    mouseOver() {
        if(this.props.hasMouseDown)
            this.toggleLife(this.props.firstLifeEvent);
    }

    render() {
        return (
            <cell 
                className={this.state.alive ? 'alive' : ''} 
                onMouseDown={this.mouseDown.bind(this)}
                onMouseOver={this.mouseOver.bind(this)}
                onMouseUp={this.props.mouseIsUp}
            ></cell>
        );
    }
}


class Grid extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {};
        this.state.hasMouseDown = false;
        this.state.newLife = false;

        $('body').bind('mouseup', this.mouseEvent.bind(this, false, ''));
    }

    mouseEvent(hasMouseDown, newLife) {
        this.setState({hasMouseDown, newLife});
    }

    render() {
        let cells = new Array(CM.total).fill('0').map((x, index) => 
            <Cell 
                key={index + 1}
                id={index + 1}
                hasMouseDown={this.state.hasMouseDown}
                firstLifeEvent={this.state.newLife}
                mouseIsDown={this.mouseEvent.bind(this, true)}
                mouseIsUp={this.mouseEvent.bind(this, false, '')}
            />
        );
        return (
            <grid>
                {cells}
                <div style={{clear: "left"}}></div>
            </grid>
        );
    }
}

class GameControl extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.state.running = false;
        this.state.symbol = '';

        this.interval = 100;
    }

    componentDidMount() {
        this.reset();
    }

    toggleRun(running) {
        if (running == null || running == undefined)
            running = !this.state.running;

        this.setState({running});

        if (running) this.setState({symbol: 'fa fa-pause-circle-o'});
        else this.setState({symbol: 'fa fa-play-circle-o'});

        if (running) {
            this.iterator = () => {
                CM.iterate();
                this.setState({generation: this.state.generation + 1});
                this.timeout = setTimeout(this.iterator.bind(this), this.interval);
            }

            this.timeout = setTimeout(this.iterator.bind(this), this.interval);
        } else {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    reset() {
        this.toggleRun(false);
        this.setState({generation: 0});
        CM.updateAll(false);
        setTimeout(this.drawShapes, 10);
    }

    fill() {
        CM.updateAll(true);
    }

    decreaseSpeed() {
        this.interval *= 1.25;
        if(this.interval > 1000) this.interval = 1000;
    }

    increaseSpeed() {
        this.interval *= 0.75;
        if(this.interval < 5) this.interval = 5;
    }

    drawShapes() {
        CM.updateCell(74, true);
        CM.updateCell(148, true);
        CM.updateCell(223, true);
        CM.updateCell(224, true);
        CM.updateCell(225, true);


        //A big spaceship
        CM.updateCell(3222, true);
        CM.updateCell(3225, true);
        CM.updateCell(3375, true);
        CM.updateCell(3371, true);
        CM.updateCell(3296, true);
        CM.updateCell(3446, true);
        CM.updateCell(3447, true);
        CM.updateCell(3448, true);
        CM.updateCell(3449, true);

        //Turret
        CM.updateCell(377, true);
        CM.updateCell(378, true);
        CM.updateCell(452, true);
        CM.updateCell(453, true);

        CM.updateCell(387, true);
        CM.updateCell(462, true);
        CM.updateCell(537, true);

        CM.updateCell(313, true);
        CM.updateCell(239, true);
        CM.updateCell(240, true);
        CM.updateCell(613, true);
        CM.updateCell(689, true);
        CM.updateCell(690, true);
        
        CM.updateCell(317, true);
        CM.updateCell(393, true);
        CM.updateCell(469, true);
        CM.updateCell(543, true);
        CM.updateCell(617, true);
        CM.updateCell(468, true);
        CM.updateCell(466, true);

        CM.updateCell(397, true);
        CM.updateCell(322, true);
        CM.updateCell(247, true);
        CM.updateCell(398, true);
        CM.updateCell(323, true);
        CM.updateCell(248, true);

        CM.updateCell(174, true);
        CM.updateCell(474, true);

        CM.updateCell(101, true);
        CM.updateCell(176, true);
        CM.updateCell(476, true);
        CM.updateCell(551, true);

        CM.updateCell(261, true);
        CM.updateCell(262, true);
        CM.updateCell(336, true);
        CM.updateCell(337, true);
        
        //Laser Gun
        // CM.updateCell(3660 - 750, true);
        // CM.updateCell(3659 - 750, true);
        // CM.updateCell(3658 - 750, true);
        // CM.updateCell(3657 - 750, true);
        // CM.updateCell(3656 - 750, true);

        // CM.updateCell(3654 - 750, true);
        // CM.updateCell(3653 - 750, true);
        // CM.updateCell(3652 - 750, true);
        // CM.updateCell(3651 - 750, true);
        // CM.updateCell(3650 - 750, true);
        // CM.updateCell(3649 - 750, true);
        // CM.updateCell(3648 - 750, true);

        // CM.updateCell(3641 - 750, true);
        // CM.updateCell(3640 - 750, true);
        // CM.updateCell(3639 - 750, true);

        // CM.updateCell(3635 - 750, true);
        // CM.updateCell(3634 - 750, true);
        // CM.updateCell(3633 - 750, true);
        // CM.updateCell(3632 - 750, true);
        // CM.updateCell(3631 - 750, true);

        // CM.updateCell(3629 - 750, true);
        // CM.updateCell(3628 - 750, true);
        // CM.updateCell(3627 - 750, true);
        // CM.updateCell(3626 - 750, true);
        // CM.updateCell(3625 - 750, true);
        // CM.updateCell(3624 - 750, true);
        // CM.updateCell(3623 - 750, true);
        // CM.updateCell(3622 - 750, true);


        //15-perioder
        CM.updateCell(1194 - 75 + 300, true);
        CM.updateCell(1194 - 150 + 300, true);
        CM.updateCell(1193 + 300, true);
        CM.updateCell(1195 + 300, true);
        CM.updateCell(1194 + 75 + 300, true);
        CM.updateCell(1194 + 150 + 300, true);
        CM.updateCell(1194 + 225 + 300, true);
        CM.updateCell(1194 + 300 + 300, true);
        CM.updateCell(1194 + 375 + 1 + 300, true);
        CM.updateCell(1194 + 375 - 1 + 300, true);
        CM.updateCell(1194 + 450 + 300, true);
        CM.updateCell(1194 + 525 + 300, true); 
    }

    render() {
        return (
            <starter>
                <i className={this.state.symbol} onClick={this.toggleRun.bind(this, !this.state.running)}></i>
                <i className="fa fa-repeat" onClick={this.reset.bind(this)}></i>
                <i className={"fa fa-th-large"} onClick={this.fill.bind(this)}></i>
                <div id="gen-display">
                    <span> Generation: </span>
                    <label>{this.state.generation}</label>
                </div>
                <div id="speed-control">
                    <span> Speed: </span>
                    <i className="fa fa-minus-square" onClick={this.decreaseSpeed.bind(this)}></i>
                    <i className="fa fa-plus-square" onClick={this.increaseSpeed.bind(this)}></i>
                </div>
            </starter>
        );
    }
}


class Menu extends React.Component {
    render() {
        return (
            <div>
                <GameControl/>
                <Grid/>
            </div>
        );
    }
}


ReactDOM.render(<Menu />,$('background').get(0));
