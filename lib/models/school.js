var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'),
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
var schoolSchema = new mongoose.Schema({
    password: {type: String},
    schoolID: {type: String, unique: true},
    schoolName: String
    
});

schoolSchema.pre('save',function(next){
    var school = this;

    //only hash if it has been modified 
    if(!school.isModified('password')) return next();

    //salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);

        //hash
        bcrypt.hash(school.password, salt, function(err, hash){
            if(err) return next(err);

            //override the cleartext passwrod with the hashed one
            school.password = hash;
            next();
        });
    });
});

schoolSchema.methods.comparePassword = function(cantidatePassword, callback){
    bcrypt.compare(cantidatePassword, this.password, function(err, isMatch){
        if(err) return callback(err);
        callback(undefined, isMatch);
    });
};

var School = mongoose.model('school', schoolSchema);

module.exports = School;

