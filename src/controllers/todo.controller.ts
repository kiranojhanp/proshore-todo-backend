import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"
import { client } from "../helpers/init_redis"
import Todo, { TodoType } from "../models/todo.model"
import { todoSchema } from "../validations/todo.schema"

// @desc Get All todos , @route GET /todo, @access Private
const getTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status || ""
        const user = req.user.aud as string

        let todos

        if (status === "done") {
            // get done todos from redis memory if already available
            const donetodos = await client.GET("done-todos" + user)
            if (donetodos) {
                res.send(JSON.parse(donetodos))
                return
            }

            // get done todos from mongodb if not available in redis
            todos = await Todo.find({ user, status: true })

            // cache data every 1 second
            // database operations are expensive so caching is a necessity
            // set 1 second as todo list is expected to be updated by users very frequently
            await client.setEx("done-todos" + user, 1, JSON.stringify(todos))
        } else if (status === "upcoming") {
            // get upcoming todos from redis memory if already available
            const upcomingtodos = await client.GET("upcoming-todos" + user)
            if (upcomingtodos) {
                res.send(JSON.parse(upcomingtodos))
                return
            }

            // get upcoming todos from mongodb if not available in redis
            todos = await Todo.find({ user, status: false })
            await client.setEx("upcoming-todos" + user, 1, JSON.stringify(todos))
        } else {
            // get todos from redis memory if already available
            const alltodos = await client.GET("todos" + user)

            if (alltodos) {
                res.send(JSON.parse(alltodos))
                return
            }

            // get todos from mongodb if not available in redis
            todos = await Todo.find({ user })
            await client.setEx("todos" + user, 2, JSON.stringify(todos))
        }

        if (!todos) throw new createHttpError.NotFound()
        res.status(200).send(todos)
    } catch (error) {
        next(error)
    }
}

// @desc Delete All todos , @route DELETE /todo, @access Private
const deleteTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user.aud
        const response = await Todo.deleteMany({ user })
        console.log(response)
        if (response.deletedCount === 0) throw new createHttpError.NotFound("No todos present in the database")
        res.status(200).json({ message: "Todos deleted" })
    } catch (error) {
        next(error)
    }
}

// @desc Add new todo , @route POST /todo, @access Private
const addTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user.aud
        const { name, description, status, date } = req.body
        // validate form data using joi schema
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

        // get todo item from redis memory if already available
        const todoItem = await client.GET("todo-item" + id)
        if (todoItem) {
            res.send(JSON.parse(todoItem))
            return
        }

        // either throws notfound error, or resolves the promise with todo item data
        const todo = await getIfDataExists(id)
        // either throws unauthorized error, or resolves the promise with true
        await checkOwner(todo, aud)
        // cache the todo-item in redis
        await client.setEx("todo-item" + id, 1, JSON.stringify(todo))
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
        res.status(200).json({ message: "Todos deleted" })
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

export { getTodos, deleteTodos, addTodo, getTodo, updateTodo, deleteTodo }
