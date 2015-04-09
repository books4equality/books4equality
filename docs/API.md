# Public API

## GET /api/books/:id

Find one book by its identifier.

```json
GET /api/books/54e882333ea21f357a2f9a64

{
    "_id": "54e882333ea21f357a2f9a64",
    "available": true,
    "title": "Another book in the store",
    "isbn": "1780073378153",
    "categories": [
        "lang:es",
        "book",
        "physiology"
    ],
    "status": "B-",
    "date_added": null,
    "publishedDate": 2013
}
```

## GET /api/books

Find a list of books by title and/or tags.

```json
GET /api/books?title=book&tags=lang:es&orderby=year

[
    {
        "_id": "54e882333ea21f357a2f9a64",
        "available": true,
        "title": "Another book in the store",
        "isbn": "1780073378153",
        "categories": [
            "lang:es",
            "book",
            "physiology"
        ],
        "status": "B-",
        "date_added": null,
        "publishedDate": 2013
    },
    {
        "_id": "54e763933ea21f357a2f9a62",
        "available": true,
        "title": "This is a book with a very long title",
        "isbn": "9780073378152",
        "categories": [
            "lang:es",
            "anatomy",
            "human",
            "physiology"
        ],
        "status": "B-",
        "date_added": null,
        "publishedDate": 2012
    }
]
```

## GET /api/organizations

Find a list of organizations

GET /api/organizations

```json
[
    {
        "location": "202 Perkins",
        "name": "B4E - Base",
        "numberBooks": 221,
        "outreach": 0,
        "createdAt": "2015-04-08T16:49:49.706Z",
        "logo": {
            "mimetype": "image/png",
            "size": 533491
        },
        "_id": "55255c2d248075ae9c987f33"
    },
    {
        "location": "Call (508)-332-0822 for details",
        "name": "Men's Club Soccer",
        "numberBooks": 42,
        "outreach": 0,
        "createdAt": "2015-04-08T16:53:11.046Z",
        "logo": {
            "mimetype": "image/jpeg",
            "size": 115398
        },
        "_id": "55255cf7248075ae9c987f34"
    },
    {
        "location": "138 South Willard, Burlington VT",
        "name": "UVM Men's Rugby",
        "numberBooks": 5,
        "outreach": 0,
        "createdAt": "2015-04-08T17:15:34.800Z",
        "logo": {
            "mimetype": "image/gif",
            "size": 18813
        },
        "_id": "55256236248075ae9c987f35"
    }
]
```

## GET /api

Returns the status of the service.

```json
GET /books/54e882333ea21f357a2f9a64

{
    "status": 1
}
```
