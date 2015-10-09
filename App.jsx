// App component - represents the whole app
App = React.createClass({
    // This mixin makes the getMeteorData method work
    mixins: [ReactMeteorData],
    messageLimit: 160,

    componentDidMount() {
        setInterval(function() {
            this.setState({appTime: moment()});
        }.bind(this), 30000);


        Meteor.call('getIP', function(error, result){
            if(error){
                //Error handling code
                console.log(error);
            }
            else {
                this.setState({ip: result});
            }
        }.bind(this));

    },

    getInitialState: function() {
        var role = 'user';

        if (window.location.href.indexOf('?role=writer_042147cfc6f945cfff88da4c91fecf79') !== -1) {
            role = 'writer';
        } else if (window.location.href.indexOf('?role=admin_6861fe864e5b0174d5a293bf1e086b4c') !== -1) {
            role = 'admin';
        }

        return {role: role, files: [], message: '', logins: [], hashtags: [], appTime: moment(), uploadResetCounter: 0, formHidden: true};
    },


    hasRole(role) {
        return this.state.role == role;
    },

    // Loads items from the Tasks collection and puts them on this.data.tasks
    getMeteorData() {
        var query = {};

        if (this.state.hashtags.length != 0) {
            query["hashtags"] = {$all: this.state.hashtags};
        }

        if (this.state.logins.length != 0) {
            query["name"] = {$in: this.state.logins};
        }

        return {
            tasks: Tasks.find(query, {sort: {createdAt: -1, limit: 200}}).fetch()
        }
    },

    addHashTag(hash) {
        var hashes = this.state.hashtags;
        hashes.push(hash);

        // filter only unique values
        hashes = hashes.filter(function(value, index, self) {
            return self.indexOf(value) === index;
        });

        this.setState({hashtags: hashes})
    },

    addLogin(login) {
        var logins = this.state.logins;
        logins.push(login);

        // filter only unique values
        logins = logins.filter(function(value, index, self) {
            return self.indexOf(value) === index;
        });

        this.setState({logins: logins})
    },

    removeSelectedHashtags(hash) {
        var hashes = this.state.hashtags;
        var hashIndex = hashes.indexOf(hash);

        if (hashIndex != -1) {
            hashes.splice(hashIndex, 1);
            this.setState({hashtags: hashes});
        }
    },

    removeSelectedLogins(hash) {
        var hashes = this.state.logins;
        var hashIndex = hashes.indexOf(hash);

        if (hashIndex != -1) {
            hashes.splice(hashIndex, 1);
            this.setState({logins: hashes});
        }
    },

    selectHashtags(hashs) {
      this.setState({hashtags: hashs});
    },

    selectLogins(logins) {
        this.setState({logins: logins});
    },

    renderTasks() {
        return this.data.tasks.map((task)  => {
            return <Task key={task._id} task={task} appTime={this.state.appTime} onHashClick={this.addHashTag} role={this.state.role} onLoginClick={this.addLogin}/>;
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

    handleSearchSubmit(event) {
        event.preventDefault();

        var text = React.findDOMNode(this.refs.searchFormInput).value.trim();
        this.selectHashtags([]);
        this.selectLogins([]);

        if (text.charAt(0) == '@') {
            this.selectLogins([text.substr(1)]);
        }
        if (text.charAt(0) == '#') {
            this.selectHashtags([text]);
        }
        return false;
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
            ip: this.state.ip,
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
                return <span className="header__hashtag">{hash}<span className="header__hashtag__remove" onClick={this.removeSelectedHashtags.bind(this, hash)}>&times;</span></span>
            }.bind(this));

            return <span>{hashes}</span>;
        } else {
            return '';
        }
    },

    renderHeaderSelectedLogins() {
        if (this.state.logins.length) {
            var logins = this.state.logins.map(function(login) {
                return <span className="header__hashtag">@{login}<span className="header__hashtag__remove" onClick={this.removeSelectedLogins.bind(this, login)}>&times;</span></span>
            }.bind(this));

            return <span> - {logins}</span>;
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
                        <img id="logo" src="/dixeet__logo.png" /> <span className="header__user">{this.state.role}</span> {this.renderHeaderSelectedLogins()} {this.renderHeaderSelectedTags()}
                    </h1>

                    <div className="clear"></div>

                    <form id="search-form" onSubmit={this.handleSearchSubmit}>
                        <input type="text" ref="searchFormInput" />

                        <button type="submit">search</button>
                    </form>

                    {
                        this.hasRole('admin') || this.hasRole('writer')
                        ? this.state.formHidden ? <button className="toggleFormButton" onClick={this.toggleForm.bind(this, false)}>new dixeet</button> : <button className="toggleFormButton" onClick={this.toggleForm.bind(this, true)}>hide form</button>
                        : ''
                    }

                    <div className="clear"></div>

                    {
                        this.hasRole('admin') || this.hasRole('writer') ?
                        <form className="new-task" onSubmit={this.handleSubmit}>
                            <label>Your name:</label>
                            <input
                                type="text"
                                ref="nameInput"
                                placeholder="Type your name"
                                />

                            <label>Your message: (<span
                                className={charsLeftButtonClass}>{messageCharsLeft}</span>)</label>
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
                            <input type="submit" value="Send"/>
                        </form> : ''
                    }
                </header>

                <ul>
                    {this.renderTasks()}
                </ul>
            </div>
        );
    }
});
