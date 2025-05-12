import Joi from "joi";

const updateUserProfile = {
  body: Joi.object().keys({
    fullname: Joi.string().allow(null, "").min(1).max(100),
    profileImage: Joi.string().allow(null, ""),
    dateOfBirth: Joi.string().allow(null, ""),
  })
};

const deleteUserAccountValidation = {
  body: Joi.object().keys({
    isPermanentlyDelete: Joi.boolean().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
    conformNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};

export default {
  updateUserProfile,
  deleteUserAccountValidation,
  changePassword,
};
