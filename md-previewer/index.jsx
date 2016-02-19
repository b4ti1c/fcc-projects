var Previewer = React.createClass({
    getInitialState: function(){
      return {text: "Your markdown will be rendered here..."};
    },
    addChar: function(e){
      this.setState({text: e.target.value || "Your markdown will be rendered here..."});
    },
    rawMarkup: function() {
        var rawMarkup = marked(this.state.text, {sanitize: true});
        return { __html: rawMarkup };
    },
    render: function() {
        return (
          <previewer>
            <textarea id="markdown" onChange={this.addChar} placeholder="Enter markdown here...">
            </textarea>
            <preview-title>Your Preview</preview-title>
            <preview>
             <span dangerouslySetInnerHTML={this.rawMarkup()} />
            </preview>
          </previewer>
        );
    }
});

ReactDOM.render(
  <Previewer />,
  $('background')[0]
);