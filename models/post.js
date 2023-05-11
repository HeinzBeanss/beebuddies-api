const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DateTime } = require("luxon");

const PostSchema = mongoose.Schema({
    // Post Content
    image: {
        data: { type: Buffer, },
        contentType: { type: String },
      },
    content: { type: String, required: true, },
    timestamp: { type: Date, default: Date.now },

    // Post Extras
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment"}],
    likes: [{ type: Schema.Types.ObjectId, ref: "User"}],
})

// Virtuals
// Post URL
// PostSchema.virtual("url").get(function () {
//     return `/posts/${this._id}`
// });

// Date Format
PostSchema.virtual("timestamp_formatted").get(function() {
    return DateTime.fromJSDate(this.timestamp).toFormat("HH:mm MMMM do yyyy");
});

// Export
module.exports = mongoose.model("Post", PostSchema);