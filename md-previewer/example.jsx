var comments = [
  {id: 1, author: "Pete Hujnt", text: "This is one comment"},
  {id: 2, author: "Jordan Walkes", text: "This is *another* comment"}
];

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.comments.map(function(comment) {
          return (
            <Comment author={comment.author} key={comment.id}>
              {comment.text}
            </Comment>
          );
        });

    return (
      <div className="commentList">
         {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleClick: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }

    this.props.onCommentSubmit({author: author, text: text, id: Math.floor(Math.random() * 1000)});
    // TODO: send request to the server
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className="commentForm">
        <input type="text" placeholder="Your name" value={this.state.author} onChange={this.handleAuthorChange}/>
        <input type="text" placeholder="Say something..." value={this.state.text} onChange={this.handleTextChange}/>
        <button onClick={this.handleClick}>Add</button>
      </form>
    );
  }
});

var CommentBox = React.createClass({
  getInitialState: function() {
    return {comments: []};
  },
  loadComments: function() {
    setTimeout(function(){
        this.setState({
            comments: comments
        });
    }.bind(this), 1000);
  },
  componentDidMount: function(){
    setInterval(this.loadComments, this.props.pollInterval);
  },
  handleCommentSubmit: function(comment) {
    comments.push(comment);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList comments={this.state.comments}/>
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    );
  }
});

var Comment = React.createClass({
    rawMarkup: function() {
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return { __html: rawMarkup };
    },
    render: function() {
        return (
          <div className="comment">
            <h2 className="commentAuthor">
              {this.props.author}
            </h2>
           <span dangerouslySetInnerHTML={this.rawMarkup()} />
          </div>
        );
    }
});

ReactDOM.render(
  <CommentBox url='/something' pollInterval={5000}/>,
  $('background')[0]
);