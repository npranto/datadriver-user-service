// processed all env variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const pkgJson = require("../package.json");

// initialize an express app
const app = express();

// sets up JSON body parser middleware
app.use(express.json());

// connects to MongoDB Atlas database
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("🎉 Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("Oops! Unable to connect to MongoDB Atlas", err);
  });

// sets up User schema and model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    minLength: 5,
    maxLength: 20,
  },
  pin: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 20,
  },
});

const User = mongoose.model("User", userSchema);

// API routes

// register a new user
app.get("/datadriver/api/users/heathcheck", (req, res) => {
  res.json({
    message: "Welcome to the DataDriver User Service!",
    data: {
      app: pkgJson?.name,
      version: pkgJson?.version,
    },
  });
});

app.post("/datadriver/api/users/register", async (req, res) => {
  try {
    const { username } = req.body;
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = new User({ username, pin });
    await newUser.save();
    res.status(201).json({
      message: "New user created!",
      data: { username, pin },
    });
  } catch (err) {
    res.status(500).json({
      message: "Oops! Unable to create new user!",
      error: err,
    });
  }
});

// update an existing user
app.put("/datadriver/api/users/update/username", async (req, res) => {
  try {
    const { username, pin, newUsername } = req.body;
    const user = await User.findOne({ username, pin });
    if (!user) {
      return res.status(404).json({
        message: "No matching user found with the given username and pin!",
      });
    }
    user.username = newUsername;
    await user.save();
    res.json({
      message: "Username updated for user!",
      data: {
        username: newUsername,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Oops! Unable to update username of user!",
      error: err,
    });
  }
});

// delete an existing user
app.delete("/datadriver/api/users/delete", async (req, res) => {
  try {
    const { username, pin } = req.body;
    const user = await User.findOneAndDelete({ username, pin });

    if (!user) {
      return res.status(404).json({
        message: "No matching user found with the given username and pin!",
      });
    }
    res.json({
      message: "User deleted!",
      data: {
        username,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Oops! Unable to delete user!",
      error: err,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎉 Server listening on port ${PORT}`);
});
