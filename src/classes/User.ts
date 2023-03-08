import { ObjectId } from "mongodb";
import { model, Schema, Model} from "mongoose";
import crypto from "crypto";

interface IUser {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    hashed_password: string;
    salt: string;
    admin: boolean;
    quotes: ObjectId[];
}
  
  // Put all user instance methods in this interface:
interface IUserMethods {
    authenticate: (plaintext: string) => boolean;
    encryptPassword: (password: string) => string;
    makeSalt: () => string;
}

type UserModel = Model<IUser, {}, IUserMethods>

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    username: { type: String, required: true, unique: true},
    hashed_password: { type: String, required: true},
    firstname: { type: String, required: true},
    lastname: { type: String, required: true},
    email: {index: true,
        type: String,
        trim: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required: true
    },
    salt: { type: String, required: true},
    admin: { type: Boolean, default: false},
    quotes: [{ type: Schema.Types.ObjectId, ref: "Quote"}]
});

// Hash password before saving to database
userSchema.virtual('password').set(function(password) {
  this.hashed_password = password
  this.salt = this.makeSalt()
  this.hashed_password = this.encryptPassword(password)
})
.get(function() {
  return this.hashed_password
})

userSchema.methods = {
    authenticate: function(plainText) {
      return this.encryptPassword(plainText) === this.hashed_password
    },
    encryptPassword: function(password) {
      if (!password) return ''
      try {
        return crypto
          .createHmac('sha1', this.salt)
          .update(password)
          .digest('hex')
      } catch (err) {
        return ''
      }
    },
    makeSalt: function() {
      return Math.round((new Date().valueOf() * Math.random())) + ''
    }
  } 

userSchema.path('hashed_password').validate(function(v) {
    if (this.hashed_password && this.hashed_password.length < 6) {
        this.invalidate('password', 'Password must be at least 6 characters.')
    }
    if (this.isNew && !this.hashed_password) {
        this.invalidate('password', 'Password is required')
    }
}, "")



const User = model("User", userSchema);
export default User;