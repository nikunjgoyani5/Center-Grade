import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../helper/api-response.helper.js";
import CardDetect from "../models/card-detect.model.js";
import fileUploadService from "../services/file.upload.service.js";
import Collection from "../models/collection.model.js";
import helper from "../helper/common.helper.js";

// --------------------- CREATE CARD ---------------------
const createCardDetect = async (req, res) => {
  const userId = req.user.id;
  const { cardName, frontImageUrl, backImageUrl, frontDetails, backDetails, priceCheckerDetails, isFavorite = false, storeCollection = [] } = req.body;

  const files = req.files || {};
  let resolvedFrontUrl = null;
  let resolvedBackUrl = null;

  try {
    // Validate: Only one of file or URL for front image
    if (files.frontImageFile && frontImageUrl) {
      return apiResponse({
        res,
        status: false,
        message: "Send either frontImageFile or frontImageUrl, not both",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    // Upload front file if exists
    if (files.frontImageFile?.[0]) {
      resolvedFrontUrl = await fileUploadService.uploadFile(files.frontImageFile[0], "cards");
    } else if (frontImageUrl) {
      resolvedFrontUrl = frontImageUrl;
    }

    // Validate: Only one of file or URL for back image
    if (files.backImageFile && backImageUrl) {
      return apiResponse({
        res,
        status: false,
        message: "Send either backImageFile or backImageUrl, not both",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    // Upload back file if exists
    if (files.backImageFile?.[0]) {
      resolvedBackUrl = await fileUploadService.uploadFile(files.backImageFile[0], "cards");
    } else if (backImageUrl) {
      resolvedBackUrl = backImageUrl;
    }

    // Save to DB
    const newCard = await CardDetect.create({
      userId,
      cardName,
      frontImageUrl: resolvedFrontUrl,
      backImageUrl: resolvedBackUrl,
      frontDetails: frontDetails ? JSON.parse(frontDetails) : {},
      backDetails: backDetails ? JSON.parse(backDetails) : {},
      priceCheckerDetails: priceCheckerDetails ? JSON.parse(priceCheckerDetails) : {},
      isFavorite,
      storeCollection,
    });
    const defaultCollection = await Collection.findOne({ userId, isDefault: true, name: "All" });
    if (defaultCollection) {
      newCard.storeCollection.push({ id: defaultCollection._id, name: defaultCollection.name });
      await newCard.save();
    }

    return apiResponse({
      res,
      status: true,
      message: "Card detected and stored successfully",
      statusCode: StatusCodes.CREATED,
      data: newCard,
    });
  } catch (error) {
    return apiResponse({
      res,
      status: false,
      message: "Error parsing JSON data",
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }
};

// --------------------- GET ALL CARDS -------------------
// const getAllCardDetects = async (req, res) => {
//   const userId = req.user.id;

//   const cards = await CardDetect.find({ userId }).sort({ createdAt: -1 });

//   return apiResponse({
//     res,
//     status: true,
//     message: "Cards fetched successfully",
//     statusCode: StatusCodes.OK,
//     data: cards,
//   });
// };

const getAllCardDetects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, page = 1, limit = 10 } = req.query;

    const { skip, limit: parsedLimit } = helper.paginationFun({ page, limit });

    let filter = { userId };

    if (search) {
      filter["priceCheckerDetails.name"] = {
        $regex: search,
        $options: "i",
      };
    }

    // Step 1: Get total count for pagination
    const totalItems = await CardDetect.countDocuments(filter);

    // Step 2: Fetch filtered and paginated data
    const cards = await CardDetect.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    // Step 3: Filter out records where `priceCheckerDetails.name` is missing/null/empty
    const filteredCards = cards.filter(
      (card) =>
        card.priceCheckerDetails &&
        card.priceCheckerDetails.name &&
        card.priceCheckerDetails.name.trim() !== ""
    );

    const pagination = helper.paginationDetails({
      page,
      totalItems,
      limit: parsedLimit,
    });

    return apiResponse({
      res,
      status: true,
      message: "Cards fetched successfully",
      statusCode: StatusCodes.OK,
      data: {
        page: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        limit: pagination.limit,
        data: filteredCards,
      },
    });
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      status: false,
      message: "Failed to fetch cards",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// --------------------- GET SINGLE CARD -----------------
const getCardDetectById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const card = await CardDetect.findOne({ _id: id, userId });

  if (!card) {
    return apiResponse({
      res,
      status: false,
      message: "Card not found",
      statusCode: StatusCodes.NOT_FOUND,
    });
  }

  return apiResponse({
    res,
    status: true,
    message: "Card fetched successfully",
    statusCode: StatusCodes.OK,
    data: card,
  });
};

// --------------------- UPDATE CARD ---------------------
const updateCardDetect = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    cardName,
    frontImageUrl,
    backImageUrl,
    frontDetails,
    backDetails,
    priceCheckerDetails,
    isFavorite,
    storeCollection,
  } = req.body;

  const files = req.files || {};
  const card = await CardDetect.findOne({ _id: id, userId });

  if (!card) {
    return apiResponse({
      res,
      status: false,
      message: "Card not found",
      statusCode: StatusCodes.NOT_FOUND,
    });
  }

  // FRONT IMAGE
  if (files.frontImageFile?.[0]) {
    card.frontImageUrl = await fileUploadService.uploadFile(files.frontImageFile[0], "cards");
  } else if (frontImageUrl) {
    card.frontImageUrl = frontImageUrl;
  }

  // BACK IMAGE
  if (files.backImageFile?.[0]) {
    card.backImageUrl = await fileUploadService.uploadFile(files.backImageFile[0], "cards");
  } else if (backImageUrl) {
    card.backImageUrl = backImageUrl;
  }

  if(cardName) card.cardName = cardName;
  if (frontDetails) card.frontDetails = JSON.parse(frontDetails);
  if (backDetails) card.backDetails = JSON.parse(backDetails);
  if (priceCheckerDetails) card.priceCheckerDetails = JSON.parse(priceCheckerDetails);
  if (typeof isFavorite !== "undefined") card.isFavorite = isFavorite;
  if (storeCollection) card.storeCollection = storeCollection;

  await card.save();

  return apiResponse({
    res,
    status: true,
    message: "Card updated successfully",
    statusCode: StatusCodes.OK,
    data: card,
  });
};

// --------------------- DELETE CARD ---------------------
const deleteCardDetect = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const card = await CardDetect.findOne({ _id: id, userId });

  if (!card) {
    return apiResponse({
      res,
      status: false,
      message: "Card not found",
      statusCode: StatusCodes.NOT_FOUND,
    });
  }

  await card.deleteOne();

  return apiResponse({
    res,
    status: true,
    message: "Card deleted successfully",
    statusCode: StatusCodes.OK,
  });
};

// --------------------- TOGGLE FAVORITE STATUS ----------
const toggleFavoriteStatus = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const card = await CardDetect.findOne({ _id: id, userId });

  if (!card) {
    return apiResponse({
      res,
      status: false,
      message: "Card not found",
      statusCode: StatusCodes.NOT_FOUND,
    });
  }

  card.isFavorite = !card.isFavorite;
  await card.save();

  return apiResponse({
    res,
    status: true,
    message: `Card marked as ${card.isFavorite ? "favorite" : "not favorite"}`,
    statusCode: StatusCodes.OK,
    data: { id: card._id, isFavorite: card.isFavorite },
  });
};

// --------------------- GET FAVORITE CARDS --------------
const getFavoriteCards = async (req, res) => {
  const userId = req.user.id;

  const favoriteCards = await CardDetect.find({ userId, isFavorite: true }).sort({ createdAt: -1 });

  return apiResponse({
    res,
    status: true,
    message: "Favorite cards fetched successfully",
    statusCode: StatusCodes.OK,
    data: favoriteCards,
  });
};

// --------------------- ADD CARD TO COLLECTION ----------
const addCardToCollection = async (req, res) => {
  const userId = req.user.id;
  const { cardId, collectionId } = req.body;

  const card = await CardDetect.findOne({ _id: cardId, userId });
  const collection = await Collection.findOne({ _id: collectionId, userId });

  if (!card || !collection) {
    return apiResponse({
      res,
      status: false,
      message: "Invalid card or collection",
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }

  // Check if already added
  const alreadyExists = card.storeCollection.some(c => c.id.toString() === collectionId);
  if (!alreadyExists) {
    card.storeCollection.push({ id: collection._id, name: collection.name });
    await card.save();
  }

  return apiResponse({
    res,
    status: true,
    message: "Card added to collection successfully",
    statusCode: StatusCodes.OK,
    data: card,
  });
};

// --------------------- GET CARDS BY COLLECTION ---------
const getCardsByCollection = async (req, res) => {
  const userId = req.user.id;
  const { collectionId } = req.params;

  const cards = await CardDetect.find({ userId, storeCollection: { $elemMatch: { id: collectionId } } }).sort({ createdAt: -1 });

  return apiResponse({
    res,
    status: true,
    message: "Cards fetched for collection",
    statusCode: StatusCodes.OK,
    data: cards,
  });
};

// --------------------- REMOVE CARD BY COLLECTION ---------
const removeCardFromCollection = async (req, res) => {
  const userId = req.user.id;
  const { cardId, collectionId } = req.body;

  try {
    const card = await CardDetect.findOne({ _id: cardId, userId });

    if (!card) {
      return apiResponse({
        res,
        status: false,
        message: "Card not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    // Filter out the collection to be removed
    const originalLength = card.storeCollection.length;
    card.storeCollection = card.storeCollection.filter((c) => c.id.toString() !== collectionId);

    // Check if any change happened
    if (card.storeCollection.length === originalLength) {
      return apiResponse({
        res,
        status: false,
        message: "Collection not found in card",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    await card.save();

    return apiResponse({
      res,
      status: true,
      message: "Card removed from collection successfully",
      statusCode: StatusCodes.OK,
      data: card,
    });
  } catch (error) {
    return apiResponse({
      res,
      status: false,
      message: "Error while removing card from collection",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export default {
  createCardDetect,
  getAllCardDetects,
  getCardDetectById,
  updateCardDetect,
  deleteCardDetect,
  toggleFavoriteStatus,
  getFavoriteCards,
  addCardToCollection,
  getCardsByCollection,
  removeCardFromCollection
};
