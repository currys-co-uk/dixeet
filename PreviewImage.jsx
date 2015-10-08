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
        if (this.props.file.type.match(/image/) != null) {
            var img = <img ref="preview" height="50" src={this.state.src} />;
        } else {
            var img = <img ref="preview" height="50" title={this.props.file.name} src="download_icon.png" />;
        }

        return (
            <div className="preview-image" onClick={this.deleteImage}>
                <img src="delete_icon.png" className="delete-preview" />
                {img}
            </div>
        );
    }
});
