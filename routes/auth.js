const express = require("express");
const jwt = require("jsonwebtoken");
var Web3 = require("web3");
const { User, userSchema, validateSignUp, validateUser, validateMetaMaskUser } = require("../models/user.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randToken = require("rand-token");

const router = express.Router();

// Sign-up with MetaMask
router.post("/signup/metamask", async (req, res) => {
    const { error } = validateMetaMaskUser(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { address, signature } = req.body;

    // Verify the signature against the provided address
    const message = "Sign up for our application";

    try {
        const recoveredAddress = recoverAddress(message,signature);
        if(recoveredAddress.toLowerCase() != address.toLowerCase()){
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ address });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Create a new user
        const user = new User({ address });
        await user.save();

        // Generate a JWT token
        const token = jwt.sign({ address }, process.env.ACCESS_TOKEN);

        // Respond with the token
        res.json({ token });
    } catch (error) {
        console.error("Error signing up with MetaMask:", error);
        res.status(500).json({ error: "Failed to sign up" });
    }
});

// Sign-in with MetaMask
router.post("/signin/metamask", async (req, res) => {
    const { error } = validateMetaMaskUser(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { address, signature } = req.body;

    // Verify the signature against the provided address
    const message = "Sign in to our application";

    try {
        const recoveredAddress = recoverAddress(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Check if the user exists
        const user = await User.findOne({ address });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Generate a JWT token
        const token = jwt.sign({ address }, process.env.ACCESS_TOKEN);

        // Respond with the token
        res.json({ token });
    } catch (error) {
        console.error("Error signing in with MetaMask:", error);
        res.status(500).json({ error: "Failed to sign in" });
    }
});
function generateRandomPassword() {
    return randToken.generate(10);
}

// Sign-up with email
router.post("/signup/email", async (req, res) => {
    const { error } = validateSignUp(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = req.body;

    try {

        const isFound = await User.findOne({ email });
        if (isFound) {
            return res.status(401).json({ error: "User Already Exist" });
        }
        // Generate a random password
        const password = generateRandomPassword();
        const hashedPassword = await hashPassword(password);

        // Save the user with the generated password
        const user = new User({ email, password: hashedPassword });
        await user.save();

        // Send the random password via email
        await sendPasswordEmail(email, password);

        // Respond with success message
        res.json({ message: "User signed up successfully. Please check your email for the password." });
    } catch (error) {
        console.error("Error signing up with email:", error);
        res.status(500).json({ error: "Failed to sign up" });
    }
});
router.post("/signin/email", async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password,);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);

        // Respond with the token
        res.json({ token });
    } catch (error) {
        console.error("Error signing in with email:", error);
        res.status(500).json({ error: "Failed to sign in" });
    }
});
function recoverAddress(message, signature) {

    const recoveredAddress = Web3.eth.accounts.recover(message, signature);
    return recoveredAddress
}
function sendPasswordEmail(email, password) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            // Configure your email provider details
            service: "gmail",
            auth: {
                user: `${process.env.EMAIL}`,
                pass: `${process.env.EMAIL_APP_PASSWORD}`,
            },
        });

        const mailOptions = {
            from: `${process.env.EMAIL}`,
            to: email,
            subject: "Welcome to the Ropstem",
            text: `Thank you for signing up!\n\nYour randomly generated password is: ${password}`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Error sending email:", error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
// Function to hash the password using bcrypt
async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}
module.exports = router;