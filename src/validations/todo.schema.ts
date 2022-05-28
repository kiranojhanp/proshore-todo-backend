import Joi from "joi"

export const todoSchema = Joi.object({
    name: Joi.string().lowercase().required(),
    description: Joi.string().min(6).required(),
    status: Joi.boolean().required(),
    date: Joi.date(),
})
