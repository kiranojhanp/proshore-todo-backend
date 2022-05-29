import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import { signAccessToken } from "../middlewares/auth.middleware"
import User from "../models/user.model"
import { loginSchema, signupSchema } from "../validations/auth.schema"

// @desc register an account , @route POST /auth/register, @access Public
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await signupSchema.validateAsync(req.body)
        const { email } = result
        const doesExist = await User.findOne({ email })

        if (doesExist) throw new createError.Conflict(`${result.email} is already been registered`)

        const user = new User(result)
        const savedUser = await user.save()
        console.log(savedUser)

        const accessToken = await signAccessToken(savedUser.id)

        console.log(accessToken)

        res.send({ accessToken })
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

// @desc login , @route POST /auth/login, @access Public
const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await loginSchema.validateAsync(req.body)
        const user = await User.findOne({
            email: result.email,
        })
        if (!user) throw new createError.NotFound("User not registered")

        const isMatch = await user.isValidPassword(result.password)
        if (!isMatch) throw new createError.Unauthorized("Username/password not valid")

        const accessToken = await signAccessToken(user.id)

        res.send({ accessToken })
    } catch (error) {
        if (error.isJoi === true) return next(new createError.BadRequest("Invalid Username/Password"))
        next(error)
    }
}

export { register, login }
