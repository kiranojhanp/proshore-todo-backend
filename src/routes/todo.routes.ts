import express from "express"
import { addTodo, getTodo, getTodos, updateTodo } from "../controllers/todo.controller"

const router = express.Router()

router.get("/", getTodos)
router.post("/", addTodo)
router.get("/:id", getTodo)
router.put("/:id", updateTodo)

export default router
