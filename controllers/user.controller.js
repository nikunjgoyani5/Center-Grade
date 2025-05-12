import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../helper/api-response.helper.js";
import fileUploadService from "../services/file.upload.service.js";
import userServices from "../services/user.service.js";
import bcrypt from "bcrypt";
import helper from "../helper/common.helper.js";

// ---- Get User Profile ------
const getUserProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await userServices.findOne({ _id: userId, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User not found.",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    const filteredUser = helper.filteredUser(user);

    return apiResponse({
      res,
      status: true,
      message: "User profile fetched successfully.",
      statusCode: StatusCodes.OK,
      data: filteredUser,
    });
  } catch (error) {
    return apiResponse({
      res,
      status: false,
      message: "Failed to fetch user profile.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// ---- Update User Profile ------
const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullname = undefined, dateOfBirth = undefined } = req.body || {};
  const file = req.file;

  const user = await userServices.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    return apiResponse({
      res,
      status: false,
      message: "User not found.",
      statusCode: StatusCodes.NOT_FOUND,
    });
  }

  try {
    if (fullname !== undefined) user.fullname = fullname;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

    if (file) {
      if (user.profileImage) {
        await fileUploadService.deleteFile({ url: user.profileImage });
      }

      const fileKey = await fileUploadService.uploadFile(file, "profile-pictures");
      user.profileImage = fileKey;
    }

    await user.save();

    const filteredUser = helper.filteredUser(user);

    return apiResponse({
      res,
      status: true,
      message: "User profile updated successfully.",
      statusCode: StatusCodes.OK,
      data: filteredUser,
    });

  } catch (error) {
    console.log("errorrrr", error);
    return apiResponse({
      res,
      status: false,
      message: "Failed to update user profile.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// ---- Delete User Account (Soft delete / permanently delete) -----
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isPermanentlyDelete } = req.body;

    const user = await userServices.findOne({ _id: userId });
    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    if (isPermanentlyDelete) {
      await userServices.deleteOne({ _id: userId });
    } else {
      await userServices.findByIdAndUpdate(userId, { isDeleted: true });
    }

    return apiResponse({
      res,
      status: true,
      message: "Account deleted successfully",
      statusCode: StatusCodes.OK,
    });
  } catch (error) {
    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
    });
  }
};

// ---- Change Password --------
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    let user = await userServices.findOne({ _id: userId, isDeleted: false });

    if (!user) {
      return apiResponse({
        res,
        status: false,
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return apiResponse({
        res,
        status: false,
        message: "Old password is incorrect",
        statusCode: StatusCodes.UNAUTHORIZED,
        data: null,
      });
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    await userServices.update({ _id: userId }, { password: hashNewPassword });

    return apiResponse({
      res,
      statusCode: StatusCodes.OK,
      status: true,
      message: "Password changed successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error in changePassword:", error);

    return apiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  deleteAccount,
  changePassword,
};
