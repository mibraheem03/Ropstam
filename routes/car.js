const express = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");

const verifyToken = require("../middleware/verifyToken");
const { Car, carSchema, validateCar } = require("../models/car.js");

const router = express.Router();
router.use(verifyToken);

// Get all cars
router.get("/cars", async (req, res) => {
    try {
        const cars = await Car.find({ userId: req.userId });
        res.json(cars);
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).json({ error: "Failed to fetch cars" });
    }
});

// Create a car
router.post("/cars", async (req, res) => {

    const { error } = validateCar(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { category, color, model, make, registrationNo } = req.body;

    try {
        const car = new Car({
            category,
            color,
            model,
            make,
            registrationNo,
            userId: req.userId,
        });
        await car.save();
        res.status(201).json(car);
    } catch (error) {
        console.error("Error creating a car:", error);
        res.status(500).json({ error: "Failed to create a car" });
    }
});

// Update a car
router.put("/cars/:id", async (req, res) => {
    const { error } = validateCar(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const carId = req.params.id;
    const { category, color, model, make, registrationNo } = req.body;

    try {
        const car = await Car.findById({ _id: new mongoose.Types.ObjectId(carId) });
        if (!car) {
            return res.status(404).json({ error: "Car not found" });
        }

        if (car.userId.toString() !== req.userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        car.category = category;
        car.color = color;
        car.model = model;
        car.make = make;
        car.registrationNo = registrationNo;

        const updatedCar = await car.save();
        res.json(updatedCar);
    } catch (error) {
        console.error("Error updating a car:", error);
        res.status(500).json({ error: "Failed to update a car" });
    }
});

// Delete a car
router.delete("/cars/:id", async (req, res) => {
    const carId = req.params.id;

    try {
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: "Car not found" });
        }

        if (car.userId.toString() !== req.userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        await car.remove();
        res.json({ message: `Car ${carId} deleted successfully` });
    } catch (error) {
        console.error("Error deleting a car:", error);
        res.status(500).json({ error: "Failed to delete a car" });
    }
});
module.exports = router;
