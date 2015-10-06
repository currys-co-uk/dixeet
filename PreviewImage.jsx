PreviewImage = React.createClass({
    propTypes: {
        file: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
        return {src: ''};
    },

    componentDidMount: function() {
        var file = this.props.file;
        this.setImageSrc(file);
    },

    componentWillReceiveProps(nextProps) {
        var file = nextProps.file;
        this.setImageSrc(file);
    },

    setImageSrc(file) {
        var reader = new FileReader();
        reader.onloadend = function () {
            this.setState({src: reader.result});
        }.bind(this);
        reader.readAsDataURL(file);
    },

    deleteImage() {
        this.props.onDelete(this.props.index);
    },

    render() {
        return (
            <img onClick={this.deleteImage} height="200" ref="preview" src={this.state.src} />
        );
    }
});
