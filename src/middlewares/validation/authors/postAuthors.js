import { checkSchema, validationResult } from "express-validator"
import createError from "http-errors"
import { filterAuthorsBody } from "../../sanitize/authors/authorsSanitize.js"
import AuthorModel from "../../../services/authors/schema.js"

const schema = {
  name: {
    in: ["body"],
    exists: {
      errorMessage: "Name is mandatory",
    },
    isString: {
      errorMessage: "Name must be string!",
    },
  },
  surname: {
    in: ["body"],
    exists: {
      errorMessage: "Surname is mandatory",
    },
    isString: {
      errorMessage: "Surname must be string!",
    },
  },
  email: {
    in: ["body"],
    exists: {
      errorMessage: "Email is mandatory",
    },
    isEmail: {
      errorMessage: "Email must be a valid one!",
    },
  },
  password: {
    in: ["body"],
    exists: {
      errorMessage: "Password is mandatory",
    },
  },
  dob: {
    in: ["body"],
    exists: {
      errorMessage: "DOB is mandatory",
    },
    isDate: {
      errorMessage: "DOB must be a date",
    },
  },
  googleId: {
    in: ["body"],
    optional: { options: { nullable: true } },
  },
}
const checkPostAuthorSchema = checkSchema(schema)

const validatePostAuthorSchema = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Posting authors went wrong!",
      errors: errors.array(),
    })
  } else {
    next()
  }
}

const checkAuthorEmailExists = async (req, res, next) => {
  const author = await AuthorModel.findOne({ email: req.body.email })
  if (!author) {
    res.locals.authors = author
    next()
  } else {
    next(createError(404, `Author with email ${req.body.email} already exists!`))
  }
}

const postAuthorsMiddlewares = [
  checkPostAuthorSchema,
  validatePostAuthorSchema,
  filterAuthorsBody,
  checkAuthorEmailExists,
]

export default postAuthorsMiddlewares
