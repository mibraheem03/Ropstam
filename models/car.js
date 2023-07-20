const mongoose = require("mongoose");
const Joi = require("joi");

const carSchema = new mongoose.Schema({
    category: { type: String, required: true },
    color: { type: String, required: true },
    model: { type: String, required: true },
    make: { type: String, required: true },
    registrationNo: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.String, ref: "User", required: true },
});

const Car = mongoose.model("Car", carSchema);

function validateCar(req) {
    const schema = Joi.object({
        category: Joi.string(),
        color: Joi.string(),
        model: Joi.string(),
        make: Joi.string(),
        registrationNo: Joi.string(),
    });

    return schema.validate(req);
}
module.exports = { Car, carSchema, validateCar };
