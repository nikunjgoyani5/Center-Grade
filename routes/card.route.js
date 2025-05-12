import express from "express";
import cardController from "../controllers/card.controller.js";
import { verifyToken } from "../middleware/verify-token.middleware.js";

const router = express.Router();

router.get("/search-price-checker", verifyToken, cardController.searchPriceCheckerCards);

router.get("/price-checker-details/:id", verifyToken, cardController.getPriceCheckerCardDetail);

router.post("/toggle-favorite", verifyToken, cardController.toggleFavorite);

router.get("/favorites", verifyToken, cardController.getFavoriteCards);

export default router;
