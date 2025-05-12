import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  name: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;

