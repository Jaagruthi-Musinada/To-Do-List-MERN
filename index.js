import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import todoRoute from "./routes/todo.route.js";
import userRoute from "./routes/user.route.js";
import cors from "cors";

const app = express();
dotenv.config();

// Database connection
const DB_URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log(`Connected to MongoDB`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
}
connectDB();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

// Routes
app.use("/todo", todoRoute);
app.use("/user", userRoute);

// Root
app.get(`/`, (req, res) => {
  res.send(`TODO App`);
});

// Start server
const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});

