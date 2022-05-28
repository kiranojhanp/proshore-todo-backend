import cors from "cors"
import express, { Application } from "express"
import helmet from "helmet"
import morgan from "morgan"
import responseTime from "response-time"
import { error404Handler, errorHandler } from "./middlewares/error.middleware"
import TodoRoutes from "./routes/todo.routes"
import("./helpers/init_db")

const app: Application = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(responseTime())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/todo", TodoRoutes)

// error handlers
app.use(error404Handler)
app.use(errorHandler)

export default app
