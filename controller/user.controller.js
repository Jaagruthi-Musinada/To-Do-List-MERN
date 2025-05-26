import User from "../model/user.model.js";
import { z } from "zod"; // for schema validation
import bcrypt from "bcryptjs";
import { generateToken } from "../jwt/token.js";

// ✅ Schema validation using zod
const userValidation = z.object({
  username: z.string().min(3, { message: 'Username must have at least 3 characters' }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(8, { message: 'Password must have at least 8 characters' }),
});

// ✅ Register a new user
export const register = async (req, res) => {
  console.log(`Signup function called`);

  const validationResult = userValidation.safeParse(req.body);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map((err) => err.message);
    return res.status(400).json({
      message: "Invalid input",
      errors: errorMessages
    });
  }

  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password and create user
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashPassword });
    const savedUser = await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error during registration" });
  }
};

// ✅ Login existing user
export const login = async (req, res) => {
  console.log(`Login function called`);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error during login" });
  }
};

// ✅ Logout user (stateless – just respond)
export const logout = (req, res) => {
  console.log(`Logout function called`);
  return res.status(200).json({ message: "Logout successful" });
};
