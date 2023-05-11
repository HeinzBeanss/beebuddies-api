const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DateTime } = require("luxon");

const UserSchema = mongoose.Schema({
    // User Details
    email: { type: String, required: true, unique: true, },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    profile_picture: {
      data: { type: Buffer, },
      contentType: { type: String },
    },
    date_created: { type: Date, default: Date.now },

    // User Friends
    friends: [{ type: Schema.Types.ObjectId, ref: "User"}],
    friend_requests_in: [{ type: Schema.Types.ObjectId, ref: "User"}],
    friend_requests_out: [{ type: Schema.Types.ObjectId, ref: "User"}],

    // User Content 
    posts: [{ type: Schema.Types.ObjectId, ref: "Post"}],
    liked_posts: [{ type: Schema.Types.ObjectId, ref: "Post"}],
    liked_comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
});

// Virtuals
// User URL
UserSchema.virtual("url").get(function () {
    return `/users/${this._id}`
});

// Specific Post URL 
UserSchema.virtual("postUrl").get(function () {
  return `/users/${this.id}/posts/${this.post.id}`
});

// Fullname
UserSchema.virtual("fullname").get( function () {   
    return `${this.first_name} ${this.last_name}`;
});

// Date Created Formatted
UserSchema.virtual("date_created_formatted").get(function () {
    return DateTime.fromJSDate(this.date_created).toFormat("MMMM do yyyy");
})

// Export
module.exports = mongoose.model("User", UserSchema);

