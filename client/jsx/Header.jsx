Header = React.createClass({
    messageLimit: 160,

    getInitialState() {
        return {
            stream: this.props.stream,
            files: [],
            uploadResetCounter: 0,
            message: ''
        }
    },

    logoClick() {
        this.refs.searchFormInput.getDOMNode().value = '';
        this.handleSearchSubmit(null);
        FlowRouter.go('/');
        this.props.logoClick();
    },

    hasRole(role) {
        return this.props.role == role;
    },

    removeSelectedHashtags(hash) {
        this.props.removeSelectedHashtags(hash);
    },

    renderHeaderSelectedTags() {
        if (this.props.hashtags.length) {
            var hashes = this.props.hashtags.map(function(hash) {
                return <span className="header__hashtag">{hash}<span className="header__hashtag__remove" onClick={this.removeSelectedHashtags.bind(this, hash)}>&times;</span></span>
            }.bind(this));

            return {hashes};
        } else {
            return '';
        }
    },

    removeSelectedLogins(login) {
        this.props.removeSelectedLogins(login);
    },

    renderHeaderSelectedLogins() {
        if (this.props.logins.length) {
            var logins = this.props.logins.map(function(login) {
                return <span className="header__hashtag">@{login}<span className="header__hashtag__remove" onClick={this.removeSelectedLogins.bind(this, login)}>&times;</span></span>
            }.bind(this));

            return {logins};
        } else {
            return '';
        }
    },

    handleSearchSubmit(event) {
        if(null !== event){
            event.preventDefault();
        }

        var text = React.findDOMNode(this.refs.searchFormInput).value.trim();
        this.props.handleSearchSubmit(text);
    },

    handleSubmit(event) {
        event.preventDefault();

        // Find the text field via the React ref
        var text = React.findDOMNode(this.refs.textInput).value.trim();
        var name = React.findDOMNode(this.refs.nameInput).value.trim();

        if (text == '' || name == '') {
            alert('Please fill both name and message.');
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
            stream: this.props.stream,
            name: name,
            ip: this.state.ip,
            hashtags: uniquehashtags,
            text: text,
            files: filesStore,
            createdAt: new Date() // current time
        };
        console.log('inserting', doc);

        var task_id = Tasks.insert(doc);

        var files = this.state.files;

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

    toggleForm(hidden) {
        this.props.toggleForm(hidden);
    },

    handleChange: function(e) {
        var message = e.target.value;

        if (message.length <= this.messageLimit) {
            this.setState({message: e.target.value});
        }
    },

    handleFile(event) {
        var self = this;
        FS.Utility.eachFile(event, function(file) {
            var files = self.state.files;
            files.push(file);
            self.setState({files: files});
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

    render() {
        var messageCharsLeft = this.messageLimit - this.state.message.length;
        var charsLeftButtonClass = messageCharsLeft <= 20 ? 'chars-left-low ' : '';

        return (
            <header>
                <h1>
                    <img onClick={this.logoClick} id="logo" src="/dixeet_logo.png" /> <span className="header__user">{this.props.stream}</span> {this.renderHeaderSelectedLogins()} {this.renderHeaderSelectedTags()}
                </h1>

                <div className="clear"></div>

                {
                    this.hasRole('admin') || this.hasRole('writer')
                        ? this.props.formHidden ? <button className="toggleFormButton" onClick={this.toggleForm.bind(this, false)}>new dixeet</button> : <button className="toggleFormButton" onClick={this.toggleForm.bind(this, true)}>hide form</button>
                        : ''
                }

                <form id="search-form" onSubmit={this.handleSearchSubmit}>
                    <input type="text" ref="searchFormInput" />
                    <button type="submit">search</button>
                </form>

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

                            <FileInput key={"add" + this.state.uploadResetCounter} onChange={this.handleFile} />

                            {this.renderPreviews()}
                            <input type="submit" value="Send"/>
                        </form> : ''
                }
            </header>
        )
    }
});