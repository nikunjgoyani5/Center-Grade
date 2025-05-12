import Joi from "joi";

const verifyToken = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const registerByEmail = {
  body: Joi.object().keys({
    fullname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const verifyEmailOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.number().strict().required(),
  }),
};

const resendEmailOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const loginByEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    newPassword: Joi.string().required(),
    conformNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};

const loginByApple = {
  body: Joi.object({
    token: Joi.string().required(),
  }),
};

const loginByGoogle = {
  body: Joi.object({
    email: Joi.string().required(),
    fullname: Joi.string().required(),
    profileImage: Joi.string().optional(),
  }),
};

export default {
  verifyToken,
  registerByEmail,
  loginByEmail,
  forgotPassword,
  resendEmailOtp,
  verifyEmailOtp,
  resetPassword,
  loginByGoogle,
  loginByApple,
};
