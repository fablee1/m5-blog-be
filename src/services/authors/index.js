import { Router } from "express"

import createError from "http-errors"
import postAuthorsMiddlewares from "./../../middlewares/validation/authors/postAuthors.js"
import putAuthorMiddlewares from "../../middlewares/validation/authors/putAuthors.js"
import { getAuthorsCsv } from "../../utils/csv.js"

import AuthorModel from "./schema.js"

const authorsRouter = Router()

authorsRouter.get("/csv", (req, res, next) => {
  try {
    getAuthorsCsv(res)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await AuthorModel.find()
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:id", async (req, res, next) => {
  try {
    const author = await AuthorModel.findById(req.params.id)
    res.send(author)
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/", postAuthorsMiddlewares, async (req, res, next) => {
  try {
    const avatar = `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`
    const newUser = new AuthorModel({
      ...req.body,
      avatar,
    })
    const { _id } = await newUser.save(newUser)
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

authorsRouter.put("/:id", putAuthorMiddlewares, async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (updatedAuthor) {
      res.send(updatedAuthor)
    } else {
      next(createError(400, "Author does not exist!"))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorModel.findByIdAndDelete(req.params.id)
    if (deletedAuthor) {
      res.status(204).send()
    } else {
      next(createError(404, `Author with _id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/checkEmail", async (req, res, next) => {
  try {
    const user = await AuthorModel.findOne({ email: req.body.email })
    if (user) {
      res.status(201).send({ exists: true })
    } else {
      res.status(201).send({ exists: false })
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await AuthorModel.checkCredentials(email, password)
    if (user) {
      const { accessToken, refreshToken } = await JWTAuthenticate(user)
      res.send({ accessToken, refreshToken })
    } else {
      next(createError(401, "Credentials not valid!"))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/refreshToken", async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const { accessToken, refreshToken } = await refreshTokens(refreshToken)
    res.send({ accessToken, refreshToken })
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/logout", JWTAuthMiddleware, async (req, res, next) => {
  try {
    req.user.refreshToken = null
    await req.user.save()
    res.send()
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/register", async (req, res, next) => {
  try {
    const user = await AuthorModel.findOne({ email: req.body.email })
    if (user) {
      next(createError(401, ""))
    } else {
      const newUser = new AuthorModel(req.body)
      const { _id } = await newUser.save()
      res.status(201).send({ _id })
    }
  } catch (error) {
    next(error)
  }
})

export default authorsRouter
