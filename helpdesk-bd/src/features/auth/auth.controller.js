const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../models");

// ==============================
// Customer Registration
// ==============================

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone_number } = req.body;

    // ==========================
    // Validate Required Fields
    // ==========================

    if (!first_name || !last_name || !email || !password || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // ==========================
    // Password Strength Validation
    // ==========================

    const isString = typeof password === "string";
    const hasMinLength = isString && password.length > 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be more than 6 characters long and include at least one letter, one number, and one special character (e.g. Test@123).",
      });
    }

    // ==========================
    // Normalize Email
    // ==========================

    const normalizedEmail = email.trim().toLowerCase();

    // ==========================
    // Check Existing User
    // ==========================

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // ==========================
    // Hash Password
    // ==========================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================
    // Create Customer
    // ==========================

    const customer = await User.create({
      first_name,
      last_name,
      email: normalizedEmail,
      password: hashedPassword,
      phone_number,
      role: "CUSTOMER", // Always CUSTOMER
      account_status: "ACTIVE",
    });

    // ==========================
    // Remove Password
    // ==========================

    const user = customer.toJSON();

    delete user.password;

    // ==========================
    // Success Response
    // ==========================

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ==============================
// Login
// ==============================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check account status
    if (user.account_status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.account_status}.`,
      });
    }

    // Compare password
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    // Decide dashboard based on role
    let dashboard = "";

    switch (user.role) {
      case "ADMIN":
        dashboard = "/admin/dashboard";
        break;

      case "AGENT":
        dashboard = "/agent/dashboard";
        break;

      case "CUSTOMER":
        dashboard = "/customer/dashboard";
        break;

      default:
        dashboard = "/";
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        account_status: user.account_status,
      },
      dashboard,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  register,
  login,
};
