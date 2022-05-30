import Joi from "joi"

export const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required(),
})

export const signupSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string()
        .required()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
            "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
        ),
    confirmPassword: Joi.string().required().valid(Joi.ref("password")),
})
