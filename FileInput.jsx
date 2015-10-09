FileInput = React.createClass({
    componentWillReceiveProps(nextProps) {
        this.forceUpdate();
    },

    render() {
        return (
            <input type="file" multiple onChange={this.props.onChange} />
        );
    }
});
