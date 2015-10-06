// App component - represents the whole app
App = React.createClass({
    // This mixin makes the getMeteorData method work
    mixins: [ReactMeteorData],

    getInitialState: function() {
        return {files: [], message: ''};
    },

    // Loads items from the Tasks collection and puts them on this.data.tasks
    getMeteorData() {
        return {
            tasks: Tasks.find({}, {sort: {createdAt: -1}}).fetch()
        }
    },

    renderTasks() {
        return this.data.tasks.map((task)  => {
            return <Task key={task._id} task={task} />;
        });
    },

    renderPreviews() {
        return this.state.files.map((file, i)  => {
            return <PreviewImage file={file} onDelete={this.removePreview} index={i} />;
        });
    },

    removePreview(index) {
        s = this.state.files;
        s.splice(index, 1);
        this.setState({files: s});
    },

    handleSubmit(event) {
        var files = this.state.files;//this.refs.fileInput.getDOMNode().files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            Images.insert(file, function (err, fileObj) {
                if (err) {
                    console.debug (err)
                } else {
                    var imagesURL = {
                        "profile.image": "/cfs/files/images/" + fileObj._id
                    };

                    console.log(imagesURL);
                }
            });
        }

        event.preventDefault();

        // Find the text field via the React ref
        var text = React.findDOMNode(this.refs.textInput).value.trim();

        Tasks.insert({
            text: text,
            createdAt: new Date() // current time
        });

        // Clear form
        React.findDOMNode(this.refs.textInput).value = "";

        this.setState(this.getInitialState());
    },

    handleFile(event) {
        var self = this;
        FS.Utility.eachFile(event, function(file) {
            var files = self.state.files;
            files.push(file);
            self.setState({files: files});
        });
    },

    handleChange: function(e) {
        this.setState({message: e.target.value});
    },


    render() {
        return (
            <div className="container">
                <header>
                    <h1>Todo List</h1>
                    <form className="new-task" onSubmit={this.handleSubmit} >
                        <input
                            type="text"
                            ref="textInput"
                            value={this.state.message}
                            onChange={this.handleChange}
                            placeholder="Type to add new tasks"
                            />
                        <input
                            type="file"
                            class="myFileInput"
                            multiple
                            onChange={this.handleFile}
                            ref="fileInput"
                            />
                    </form>

                    {this.renderPreviews()}
                </header>


                <ul>
                    {this.renderTasks()}
                </ul>
            </div>
        );
    }
});
