const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DateTime } = require("luxon");

const CommentSchema = mongoose.Schema({
    // Comment Content
    author: { type: Schema.Types.ObjectId, ref: "User"},
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },

    // Comment Extras
    likes: { type: Schema.Types.ObjectId, ref: "User"},
})

// Virtuals
// Comment URL
CommentSchema.virtual("url").get(function () {
    return `/comments/${this.id}`
});

// Date Format
CommentSchema.virtual("timestamp_formatted").get(function() {
    return DateTime.fromJSDate(this.timestamp).toFormat("HH:mm MMMM do yyyy");
});

// Export
module.exports = mongoose.model("Comment", CommentSchema);