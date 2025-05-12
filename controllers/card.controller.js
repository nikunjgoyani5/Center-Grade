import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { apiResponse } from "../helper/api-response.helper.js";
import userServices from "../services/user.service.js";

const priceApiKey = "c54ebbf1e63b815efde46ecd383ab415093e07bc";

const buildSearchUrl = (query) =>
  `https://www.pricecharting.com/api/products?t=${priceApiKey}&q=${query}`;

const buildDetailUrl = (id) =>
  `https://www.pricecharting.com/api/product?t=${priceApiKey}&id=${id}`;

// -------- Search Cards --------
const searchPriceCheckerCards = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return apiResponse({
      res,
      status: false,
      message: "Query is required",
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }

  try {
    const { data } = await axios.get(buildSearchUrl(q));

    return apiResponse({
      res,
      status: true,
      message: "Cards fetched successfully!",
      statusCode: StatusCodes.OK,
      data: data?.products,
    });
  } catch (err) {
    return apiResponse({
      res,
      status: false,
      message: "Failed to fetch cards",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// -------- Get Card Detail --------
const getPriceCheckerCardDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(buildDetailUrl(id));

    return apiResponse({
      res,
      status: true,
      message: "Card detail fetched successfully!",
      statusCode: StatusCodes.OK,
      data: data,
    });
  } catch (err) {
    return apiResponse({
      res,
      status: false,
      message: "Failed to fetch card detail",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// -------- Mark Favorite / Unfavorite -------- 
const toggleFavorite = async (req, res) => {
  const { cardId } = req.body;
  const userId = req.user.id;

  if (!cardId) {
    return apiResponse({
      res,
      status: false,
      message: "cardId is required",
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }

  const user = await userServices.findOne({ _id: userId });

  let updatedFavorites = [...user.favoriteCardIds];
  const alreadyFav = updatedFavorites.includes(cardId);

  if (alreadyFav) {
    updatedFavorites = updatedFavorites.filter((id) => id !== cardId);
  } else {
    updatedFavorites.push(cardId);
  }

  await userServices.update({ _id: userId }, { favoriteCardIds: updatedFavorites });

  return apiResponse({
    res,
    status: true,
    message: `Card ${alreadyFav ? "removed from" : "added to"} favorites`,
    statusCode: StatusCodes.OK,
  });
};

// -------- Get Favorite List --------
const getFavoriteCards = async (req, res) => {
  const userId = req.user.id;

  const user = await userServices.findOne({ _id: userId });

  const promises = user.favoriteCardIds.map((id) =>
    axios.get(buildDetailUrl(id)).then((resp) => ({
      ...resp.data,
      isFavorite: true,
    }))
  );

  const cards = await Promise.all(promises);

  return apiResponse({
    res,
    status: true,
    message: "Favorite cards fetched fetched successfully!",
    statusCode: StatusCodes.OK,
    data: cards,
  });
};

export default {
  searchPriceCheckerCards,
  getPriceCheckerCardDetail,
  toggleFavorite,
  getFavoriteCards,
};
