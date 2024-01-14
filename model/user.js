const mongoose = require("mongoose");
const { Schema } = mongoose;

let userSchema = new mongoose.Schema({
    username: String,
    password: String,
    blog: [
        {
            type: Schema.Types.ObjectId,
            ref: "blog"
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
});

module.exports = mongoose.model("User", userSchema);
