import bcrypt from "bcrypt"
import { promisify } from "util"

export const HASH_ASYNC = promisify(bcrypt.hash).bind(bcrypt)
export const HASH_COMPARE_ASYNC = promisify(bcrypt.compare).bind(bcrypt)
