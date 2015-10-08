Tasks = new Mongo.Collection("tasks");

/*var createThumb = function(fileObj, readStream, writeStream) {
  // Transform the image into a 10x10px thumbnail
  gm(readStream, fileObj.name()).resize('10', '10').stream().pipe(writeStream);
};*/

var imageStore = new FS.Store.FileSystem("images", {
  path: "uploads", //optional, default is "/cfs/files" path within app container
  //transformWrite: myTransformWriteFunction, //optional
  //transformRead: myTransformReadFunction, //optional
  maxTries: 5 //optional, default 5
});

var imageStore1 = new FS.Store.GridFS("images1", {
  //mongoUrl: 'mongodb://127.0.0.1:27017/test/', // optional, defaults to Meteor's local MongoDB
  //mongoOptions: {...},  // optional, see note below
  //transformWrite: myTransformWriteFunction, //optional
  //transformRead: myTransformReadFunction, //optional
  maxTries: 1, // optional, default 5
  chunkSize: 1024*1024  // optional, default GridFS chunk size in bytes (can be overridden per file).
                        // Default: 2MB. Reasonable range: 512KB - 4MB
});

Images = new FS.Collection("images", {
  stores: [imageStore1]
});

if (Meteor.isClient) {
  // This code is executed on the client only

  Meteor.startup(function () {
    // Use Meteor.startup to render the component after the page is ready
    React.render(<App />, document.getElementById("render-target"));

    lightbox.init();
  });
}
