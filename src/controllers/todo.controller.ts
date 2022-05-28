import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"
import Todo from "../models/todo.model"
import { todoSchema } from "../validations/todo.schema"

// @desc Get All todos , @route GET /todo, @access Private
const getTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const todos = await Todo.find({})
        if (!todos) throw new createHttpError.NotFound()
        res.send(todos)
    } catch (error) {
        next(error)
    }
}

// @desc Add new todo , @route POST /todo, @access Private
const addTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, status, date } = req.body
        const result = await todoSchema.validateAsync({ name, description, status, date })
        const todo = new Todo(result)
        const saveTodo = await todo.save()
        res.status(201).json(saveTodo)
    } catch (error) {
        next(error)
    }
}

export { getTodos, addTodo }
