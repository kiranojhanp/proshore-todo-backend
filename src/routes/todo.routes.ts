import express from "express"
import { addTodo, deleteTodo, deleteTodos, getTodo, getTodos, updateTodo } from "../controllers/todo.controller"

const router = express.Router()

router.get("/", getTodos)
router.post("/", addTodo)
router.delete("/", deleteTodos)
router.get("/:id", getTodo)
router.put("/:id", updateTodo)
router.delete("/:id", deleteTodo)

export default router
