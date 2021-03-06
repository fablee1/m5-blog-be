import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const AuthorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: { type: String },
  },
  {
    timestamps: true,
  }
)

AuthorSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

AuthorSchema.methods.toJSON = function () {
  const userDocument = this
  const userObject = userDocument.toObject()
  delete userObject.password
  delete userObject.__v
  return userObject
}

AuthorSchema.statics.checkCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email })
  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password)
    console.log(isMatch)
    return isMatch ? user : null
  } else {
    return null
  }
}

export default model("Author", AuthorSchema)
