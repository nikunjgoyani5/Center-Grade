import bcrypt from "bcrypt";
import { apiResponse } from "../helper/api-response.helper.js";
import enums from "../config/enum.config.js";
import config from "../config/config.js";
import helper from "../helper/common.helper.js";
import { StatusCodes } from "http-status-codes";
import userService from "../services/user.service.js";
import emailService from "../services/email.service.js";
import jwt from "jsonwebtoken";
import admin from "../firebase/config.firebase.js";
import Collection from "../models/collection.model.js";

// For verify token
const verifyToken = async (req, res) => {
  try {
    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Token is verify successfully.",
      status: true,
      data: null,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      status: false,
      data: null,
    });
  }
};

// For email registration
const registerByEmail = async (req, res) => {
  try {
    const { email, password, fullname } = req.body;

    let user = await userService.findOne({ email, isDeleted: false }, true);

    const { otp, otpExpiresAt } = helper.generateOTP();
    await emailService.sendOTPEmail({ email, otp, otpExpiresAt });

    if (user) {
      if (user.isVerified) {
        return apiResponse({
          res,
          status: false,
          message: "Email ID already in use",
          statusCode: StatusCodes.BAD_REQUEST,
          data: null,
        });
      } else {
        await userService.update(user._id, { otp, otpExpiresAt });
      }
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = {
        email,
        password: hashPassword,
        provider: enums.authProviderEnum.EMAIL,
        otp,
        otpExpiresAt,
        fullname,
        isVerified: false,
      };

      const user = await userService.create(newUser);

      // Create default collection for the user
      await Collection.create({
        userId: user._id,
        name: "All",
        isDefault: true,
      });
    }

    return apiResponse({
      res,
      statusCode: StatusCodes.CREATED,
      status: true,
      message: "Registration complete! Check your email for the verification OTP",
      data: null,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For verify email otp
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid email or user does not exist",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return apiResponse({
        res,
        status: false,
        message: "OTP has expired",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (user.otp !== otp) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid OTP",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    const token = await helper.generateToken({ userId: user._id });
    const filteredUser = helper.filteredUser(user);

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "OTP verified successfully!",
      data: {
        token,
        user: filteredUser,
      },
    });
  } catch (error) {

    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For resend email otp
const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User does not exist",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const { otp, otpExpiresAt } = helper.generateOTP();

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await emailService.sendOTPEmail({ email, otp, otpExpiresAt });

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: `OTP has been resent successfully!`,
      data: null,
    });
  } catch (error) {

    console
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For email login
const loginByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid email or user does not exist",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    if (!user.isVerified) {
      return apiResponse({
        res,
        status: false,
        message: "Please first verify OTP or create your account",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return apiResponse({
        res,
        status: false,
        message: "Invalid password",
        statusCode: StatusCodes.UNAUTHORIZED,
        data: null,
      });
    }

    const token = await helper.generateToken({ userId: user._id });
    const filteredUser = helper.filteredUser(user);

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Login successful",
      data: {
        token,
        user: filteredUser,
      },
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User not found",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const { otp, otpExpiresAt } = helper.generateOTP();

    await emailService.sendOTPEmail({ email, otp });
    await userService.update(user._id, { otp, otpExpiresAt });

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "OTP sent successfully!",
      data: null,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For reset password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User not found",
        statusCode: StatusCodes.BAD_REQUEST,
        data: null,
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await userService.findByIdAndUpdate(user._id, {
      password: hashPassword,
    });

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Password reset successfully!",
      data: null,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// For google login/registration
const loginByGoogle = async (req, res) => {
  try {
    const { email, fullname, profileImage } = req.body;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      const newUser = {
        email,
        provider: enums.authProviderEnum.GOOGLE,
        fullname,
        profileImage: profileImage || null,
        isVerified: true,
      };

      user = await userService.create(newUser);

      // Create default collection for the user
      await Collection.create({
        userId: user._id,
        name: "All",
        isDefault: true,
      });
    } else {
      if (user.provider !== enums.authProviderEnum.GOOGLE) {
        return apiResponse({
          res,
          status: false,
          message: "Email ID already in use",
          statusCode: StatusCodes.BAD_REQUEST,
          data: null,
        });
      }
      user.profileImage = profileImage || null;
      user.isVerified = true;
      user.providerId = null;
      user.provider = enums.authProviderEnum.GOOGLE;
      user.password = null;
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
    }

    const generatedToken = await helper.generateToken({ userId: user._id });
    const filteredUser = helper.filteredUser(user);

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Google login successfully",
      data: {
        token: generatedToken,
        user: filteredUser,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Invalid Token or expired.",
      data: null,
    });
  }
};

// For apple login/registration
const loginByApple = async (req, res) => {
  try {
    const { token } = req.body;

    const decodedToken = jwt.decode(token, { complete: true });

    if (!decodedToken) {
      return apiResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        status: false,
        message: "Invalid authentication",
      });
    }

    console.log("decodedToken.payload", decodedToken.payload)

    const { email, sub: appleId } = decodedToken.payload;

    let user = await userService.findOne({ email, isDeleted: false });

    if (!user) {
      user = await userService.create({
        email: email,
        providerId: appleId,
        provider: enums.authProviderEnum.APPLE,
        isVerified: true,
      });

      // Create default collection for the user
      await Collection.create({
        userId: user._id,
        name: "All",
        isDefault: true,
      });
    } else {
      if (user.provider !== enums.authProviderEnum.APPLE) {
        return apiResponse({
          res,
          status: false,
          message: "Email ID already in use",
          statusCode: StatusCodes.BAD_REQUEST,
          data: null,
        });
      }
      user.isVerified = true;
      user.providerId = appleId;
      user.provider = enums.authProviderEnum.APPLE;
      user.password = null;
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
    }

    const generatedToken = await helper.generateToken({ userId: user._id });
    const filteredUser = helper.filteredUser(user);

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Apple login successful",
      data: {
        token: generatedToken,
        user: filteredUser,
      },
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Invalid token or expired.",
      data: null,
    });
  }
};

export default {
  verifyToken,
  registerByEmail,
  loginByEmail,
  forgotPassword,
  verifyEmailOtp,
  resendEmailOtp,
  verifyToken,
  resetPassword,
  loginByGoogle,
  loginByApple,
};
