import mongoose from "mongoose";
import enums from "../config/enum.config.js";

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: null
    },
    password: {
      type: String,
      default: null,
    },
    fullname: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    providerId: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: Object.values(enums.authProviderEnum),
    },
    role: {
      type: String,
      enum: Object.values(enums.userRoleEnum),
      default: enums.userRoleEnum.USER,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    expiresIn: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: String,
      default: null,
    },
    favoriteCardIds: {
      type: [String],
      default: [],
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = mongoose.model("User", schema);
export default UserModel;
