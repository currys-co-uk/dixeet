FileInput = React.createClass({
    render() {
        return (
            <input type="file" multiple onChange={this.props.onChange} />
        );
    }
});
