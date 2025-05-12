import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../helper/api-response.helper.js";
import Collection from "../models/collection.model.js";
import mongoose from "mongoose";

// Get All Collections for User
const getCollections = async (req, res) => {
  const userId = req.user.id;
  
  const collections = await Collection.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "carddetects",
        let: { collectionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$$collectionId", "$storeCollection.id"]
              }
            }
          }
        ],
        as: "items"
      }
    },
    {
      $addFields: {
        itemCount: { $size: "$items" }
      }
    },
    {
      $project: {
        items: 0
      }
    },
    { $sort: { createdAt: 1 } }
  ]);

  return apiResponse({
    res,
    status: true,
    message: "Collections fetched successfully",
    statusCode: StatusCodes.OK,
    data: collections,
  });
};

// Create New Collection
const createCollection = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  if (!name) {
    return apiResponse({
      res,
      status: false,
      message: "Collection name is required",
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }

  const collection = await Collection.create({ userId, name });
  return apiResponse({
    res,
    status: true,
    message: "Collection created successfully",
    statusCode: StatusCodes.CREATED,
    data: collection,
  });
};

// Rename Collection
const renameCollection = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;

  const collection = await Collection.findOne({ _id: id, userId });

  if (!collection || collection.isDefault) {
    return apiResponse({
      res,
      status: false,
      message: "Cannot rename default or non-existent collection",
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }

  collection.name = name;
  await collection.save();

  return apiResponse({
    res,
    status: true,
    message: "Collection renamed successfully",
    statusCode: StatusCodes.OK,
    data: collection,
  });
};

// Delete Collection
const deleteCollection = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const collection = await Collection.findOne({ _id: id, userId });

  if (!collection || collection.isDefault) {
    return apiResponse({
      res,
      status: false,
      message: "Cannot delete default or non-existent collection",
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }

  await collection.deleteOne();

  return apiResponse({
    res,
    status: true,
    message: "Collection deleted successfully",
    statusCode: StatusCodes.OK,
  });
};

export default {
  getCollections,
  createCollection,
  renameCollection,
  deleteCollection,
};
