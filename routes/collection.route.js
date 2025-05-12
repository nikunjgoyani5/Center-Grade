import express from "express";
import collectionController from "../controllers/collection.controller.js";
import { verifyToken } from "../middleware/verify-token.middleware.js";

const router = express.Router();

router.get("/list", verifyToken, collectionController.getCollections);
router.post("/add", verifyToken, collectionController.createCollection);
router.put("/update/:id", verifyToken, collectionController.renameCollection);
router.delete("/delete/:id", verifyToken, collectionController.deleteCollection);

export default router;
