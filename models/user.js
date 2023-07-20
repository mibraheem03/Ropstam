const mongoose = require("mongoose");
const Joi = require("joi");


const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: { type: String },
    address: { type: String, unique: true }
});


const User = mongoose.model("User", userSchema);

function validateSignUp(req) {
    const userSignUpSchema = Joi.object({
        email: Joi.string().email().required(),
    })
    return userSignUpSchema.validate(req);
}

function validateUser(req) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })
    return schema.validate(req);
}
function validateMetaMaskUser(req) {
    const schema = Joi.object({
        address: Joi.string().required(),
        signature: Joi.string().min(6).required(),
    })
    return schema.validate(req);
}
module.exports = { User, userSchema, validateSignUp, validateUser, validateMetaMaskUser };
