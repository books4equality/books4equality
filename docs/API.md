# Public API

## GET /api/books/:id

Find one book by its identifier.

```json
GET /books/54e882333ea21f357a2f9a64

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
GET /books?title=book&tags=lang:es&orderby=year

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

## GET /api

Returns the status of the service.

```json
GET /books/54e882333ea21f357a2f9a64

{
    "status": 1
}
```
