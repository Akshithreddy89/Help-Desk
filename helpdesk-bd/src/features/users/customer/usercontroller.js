const bcrypt = require("bcrypt");
const { User } = require("../../../models");

// ==============================
// Get Profile
// ==============================
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        account_status: user.account_status,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==============================
// Update Profile
// ==============================
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number } = req.body;
    const user = req.user;

    // Optional validation logic here, checking if email is already taken etc.
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another account.",
        });
      }
      user.email = email;
    }

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone_number) user.phone_number = phone_number;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==============================
// Change Password
// ==============================
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;
    const user = req.user;

    if (!old_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Old password, new password, and confirm password are required.",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    // Password Strength Validation for new password
    const isString = typeof new_password === "string";
    const hasMinLength = isString && new_password.length > 6;
    const hasLetter = /[a-zA-Z]/.test(new_password);
    const hasNumber = /\d/.test(new_password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(new_password);

    if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: "New password must be more than 6 characters long and include at least one letter, one number, and one special character.",
      });
    }

    // Check old password
    const isPasswordMatched = await bcrypt.compare(old_password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password.",
      });
    }

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. You can now login with your new password.",
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
