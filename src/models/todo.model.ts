import { Document, model, Schema, Types } from "mongoose"
import { ITodo } from "../types/todo.types"

const todoTaskSchema = new Schema<ITodo>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // status: true => Done
    // status: false => Upcoming
    status: {
        type: Boolean,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

// convert _id => id on response
todoTaskSchema.set("toJSON", {
    virtuals: true,
})

const Todo = model<ITodo>("TodoTask", todoTaskSchema)
export default Todo

export type TodoType =
    | (Document<unknown, any, ITodo> &
          ITodo & {
              _id: Types.ObjectId
          })
    | null
