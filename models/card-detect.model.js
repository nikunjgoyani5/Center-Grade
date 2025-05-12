import mongoose from "mongoose";

const cardDetectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardName: { type: String, default: null },
  frontImageUrl: { type: String, default: null },
  backImageUrl: { type: String, default: null },
  frontDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  backDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  priceCheckerDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  isFavorite: { type: Boolean, default: false },
  storeCollection: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
    name: String,
    _id: false,
  }],
}, { timestamps: true });

const CardDetect = mongoose.model("CardDetect", cardDetectSchema);
export default CardDetect;
