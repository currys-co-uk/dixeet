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
        if (typeof this.props.task.files != 'undefined') {
            this.props.task.files.forEach(function(el){
                Images.remove({_id: el.id});
            });
        }
        Tasks.remove(this.props.task._id);
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
            return <a href={this.imgUrl(file.id)} data-lightbox={this.props.task._id + "-" + i} target="_blank"><img src={this.imgUrl(file.id, file.name)}  style={{float: 'left', marginRight: '5px', marginTop: '5px', height: '50px'}} /></a>;
        });


    },

    selectHash(hash) {
        console.log('selecting hash', hash);
        this.props.onHashClick([hash]);
    },

    getMessage(text, hash_arr) {
        if (hash_arr == null || hash_arr.length == 0) {
            return <span>{text}</span>;
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
        if (this.props.task.hashtags == null) return '';
        return this.props.task.hashtags.join(', ');
    },

    render() {
        // Give tasks a different className when they are checked off,
        // so that we can style them nicely in CSS
        const taskClassName = this.props.task.checked ? "checked" : "";
        //console.log(this.props.task);

        return (
            <li className={taskClassName}>
                <button className="delete" onClick={this.deleteThisTask}>
                    &times;
                </button>

                {/*<input
                    type="checkbox"
                    readOnly={true}
                    checked={this.props.task.checked}
                    onClick={this.toggleChecked} />
                */}
                <span className="text">{this.props.task.name}: {this.getMessage(this.props.task.text, this.props.task.hashtags)}</span>
                <div>
                {this.renderPreviews()}
                </div>
                <div style={{clear: 'both'}}></div>
            </li>
        );
    }
});
