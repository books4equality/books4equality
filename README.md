# books4equality

Work in progress for a redesign and an API proposal for [Books 4 Equality](http://www.books4equality.com).

Books 4 Equality was created September, 2014 by three students of the University of Vermont.

They accept books in fair condition and use them to **reduce the education gap around the globe**.
Most books that we receive are donated to [Books For Africa](http://www.booksforafrica.org/), and
a number of others are sold to generate funding for shipping them.

## Install

Prerequisites:
- Tools: **nodejs**, **git** and **bower** (npm install -g bower).
- A **mongodb** instance running on localhost:27017. A database "b4e" with automatically be created if needed.

```
> git clone git@github.com:palmerabollo/books4equality.git
> cd books4equality
> bower install
> npm install
> npm start
```

The web server will be up and running at [localhost:3200](http://localhost:3200).

### Advanced configuration

The following environment variables are available:

* **PORT**: Web server port (default 3200).
* **MONGO_URL**: Connection string to the mongodb database (default mongodb://localhost:27017/b4e).
* **ADMIN_PASS**: Administrative password (default random password).

## Public API

### GET /api/books/:id

Find one book by its identifier.

```json
GET /books/54e882333ea21f357a2f9a64

{
    "_id": "54e882333ea21f357a2f9a64",
    "available": true,
    "title": "Another book in the store",
    "isbn": "1780073378153",
    "tags": [
        "lang:es",
        "book",
        "physiology"
    ],
    "status": "B-",
    "date_added": null,
    "year": 2013
}
```

### GET /api/books

Find a list of books by title and/or tags.

```json
GET /books?title=book&tags=lang:es&orderby=year

[
    {
        "_id": "54e882333ea21f357a2f9a64",
        "available": true,
        "title": "Another book in the store",
        "isbn": "1780073378153",
        "tags": [
            "lang:es",
            "book",
            "physiology"
        ],
        "status": "B-",
        "date_added": null,
        "year": 2013
    },
    {
        "_id": "54e763933ea21f357a2f9a62",
        "available": true,
        "title": "This is a book with a very long title",
        "isbn": "9780073378152",
        "tags": [
            "lang:es",
            "anatomy",
            "human",
            "physiology"
        ],
        "status": "B-",
        "date_added": null,
        "year": 2012
    }
]
```

### GET /api

Returns the status of the service.

```json
GET /books/54e882333ea21f357a2f9a64

{
    "status": 1
}
```

### GET /api/tags

This resource is still under consideration.

## License

**AGPL v3.0 LICENSE**
http://www.gnu.org/licenses/agpl-3.0.html

## Deploy your own pod

You can [create a free Openshift account](https://www.openshift.com/app/account/new) to deploy the app.
Once your account is ready, you only need to create a Node.js 0.10 application with a MongoDB 2.4 cartridge.

```
> sudo gem install rhc
> rhc setup
> rhc app create b4e nodejs-0.10 mongodb-2.4 --scaling --from-code=git://github.com/palmerabollo/books4equality.git
```

That will deploy and give you some information about the URL to access the site.

You will also find your private git repository. It looks like this:

```
ssh://ab45fc4df38aec39250000ab@prueba-guido.rhcloud.com/~/git/b4e.git/
```

### Development

If you want to make changes, fork and clone this repository.
After committing your changes, you can redeploy them:

```
> git remote add openshift -f ssh://YOUR_PRIVATE_GIT_REPOSITORY
> git merge openshift/master -s recursive -X ours
> git push openshift master
```

Don't forget to PR your changes back to improve Books For Equality.
