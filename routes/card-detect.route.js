import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import cardDetectController from "../controllers/card-detect.controller.js";

const upload = multer();

const router = express.Router();

router.get("/list", verifyToken, cardDetectController.getAllCardDetects);

router.get("/detail/:id", verifyToken, cardDetectController.getCardDetectById);

router.post("/add", verifyToken, upload.fields([{ name: "frontImageFile", maxCount: 1 },{ name: "backImageFile", maxCount: 1 }]), cardDetectController.createCardDetect);

router.put("/update/:id", verifyToken, upload.fields([{ name: "frontImageFile", maxCount: 1 },{ name: "backImageFile", maxCount: 1 }]), cardDetectController.updateCardDetect);

router.delete("/delete/:id", verifyToken, cardDetectController.deleteCardDetect);

router.patch("/toggle-favorite/:id", verifyToken, cardDetectController.toggleFavoriteStatus);

router.get("/favorites", verifyToken, cardDetectController.getFavoriteCards);

router.post("/add-to-collection", verifyToken, cardDetectController.addCardToCollection);

router.get("/by-collection/:collectionId", verifyToken, cardDetectController.getCardsByCollection);

router.post("/remove-card-from-collection", verifyToken, cardDetectController.removeCardFromCollection);

export default router;
