'use strict';

function tags(callback) {
    var tags = ['anatomy', 'chemistry', 'french', 'ornithology', 'biology'];

    return callback(null, tags);
}

function find(options, callback) {
    var books = [
        {
            id: '1',
            title: 'Foundations in microbiology',
            tags: ['microbiology'],
            isbn: '9780072994896',
            status: 'A+',
            date_added: new Date(),
            year: 2008
        },
        {
            id: '2',
            title: 'Holes essentials of human anatomy & physiology',
            tags: ['anatomy', 'human', 'physiology'],
            isbn: '9780073378152',
            status: 'B-',
            date_added: new Date(),
            year: 2012
        }
    ];

    // TODO
    return callback(null, books);
}

function findOne(id, callback) {
    // TODO
    
    find({}, function(err, books) {
        callback(null, books[0]);
    })
}

module.exports = {
    tags: tags,
    find: find,
    findOne: findOne
};
