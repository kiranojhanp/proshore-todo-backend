import cors from "cors"
import express, { Application } from "express"
import helmet from "helmet"
import morgan from "morgan"
import responseTime from "response-time"
import "./helpers/init_env"
import { error404Handler, errorHandler } from "./middlewares/error.middleware"
import AuthRoutes from "./routes/auth.routes"
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
app.use("/auth", AuthRoutes)

// error handlers
app.use(error404Handler)
app.use(errorHandler)

export default app
