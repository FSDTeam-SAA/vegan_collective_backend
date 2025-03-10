const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utility/emailSender");
const Reffer = require("../models/reffer.model");

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { role, fullName, email, password, accountType, ref } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User with this email already exists.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      role,
      fullName,
      email,
      password: hashedPassword,
      accountType: role === "vendor" ? accountType : null, // Set accountType based on role
      verifyEmail: false,
      isgratings: false,
    });

    // Handle referral logic if `ref` is provided
    if (ref) {
      // Find the referral document by the provided slug
      const referral = await Reffer.findOne({ slug: ref });

      if (referral) {
        // Push the new user's ID into the participants array
        referral.participants.push(user._id);

        // Increment the `remain` field
        referral.remain += 1;

        // Save the updated referral document
        await referral.save();
      }
    }


    // Generate verification token
    const verifyToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send verification email
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - Vegan Collective",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <h1 style="color: #2c5282; text-align: center;">Welcome to Vegan Collective!</h1>
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Thank you for joining us! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BACKEND_URL}/api/v1/verify-email?token=${verifyToken}" 
                 style="background-color: #48bb78; 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;
                        display: inline-block;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        transition: background-color 0.3s ease;">
                Verify Email
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; text-align: center;">If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      `,
    };
    await sendEmail(mailOption);

// Return the response with the user data
res.status(201).json({
  status: true,
  message: "User created successfully. Please check your email to verify your account.",
  data: {
    _id: user._id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    verifyEmail: user.verifyEmail,
    isgratings: user.isgratings, // Ensure this is included
  },
});
} catch (error) {
res.status(500).json({
  status: false,
  message: "An error occurred while registering the user.",
  error: error.message,
});
}
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Validate token presence
    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Token is required.",
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: "Invalid or expired token.",
      });
    }

    const userId = decoded.userId;

    // Find the user and update their email verification status
    const user = await User.findByIdAndUpdate(
      userId,
      { verifyEmail: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    // Redirect based on user role and account type
    const frontendUrl = process.env.FRONTEND_URL || "https://vegan-frontend.vercel.app";
    if (user.role === "user") {
      return res.redirect(`${frontendUrl}/onboarding/success?role=customer`);
    } else if (user.role === "vendor") {
      return res.redirect(`${frontendUrl}/profile-setup?type=${user.accountType}&userId=${user._id}`);
    }

    // Default response if no redirection matches
    return res.status(200).json({
      status: true,
      message: "Email verified successfully.",
      data: {
        _id: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        verifyEmail: user.verifyEmail,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({
      status: false,
      message: "An unexpected error occurred.",
      error: error.message,
    });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Ensure the user's email is verified
    if (!user.verifyEmail) {
      return res.status(403).json({
        status: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return the token and user details
    return res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          role: user.role,
          accountType: user.accountType,
          fullName: user.fullName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Logout a user
exports.logoutUser = async (req, res) => {
  try {
    // For simplicity, we can just return a success message.
    // In a real-world app, you might want to invalidate the token or use a blacklist.
    return res.status(200).json({
      status: true,
      message: "Logout successful. Goodbye!",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required',
      })
    }

    // Find the user by ID
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    return res.status(200).json({
      status: true,
      message: 'User profile retrieved successfully',
      data: {
        _id: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        token,
        paymentAdded: user.paymentAdded,
      },
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Something went wrong',
      error: error.message,
    })
  }
}


exports.updateIsgratings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isgratings } = req.body;

    // Find the user by ID and update the isgratings field
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isgratings: isgratings },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    // Return the updated user data
    res.status(200).json({
      status: true,
      message: "isgratings updated successfully.",
      data: {
        _id: updatedUser._id,
        role: updatedUser.role,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        verifyEmail: updatedUser.verifyEmail,
        isgratings: updatedUser.isgratings,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred while updating isgratings.",
      error: error.message,
    });
  }
};
