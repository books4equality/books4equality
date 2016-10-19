var mongoose = require('mongoose')
var bcrypt = require('bcryptjs'),
  SALT_WORK_FACTOR = 10


// admin will be the schoolID of the school the admin works at
// superuser will be a boolean for site admins, ie people who
// can create and delete users and books
var userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  firstName: String,
  lastName: String,
  schoolID: String,
  superUser: Boolean,
  admin: Boolean,
  creationDate: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
})

userSchema.pre('save', function (next) {
  var user = this
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

userSchema.methods.updatePassword = function (newPassword, callback) {
  var user = this
  user.password = newPassword
  user.resetPasswordExpires = undefined
  user.resetPasswordToken = undefined
  user.save(function (err) {
    if (err) {
      return callback(err)
    }
    return callback(null, 'Successful Update')
  })
}

userSchema.methods.comparePassword = function (cantidatePassword, callback) {
  bcrypt.compare(cantidatePassword, this.password, function (err, isMatch) {
    if (err) return callback(err)
    callback(undefined, isMatch)
  })
}

var User = mongoose.model('user', userSchema)

module.exports = User

