PreviewImage = React.createClass({
    propTypes: {
        // This component gets the task to display through a React prop.
        // We can use propTypes to indicate it is required
        file: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
        return {src: ''};
    },

    componentDidMount: function() {
        //var preview = this.refs.preview.getDOMNode();
        var file = this.props.file;
        var reader = new FileReader();
        reader.onloadend = function () {
            //preview.src = reader.result;
            this.setState({src: reader.result});
        }.bind(this);
        reader.readAsDataURL(file);
    },

    deleteThisTask() {
        this.props.onDelete(this.props.index);
    },

    render() {
        return (
            <img onClick={this.deleteThisTask} height="200" ref="preview" src={this.state.src} />

        );
    }
});