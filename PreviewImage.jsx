PreviewImage = React.createClass({
    propTypes: {
        // This component gets the task to display through a React prop.
        // We can use propTypes to indicate it is required
        file: React.PropTypes.object.isRequired
    },

    componentDidMount: function() {
        var preview = this.refs.preview.getDOMNode();
        var file = this.props.file;
        var reader = new FileReader();
        reader.onloadend = function () {
            preview.src = reader.result;
        }
        reader.readAsDataURL(file);
    },

    render() {
        return (
            <img onClick={this.deleteThisTask} height="200" ref="preview" />

        );
    }
});