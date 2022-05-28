import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"

/* provide 404 response if no routes match */
export const error404Handler = async (req: Request, res: Response, next: NextFunction) => {
    next(new createHttpError.NotFound())
}

/*  General error handler: returns JSON with error info to the client */
/* note: the next:NextFunction should be passed to avoid default error handler*/
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    // 422 Unprocessable Entity
    // server understands the content type but but was unable to process the data
    if (err.isJoi === true) err.status = 422

    res.status(err.status || 500)
    res.json({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    })
}
