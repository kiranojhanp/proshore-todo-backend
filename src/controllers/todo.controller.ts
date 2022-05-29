import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"
import Todo, { TodoType } from "../models/todo.model"
import { todoSchema } from "../validations/todo.schema"

// @desc Get All todos , @route GET /todo, @access Private
const getTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user.aud
        const todos = await Todo.find({ user })
        if (!todos) throw new createHttpError.NotFound()
        res.status(200).send(todos)
    } catch (error) {
        next(error)
    }
}

// @desc Add new todo , @route POST /todo, @access Private
const addTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user.aud
        const { name, description, status, date } = req.body
        const result = await todoSchema.validateAsync({ user, name, description, status, date })
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
        const { aud } = req.user
        const { id } = req.params
        const todo = await getIfDataExists(id)
        await checkOwner(todo, aud)
        res.status(200).json(todo)
    } catch (error) {
        next(error)
    }
}

// @desc Update single todo , @route PUT /todo/:id, @access Private
const updateTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const user = req.user.aud
        const { name, description, status, date } = req.body
        const result = await todoSchema.validateAsync({ user, name, description, status, date })
        const todo = await getIfDataExists(id)
        await checkOwner(todo, user)
        const updatedTodo = await Todo.findByIdAndUpdate(id, result, { new: true })
        res.status(200).json(updatedTodo)
    } catch (error) {
        next(error)
    }
}

// @desc Delete single todo , @route DELETE /todo/:id, @access Private
const deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { aud } = req.user
        const todo = await getIfDataExists(id)
        await checkOwner(todo, aud)
        await todo.remove()
        res.status(200).json({ message: "Recipe deleted" })
    } catch (error) {
        next(error)
    }
}

// Utility functions
// Get todo item only if it exists
const getIfDataExists = async (id: string) => {
    return new Promise<TodoType | any>((resolve, reject) => {
        Todo.findById(id)
            .then((todo) => {
                if (!todo) {
                    reject(new createHttpError.NotFound(`Todo item of id:"${id}" doesn't exist`))
                }
                resolve(todo)
            })
            .catch((err) => console.log(err))
    })
}

// Check authorization
const checkOwner = async (todo: TodoType | any, aud: string) => {
    return new Promise((resolve, reject) => {
        const { user } = todo
        if (user.toString() !== aud) {
            reject(new createHttpError.Unauthorized("You did not create this item"))
        }
        resolve(todo)
    })
}

export { getTodos, addTodo, getTodo, updateTodo, deleteTodo }
