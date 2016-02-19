var User = React.createClass({
    clickHandler: function() {
        let url = 'http://freecodecamp.com/' + this.props.info.username;
        window.open(url,'_blank');
    },
    render: function() {
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
});


var Leaderboard = React.createClass({
    getInitialState: () => ({board: []}),

    getRecent: () => $.ajax({
        url: 'http://fcctop100.herokuapp.com/api/fccusers/top/recent',
        method: 'GET'
    }),

    componentDidMount: function(){
        this
            .getRecent()
            .then(board => this.setState({board}))
            .then(this.sortByRecent);
    },

    sortByRecent: function(opt_board) {
        this.setState({board: this.state.board.sort((a, b) => b.recent - a.recent)})

        $('.sorter:nth-child(3n)').addClass('selected');
        $('.sorter:nth-child(4n)').removeClass('selected');
    },

    sortByTotal: function(opt_board) {
        this.setState({board: this.state.board.sort((a, b) => b.alltime - a.alltime)})

        $('.sorter:nth-child(4n)').addClass('selected');
        $('.sorter:nth-child(3n)').removeClass('selected');
    },

    render: function() {
        var users = this.state.board.map((user, index) => (<User info={user} index={index + 1}/>));

        return (
                <div className="container-fluid">
                    <h1 className="text-center">FreeCodeCamp Leaderboard</h1>
                    <table className="board table">
                        <thead>
                            <tr>
                                <th className="text-center col-md-2">Rank</th>
                                <th className="col-md-4">Camper</th>
                                <th className="sorter text-center col-md-3" onClick={this.sortByRecent}>Recent</th>
                                <th className="sorter text-center col-md-3" onClick={this.sortByTotal}>All Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users}
                        </tbody>
                    </table>
                </div>    
            );
    }
});


ReactDOM.render(
  <Leaderboard />,
  $('background')[0]
);
