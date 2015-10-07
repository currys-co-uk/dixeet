// App component - represents the whole app
App = React.createClass({
    // This mixin makes the getMeteorData method work
    mixins: [ReactMeteorData],

    getInitialState: function() {
        return {files: [], message: '', hashtags: []};
    },

    // Loads items from the Tasks collection and puts them on this.data.tasks
    getMeteorData() {

        var query = {};

        if (this.state.hashtags.length != 0) {
            query = {"hashtags": {$all: this.state.hashtags}};
        }

        return {
            tasks: Tasks.find(query, {sort: {createdAt: -1}}).fetch()
        }
    },

    selectHashtags(hashs) {
      this.setState({hashtags: hashs});
    },

    renderTasks() {
        return this.data.tasks.map((task)  => {
            return <Task key={task._id} task={task} onHashClick={this.selectHashtags} />;
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

        event.preventDefault();
        // Find the text field via the React ref
        var text = React.findDOMNode(this.refs.textInput).value.trim();
        var name = React.findDOMNode(this.refs.nameInput).value.trim();

        if (text == '' || name == '') {
            return;
        }

        var hashtags = text.match(/(#[a-z|A-Z|0-9|_]+)/gi);


        var doc = {
            name: name,
            hashtags: hashtags,
            text: text,
            files: filesStore,
            createdAt: new Date() // current time
        };
        console.log('inserting', doc);

        var task_id = Tasks.insert(doc);


        //console.log(task, 'task'); //ivLzd9xvzbXyKZT93 task



        var files = this.state.files;//this.refs.fileInput.getDOMNode().files;

        var filesStore = [];
        var intervalId = {};
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            Images.insert(file, function (err, fileObj) {
                if (err) {
                    console.debug (err)
                } else {
                    console.log(fileObj);
                    var image = {
                        id: fileObj._id,
                        filename: fileObj.collectionName + '-' + fileObj._id + '-' + fileObj.original.name,
                        name: fileObj.name()
                        //fileObj: fileObj
                    };

                    filesStore.push(image);
                    var task = Tasks.findOne({_id: task_id});
                    task['files'] = filesStore;

                    intervalId[fileObj._id] = setInterval(function() {
                        if (fileObj.isUploaded()) {
                            setTimeout(function () {Tasks.update({_id: task_id}, task);}, 1000);
                            clearInterval(intervalId[fileObj._id]);
                            delete intervalId[fileObj._id];
                        }
                    }, 200);


                }
            });
        }

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
                    <h1>Dixeet - <span onClick={function(){this.selectHashtags([])}.bind(this)}>{this.state.hashtags.join(', ')} [show all]</span></h1>
                    <form className="new-task" onSubmit={this.handleSubmit} >
                        <input
                            type="text"
                            ref="nameInput"
                            placeholder="Type your name"
                            />
                        <input
                            type="text"
                            ref="textInput"
                            value={this.state.message}
                            onChange={this.handleChange}
                            placeholder="Type a message"
                            />
                        <input
                            type="file"
                            class="myFileInput"
                            multiple
                            onChange={this.handleFile}
                            ref="fileInput"
                            />
                        {this.renderPreviews()}
                        <input type="submit" value="Send" />
                    </form>

                    <div style={{clear: 'both'}}></div>
                </header>


                <ul>
                    {this.renderTasks()}
                </ul>
            </div>
        );
    }
});
