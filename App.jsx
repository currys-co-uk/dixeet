// App component - represents the whole app
App = React.createClass({
    // This mixin makes the getMeteorData method work
    mixins: [ReactMeteorData],
    messageLimit: 160,

    componentDidMount() {
        setInterval(function() {
            this.setState({appTime: moment()});
        }.bind(this), 30000);
    },

    getInitialState: function() {
        if (window.location.href.indexOf('?role=writer_042147cfc6f945cfff88da4c91fecf79') !== -1) {
            role = 'writer';
        }else if (window.location.href.indexOf('?role=admin_6861fe864e5b0174d5a293bf1e086b4c') !== -1) {
            role = 'admin';
        }else {
            role = 'user';
        }
        console.log(window.location.href);
        return {role: role, files: [], message: '', hashtags: [], appTime: moment(), uploadResetCounter: 0, formHidden: true};
    },

    // Loads items from the Tasks collection and puts them on this.data.tasks
    getMeteorData() {

        var query = {};

        if (this.state.hashtags.length != 0) {
            query = {"hashtags": {$all: this.state.hashtags}};
        }

        return {
            tasks: Tasks.find(query, {sort: {createdAt: -1, limit: 200}}).fetch()
        }
    },

    selectHashtags(hashs) {
      this.setState({hashtags: hashs});
    },

    renderTasks() {
        return this.data.tasks.map((task)  => {
            return <Task key={task._id} task={task} appTime={this.state.appTime} onHashClick={this.selectHashtags} />;
        });
    },

    renderPreviews() {
        var previewItems = this.state.files.map((file, i)  => {
            return <PreviewImage file={file} onDelete={this.removePreview} index={i} />;
        });

        return <div className="preview-images">{previewItems}</div>
    },

    removePreview(index) {
        s = this.state.files;
        s.splice(index, 1);
        this.setState({files: s});
    },

    handleSubmit(event) {
        var self = this;

        event.preventDefault();
        // Find the text field via the React ref
        var text = React.findDOMNode(this.refs.textInput).value.trim();
        var name = React.findDOMNode(this.refs.nameInput).value.trim();

        if (text == '' || name == '') {
            return;
        }

        var hashtags = text.match(/(#[a-z|A-Z|0-9|_]+)/gi);
        var uniquehashtags = [];

        if (hashtags !== null) {
            hashtags.forEach(function(el){
                console.log(el, uniquehashtags);
                if (uniquehashtags.indexOf(el) === -1) {
                    uniquehashtags.push(el);
                }
            });
        }

        uniquehashtags.sort(function(a, b){
            return a.length - b.length; // ASC -> a - b; DESC -> b - a
        });


        var doc = {
            name: name,
            hashtags: uniquehashtags,
            text: text,
            files: filesStore,
            createdAt: new Date() // current time
        };
        console.log('inserting', doc);

        var task_id = Tasks.insert(doc);

        var files = this.state.files;//this.refs.fileInput.getDOMNode().files;

        var filesStore = [];
        var intervalId = {};
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            Images.insert(file, function (err, fileObj) {
                console.log(fileObj);

                if (err) {
                    console.debug (err)
                } else {
                    console.log(fileObj);
                    var image = {
                        id: fileObj._id,
                        filename: fileObj.collectionName + '-' + fileObj._id + '-' + fileObj.original.name,
                        name: fileObj.name(),
                        type: fileObj.type()
                        //fileObj: fileObj
                    };

                    filesStore.push(image);
                    var task = Tasks.findOne({_id: task_id});
                    task['files'] = filesStore;

                    /*
                    Images.find({_id: fileObj._id}).observe({
                        changed: function(file, oldFile) {
                            if (file.url() != null) {
                                Tasks.update({_id: task_id}, task);
                            }
                        }
                    });
                    */

                    intervalId[fileObj._id] = setInterval(function() {
                        if (fileObj.isUploaded()) {
                            setTimeout(function () {Tasks.update({_id: task_id}, task);}, parseInt(2000 + Math.random() * 2000));
                            clearInterval(intervalId[fileObj._id]);
                            delete intervalId[fileObj._id];
                        }
                    }, 200);
                }
            });
        }

        // Clear form
        React.findDOMNode(this.refs.textInput).value = "";

        this.setState({files: [], message: '', uploadResetCounter: this.state.uploadResetCounter + 1});
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
        var message = e.target.value;

        if (message.length <= this.messageLimit) {
            this.setState({message: e.target.value});
        }
    },


    renderHeaderSelectedTags() {
        if (this.state.hashtags.length) {
            var hashes = this.state.hashtags.map(function(hash) {
                return <span className="header__hashtag">{hash}</span>
            });
            hashes.push(<span className="header__showall" onClick={this.selectHashtags.bind(this, [])}>&times;</span>)

            return <span> - {hashes}</span>;
        } else {
            return '';
        }
    },

    toggleForm(hidden) {
        this.setState({formHidden: hidden});
    },


    render() {
        var containerClass = 'container ' + (this.state.formHidden ? 'form-hidden ' : '');
        var messageCharsLeft = this.messageLimit - this.state.message.length;
        var charsLeftButtonClass = messageCharsLeft <= 20 ? 'chars-left-low ' : '';

        return (
            <div className={containerClass}>
                <header>
                    <h1>
                        <img id="logo" src="/dixeet__logo.png" /> {this.renderHeaderSelectedTags()} {this.state.role}
                        {this.state.formHidden ? <button className="toggleFormButton" onClick={this.toggleForm.bind(this, false)}>new dixeet</button> : <button className="toggleFormButton" onClick={this.toggleForm.bind(this, true)}>hide form</button>}
                    </h1>

                    <form className="new-task" onSubmit={this.handleSubmit} >
                        <label>Your name:</label>
                        <input
                            type="text"
                            ref="nameInput"
                            placeholder="Type your name"
                            />

                        <label>Your message: (<span className={charsLeftButtonClass}>{messageCharsLeft}</span>)</label>
                        <textarea
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
                            uploadResetCounter={this.state.uploadResetCounter}
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
