const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const { Schema } = mongoose;
const { DateTime } = require("luxon");

// Get profile picture
const getDefaultProfilePicture = () => {
  const defaultPicturePath = path.join(__dirname, '../Assets/default_bee_profile.jpg');
  return fs.readFileSync(defaultPicturePath);
}

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

UserSchema.pre('save', async function(next) {
  if (!this.profile_picture.data) {
    const defaultPicturePath = path.join(__dirname, '../Assets/default_bee_profile.jpg');
    const defaultPictureData = await fs.promises.readFile(defaultPicturePath);
    this.profile_picture.data = Buffer.from(defaultPictureData);
    this.profile_picture.contentType = "image/jpeg";
  }
  next();
});

UserSchema.virtual('profile_picture_url').get(function () {
  if (this.profile_picture && this.profile_picture.data) {
    const base64Image = this.profile_picture.data.toString('base64');
    return `data:${this.profile_picture.contentType};base64,${base64Image}`;
  }
  return null; // or a default image URL
});

  // TO USE IF I HAVE ISSUES WITH IMAGES WHEN UPDATING USER.PROFILE
  // else if (this.isModified('profile_picture.data')) {
  //   const base64Data = this.profile_picture.data.toString('base64');
  //   this.profile_picture.data = base64Data;
  // }

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

//       default: getDefaultProfilePicture,

