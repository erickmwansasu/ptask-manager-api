const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const handleUserRegistration = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!",
      });
    }

    const emailExist = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email],
    );

    if (emailExist.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users(email, password) VALUES($1, $2)",
      [email, hashedPassword],
    );

    return res.status(201).json({
      success: true,
      message: "Registered successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!",
      });
    }

    const user = await pool.query(
      "SELECT id, email, password, roles, full_name FROM users WHERE email = $1",
      [email],
    );

    if (!user.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No user with this email!",
      });
    }

    const match = await bcrypt.compare(password, user.rows[0].password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Email or password is invalid!",
      });
    }

    const accessToken = jwt.sign(
      {
        userInfo: {
          id: user.rows[0].id,
          email: user.rows[0].email,
          roles: user.rows[0].roles,
          fullName: user.rows[0].full_name,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { email: user.rows[0].email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" },
    );

    await pool.query("UPDATE users SET refresh_token = $1 WHERE email = $2", [
      refreshToken,
      email,
    ]);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: (process.env.NODE_ENV = "production"),
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      data: user.rows[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No access token",
      });
    }

    const user = await pool.query(
      "SELECT refresh_token FROM users WHERE refresh_token = $1",
      [refreshToken],
    );

    if (!user.rows.length) {
      return res.status(403).json({
        success: false,
        message: "Invalid access token!",
      });
    }

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        suceess: false,
        message: "Refresh token expired, log in again!",
      });
    }

    const newAccessToken = jwt.sign(
      {
        userInfo: {
          email: user.rows[0].email,
          roles: user.rows[0].roles,
          fullName: user.rows[0].full_name,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleUserLogout = async (req, res) => {
  try {
    let refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({
        success: false,
        message: "No refresh token!",
      });
    }

    const user = await pool.query(
      "SELECT email FROM users WHERE refresh_token = $1",
      [refreshToken],
    );

    console.log(user.rows[0].email);

    if (!user.rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token!",
      });
    }

    user.rows[0].refresh_token = null;

    await pool.query("UPDATE users SET refresh_token = $1 WHERE email = $2", [
      user.rows[0].refresh_token,
      user.rows[0].email,
    ]);

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "You have successfully logged out",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  handleUserRegistration,
  handleUserLogin,
  refreshToken,
  handleUserLogout,
};
