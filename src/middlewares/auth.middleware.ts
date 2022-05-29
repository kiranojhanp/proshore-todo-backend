import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import JWT from "jsonwebtoken"

const { ACCESS_TOKEN_SECRET } = process.env as { [key: string]: string }

const signAccessToken = (userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = {}
        const secret = ACCESS_TOKEN_SECRET
        const options = {
            expiresIn: "1h",
            issuer: "www.ghurghura.com",
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
    JWT.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            const message = err.name === "JsonWebTokenError" ? "Unauthorized" : err.message
            return next(new createError.Unauthorized(message))
        }
        req.payload = payload
        next()
    })
}

export { signAccessToken, verifyAccessToken }
