import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import JWT from "jsonwebtoken"

const { ACCESS_TOKEN_SECRET } = process.env

const signAccessToken = (userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = {}
        const secret = ACCESS_TOKEN_SECRET as string
        const options = {
            expiresIn: "1h",
            issuer: "todoapp",
            audience: userId,
        }
        JWT.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
                return
            }
            resolve(token as string)
        })
    })
}

const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers["authorization"]) return next(new createError.Unauthorized())
    const authHeader = req.headers["authorization"]
    const bearerToken = authHeader.split(" ")
    const token = bearerToken[1]
    const secret = ACCESS_TOKEN_SECRET as string
    JWT.verify(token, secret, (err, payload) => {
        if (err) {
            const message = err.name === "JsonWebTokenError" ? "Unauthorized" : err.message
            return next(new createError.Unauthorized(message))
        }
        req.user = payload
        next()
    })
}

export { signAccessToken, verifyAccessToken }
