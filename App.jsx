// App component - represents the whole app
App = React.createClass({
    // This mixin makes the getMeteorData method work
    mixins: [ReactMeteorData],

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
    renderUpload() {
        return <upload_bootstrap contentType="images" fileTypes=".jpg" multiple="true" />
    },


    handleSubmit(event) {

        //FS.Utility.eachFile(event, function(file) {
        var files = this.refs.fileInput.getDOMNode().files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];


            Images.insert(file, function (err, fileObj) {
                if (err) {
                    // handle error
                } else {
                    // handle success depending what you need to do
                    //var userId = Meteor.userId();
                    var imagesURL = {
                        "profile.image": "/cfs/files/images/" + fileObj._id
                    };

                    console.log(imagesURL);
                    //Meteor.users.update(userId, {$set: imagesURL});
                }
            });
        }
        //});

        event.preventDefault();

        // Find the text field via the React ref
        var text = React.findDOMNode(this.refs.textInput).value.trim();

        Tasks.insert({
            text: text,
            createdAt: new Date() // current time
        });

        // Clear form
        React.findDOMNode(this.refs.textInput).value = "";
    },

    handleFile(event) {
        var preview = this.refs.imgInput.getDOMNode();
        FS.Utility.eachFile(event, function(file) {

            var reader = new FileReader();
            reader.onloadend = function () {
                preview.src = reader.result;
            }
            reader.readAsDataURL(file);
        });
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
                            placeholder="Type to add new tasks"
                            />
                        <input
                            type="file"
                            class="myFileInput"
                            multiple
                            onChange={this.handleFile}
                            ref="fileInput"
                            />
                        <img src="" height="200" ref="imgInput" />
                    </form>
                </header>
                {this.renderUpload()}
                <ul>
                    {this.renderTasks()}
                </ul>
            </div>
        );
    }
});