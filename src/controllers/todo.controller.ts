import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"
import Todo from "../models/todo.model"
import { todoSchema } from "../validations/todo.schema"

// @desc Get All todos , @route GET /todo, @access Private
const getTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const todos = await Todo.find({})
        if (!todos) throw new createHttpError.NotFound()
        res.status(200).send(todos)
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

// @desc Get single todo , @route GET /todo/:id, @access Private
const getTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const todo = await Todo.findById(id)
        if (!todo) throw new createHttpError.NotFound(`Todo item of id:"${id}" not found`)
        res.status(200).json(todo)
    } catch (error) {
        next(error)
    }
}

// @desc Update single todo , @route PUT /todo/:id, @access Private
const updateTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { name, description, status, date } = req.body
        const result = await todoSchema.validateAsync({ name, description, status, date })
        const todo = await Todo.findByIdAndUpdate(id, result, { new: true })
        res.status(200).json(todo)
    } catch (error) {
        next(error)
    }
}

// @desc Delete single todo , @route DELETE /todo/:id, @access Private
const deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const todo = await Todo.findById(id)
        if (!todo) throw new createHttpError.NotFound()
        await todo.remove()
        res.status(204).json({ message: "Recipe deleted" })
    } catch (error) {
        next(error)
    }
}

export { getTodos, addTodo, getTodo, updateTodo, deleteTodo }
