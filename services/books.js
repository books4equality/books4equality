'use strict';

var memoize = require('memoizeasync'),
    db = require('./db'),
    logger = require('./logger'),
    ObjectID = require('mongodb').ObjectID;

function parseCategories(categories) {
    function isEmpty(element) {
        return element;
    }

    return categories.split(',').filter(isEmpty);
}

function find(options, callback) {
    var criteria = {
        $query: {
            //"_meta.available": true
        }
    };
    
    if (options.school) {
        criteria.$query["school"] = options.school;
    }

    if (options.title) {
        criteria.$query.title = { $regex: options.title, $options: 'i' };
    }

    if (options.categories) {
        var categories = parseCategories(options.categories);
        if (categories.length > 0) {
            criteria.$query.categories = { $in: categories };
        }
    }

    if (options.isbn) {
        criteria.$query["_meta.isbn"] = options.isbn;
    }

    if (options.barcode){
        criteria.$query["_meta.barcode"] = options.barcode;
    }


    if (options.orderby) {
        criteria.$orderby = {};
        criteria.$orderby[options.orderby] = parseInt(options.dir) || 1;
    }

    var hints = {
        limit: 100
    };

    if (options.skip) {
        hints.skip = parseInt(options.skip);
    }

    logger.info('search criteria %j', criteria);
    logger.info('search hints %j', hints);

    console.log(criteria);
    db.get().collection('books').find(criteria, hints).toArray(function(err, books) {
        if (err) {
            return callback(err);
        }

        return callback(null, books);


    });
}

function findOne(id, callback) {
    var oid = new ObjectID(id)
    var criteria = {
        _id: oid,
        available: true
    };

    db.get().collection('books').findOne(criteria, function(err, book) {
        if (err) {
            return callback(err);
        }
        return callback(null, book);
    });
}

function findOneByBarcode(barcode, callback){
    var criteria = {'_meta.barcode': barcode,'_meta.available': true};

    db.get().collection('books').findOne(criteria, function(err, book){
        if(err){
            return callback(err);
        }
        return callback(null, book);
    });
}

function findReservedBookByBarcode(barcode, callback){
    var criteria = {'_meta.barcode': String(barcode)};

    db.get().collection('books').findOne(criteria, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function findUsersBooks(criteria, callback){
    db.get().collection('books').find(criteria).toArray(function(err, books){
        if(err){return callback(err);}

        return callback(null, books);

    });
}

function findReservedBooks(options, callback){

    var criteria = {};
    criteria.$query = {};

    criteria.$query['_meta.available'] = false;

    if (options.title) {
        criteria.$query.title = { $regex: options.title, $options: 'i' };
    }

    if(options.email){
        criteria.$query["_meta.reservedBy.email"] = options.email;
    }

    if(options.isbn){
        criteria.$query["_meta.isbn"] = options.isbn;
    }

    if(options.barcode){
        criteria.$query["_meta.barcode"] = options.barcode;
    }

    if (options.orderby) {
        //var order = options.orderby;
        criteria.$orderby = {};
        criteria.$orderby[options.orderby] = parseInt(options.dir) || 1;

        //$orderby[options.orderby] =

    }

    //console.log(criteria);

    db.get().collection('books').find(criteria).toArray(function(err, books){
        if(err){ return callback(err); }

        return callback(null, books);
    });
}

function unreserveBook(barcode, user, book, callback){
    var criteria = {
        '_meta.barcode': barcode
    };

    var updateQuery = {
        $unset:{ '_meta.reservedBy': ''},
        $set:{'_meta.available':true}
    };


    if(user.email != book._meta.reservedBy.email && user.admin == false){
        return callback(null, false);  //Not Authed
    }

    db.get().collection('books').update(criteria, updateQuery, function(err, result){
        if(err){ return callback(err);}

        return callback(null, true, result);
    });
}

function signOutBook(barcode, user, callback){
    var criteria = {
        '_meta.barcode': barcode
    };

    var timeStamp = new Date();
    var signOutInfo = { 'signOutDate': timeStamp };

    var updateQuery = {
        $set: {'_meta.signOutInfo': signOutInfo}
    };

    if(user.admin != true){
        return callback(null, false);
    }

    db.get().collection('books').update(criteria, updateQuery, function(err, result){
        if(err){ return callback(err); }

        return callback(null, result);

    });
}

function signInExistingBook(barcode, user, book, callback){
    var criteria = {
        '_meta.barcode': barcode
    };

    var updateQuery = {
        $unset:{
            '_meta.reservedBy': '',
            '_meta.signOutInfo': ''
        },
        $set:{'_meta.available':true}
    };


    if(user.email != book._meta.reservedBy.email && user.admin == false){
        return callback(null, false);  //Not Authed
    }

    db.get().collection('books').update(criteria, updateQuery, function(err, result){
        if(err){ return callback(err);}

        return callback(null, true, result);
    });
}

function updateBook(criteria, set, callback){
    db.get().collection('books').update(criteria, set, function(err, result){
        if(err){
            return callback(err);
        }

        return callback(null, result); //returns a WriteResult
    });
}


function insert(book, callback) {
    db.get().collection('books').save(book, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function insertClicker(clicker, callback){
    db.get().collection('clickers').save(clicker, function(err, result){
        if(err){
            return callback(err);
        }
        return callback(null,result);
    });
}

function remove(id, callback) {
    var oid = new ObjectID(id)
    var criteria = {
        _id: oid
    };

    db.get().collection('books').deleteOne(criteria, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function update(id, book, callback) {
    var oid = new ObjectID(id)
    var criteria = {
        _id: oid
    };

    var update = {
        $set: book
    };

    db.get().collection('books').updateOne(criteria, update, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function stats(callback) {
    db.get().collection('books').count(function(err, result) {
        if (err) {
            return callback(err);
        }

        var stats = {};
        stats.count = result;

        return callback(null, stats);
    });
}


module.exports = {
    //Moved from users
    signOutBook: signOutBook,
    signInExistingBook: signInExistingBook,
    findUsersBooks: findUsersBooks,
    //findBooks: findBooks,
    //findOneBook: findOneBook,
    unreserveBook: unreserveBook,
    findReservedBookByBarcode: findReservedBookByBarcode,

    find: find,
    findOne: findOne,
    insert: insert,
    remove: remove,
    findOneByBarcode: findOneByBarcode,
    insertClicker: insertClicker,
    findReservedBooks: findReservedBooks,
    updateBook: updateBook,
    stats: memoize(stats, {maxAge: 30000})
};
