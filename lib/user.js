var mongoose = require('mongoose');
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var url = process.env.MONGO_URL || 'mongodb://localhost:27017/b4e';
if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
    url = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
}

mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error'));
db.once('open', function(){
    console.log('Mongoose connected');
});

//Mongoose user_views schema
var userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String},
    firstName: String,
    lastName: String,
    email: String
});

/*
userSchema.methods.insert = function(user, callback) {
    db.get().collection('users').save(user, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
};
*/

var User = mongoose.model('user', userSchema);


module.exports = User;

