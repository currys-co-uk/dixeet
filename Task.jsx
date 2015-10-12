// Task component - represents a single todo item
Task = React.createClass({
    propTypes: {
        // This component gets the task to display through a React prop.
        // We can use propTypes to indicate it is required
        task: React.PropTypes.object.isRequired
    },

    toggleChecked() {
        // Set the checked property to the opposite of its current value
        Tasks.update(this.props.task._id, {
            $set: {checked: ! this.props.task.checked}
        });
    },

    deleteThisTask() {
        if (confirm('Do you wanna really delete it?')) {
            if (typeof this.props.task.files != 'undefined') {
                this.props.task.files.forEach(function(el){
                    Images.remove({_id: el.id});
                });
            }
            Tasks.remove(this.props.task._id);
        }
    },

    imgUrl(id, name) {
        img = Images.findOne({_id: id});
        if (typeof img == 'undefined') {
            console.log(id);
            return '/cfs/files/images/' + id + '/' + name; //hacking
        }

        return img.url();
    },

    renderPreviews() {
        if (typeof this.props.task.files == 'undefined') return '';

        return this.props.task.files.map((file, i)  => {
            var lightboxAttr = '';

            if (file.type.match(/image/) != null) {
                return <a href={this.imgUrl(file.id)} data-lightbox={this.props.task._id} target="_blank"><img src={this.imgUrl(file.id, file.name)} /></a>;
            }

            return <a href={this.imgUrl(file.id)} target="_blank"><img title={file.name} src="download_icon.png" /></a>;
        });
    },

    selectHash(hash) {
        var event = arguments[1];
        console.log('selecting hash', hash);
        this.props.onHashClick(hash, event);
    },

    selectStream(stream) {
        FlowRouter.go('/' + stream);
        console.log('selecting stream', stream);
        this.props.onStreamClick(stream);
    },

    selectUser(name) {
        console.log('selecting login', name);
        this.props.onLoginClick(name);
    },

    linkify(text, links_arr) {
        if (links_arr == null || links_arr.length == 0) {
            return <span>{text}</span>;
        }

        var link = links_arr.pop();
        console.log(link, links_arr, text);
        var arr = text.split(link.value);
        var arr_jsx = [];
        for(var i=0; i<arr.length;i++) {
            arr_jsx.push(<span>{this.linkify(arr[i], links_arr.slice(0))}</span>);
            if (i < arr.length-1) {
                //console.log('<a href=' + link.href + '>--' + link.value + '--</a>', link);
                arr_jsx.push(<a href={link.href}>{link.value}</a>);
            }
        }
        return arr_jsx;
    },


    getMessage(text, hash_arr) {
        if (hash_arr == null || hash_arr.length == 0) {
            links_arr = linkify.find(text);
            return <span>{this.linkify(text, links_arr)}</span>;
        }
        var hash = hash_arr.pop();
        var arr = text.split(hash);
        var arr_jsx = [];
        for(var i=0; i<arr.length;i++) {
            arr_jsx.push(<span>{this.getMessage(arr[i], hash_arr.slice(0))}</span>);
            if (i < arr.length-1) {
                arr_jsx.push(<span className="hashtag" onClick={this.selectHash.bind(this, hash)}>{hash}</span>);
            }
        }
        return arr_jsx;
    },

    hashtags() {
        if (typeof this.props.task.hashtags == 'undefined') return '';
        //if (this.props.task.hashtags == null) return '';
        return this.props.task.hashtags.join(', ');
    },

    formatDate() {
        var time = moment(this.props.task.createdAt);
        var now = this.props.appTime;

        return time.from(now);
    },

    displayDeleteButton() {
        var time = moment(this.props.task.createdAt);
        var now = this.props.appTime;

        if (
            (now.diff(time, 'seconds') < 30 && (this.props.role == 'admin' || this.props.role == 'writer')) ||
            this.props.role == 'admin'
        ) {
            return <button className="delete" onClick={this.deleteThisTask}>&times;</button>;
        }

        return '';
    },

    render() {
        // Give tasks a different className when they are checked off,
        // so that we can style them nicely in CSS
        const taskClassName = "task " + (this.props.task.checked ? "checked" : "");
        //console.log(this.props.task);

        return (
            <li className={taskClassName}>
                {this.displayDeleteButton()}
                <span className="task__stream" onClick={this.selectStream.bind(this, this.props.task.stream)}>
                    {this.props.task.stream != null && this.props.stream == null ? <img src="/wifi_icon.png" className="task__stream__icon" /> : ''}
                    {this.props.task.stream != null && this.props.stream == null ? this.props.task.stream : ''}
                </span>

                <div className="task__info">
                    <strong className="task__info__name" title={this.props.task.ip} onClick={this.selectUser.bind(this, this.props.task.name)}>
                        @{this.props.task.name}
                    </strong>
                    <span className="task__info__date">{this.formatDate()}</span>
                </div>

                <div className="task__message">{this.getMessage(this.props.task.text, this.props.task.hashtags)}</div>
                <div className="task__previews">{this.renderPreviews()}</div>
            </li>
        );
    }
});
