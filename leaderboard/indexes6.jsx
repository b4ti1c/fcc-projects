class User extends React.Component {
    clickHandler() {
        let url = 'http://freecodecamp.com/' + this.props.info.username;
        window.open(url,'_blank');
    }

    render() {
        return (
            <tr onClick={this.clickHandler}>
                <td className="text-center" onClick={this.clickHandler}>{this.props.index}</td>
                <td onClick={this.clickHandler}>
                    <img className="userpic" src={this.props.info.img} width="30"/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{this.props.info.username}
                </td>
                <td className="text-center" onClick={this.clickHandler}>{this.props.info.recent}</td>
                <td className="text-center" onClick={this.clickHandler}>{this.props.info.alltime}</td>
            </tr>
        );
    }
}


class Leaderboard extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {board: []};
    }


    getRecent() {
        return $.ajax({
            url: 'http://fcctop100.herokuapp.com/api/fccusers/top/recent',
            method: 'GET'
        });
    }

    componentDidMount() {
        this
            .getRecent()
            .then(board => this.setState({board}))
            .then(() => this.sortByRecent());
    }

    sortByRecent() {
        this.setState({board: this.state.board.sort((a, b) => b.recent - a.recent)})

        $('.sorter:nth-child(3n)').addClass('selected');
        $('.sorter:nth-child(4n)').removeClass('selected');
    }

    sortByTotal() {
        this.setState({board: this.state.board.sort((a, b) => b.alltime - a.alltime)})

        $('.sorter:nth-child(4n)').addClass('selected');
        $('.sorter:nth-child(3n)').removeClass('selected');
    }

    render() {
        var users = this.state.board.map((user, index) => (<User info={user} index={index + 1}/>));

        return (
                <div className="container-fluid">
                    <h1 className="text-center">FreeCodeCamp Leaderboard</h1>
                    <table className="board table">
                        <thead>
                            <tr>
                                <th className="text-center col-md-2">Rank</th>
                                <th className="col-md-4">Camper</th>
                                <th className="sorter text-center col-md-3" onClick={this.sortByRecent.bind(this)}>Recent</th>
                                <th className="sorter text-center col-md-3" onClick={this.sortByTotal.bind(this)}>All Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users}
                        </tbody>
                    </table>
                </div>    
            );
    }
}



ReactDOM.render(<Leaderboard/>, $('background').get(0));