import Joi from "joi"

export const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required(),
})

export const signupSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required().valid(Joi.ref("password")),
})
