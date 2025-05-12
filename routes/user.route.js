import express from "express";
import userController from "../controllers/user.controller.js";
import validate from "../middleware/validate.middleware.js";
import userValidation from "../validations/user.validation.js";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const route = express.Router();

// ---------------------------------------------- Profile Management ----------------------------------------------

route.get("/profile", verifyToken, userController.getUserProfile);

route.put("/profile", verifyToken, upload.single("profileImage"), validate(userValidation.updateUserProfile), userController.updateUserProfile);

route.put("/change-password", verifyToken, validate(userValidation.changePassword), userController.changePassword);

route.delete("/delete-account", verifyToken, validate(userValidation.deleteUserAccountValidation), userController.deleteAccount);

export default route;