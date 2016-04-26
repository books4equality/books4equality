# Private API

There is a private API for administration. Requests to this API must use basic
authentication (username and password).

## POST /admin/books

**Request:**

```json
{
    "schoolID":"UVM",
    "password":"password",
    "isbn":"9783161484100",
    "barcode":"12098471238094",
    "ddc":"999",
    "donor_email":"Bossman@boss.com"
}
```
param | definition | required
-------|-----------|----------
`schoolID` | school acronym, IE. `UVM` | yes
`password` | school account password | yes
`isbn` | ISBN | yes
`ddc` | Dewey code | no
`barcode` | Internal barcode (code39) | yes
`donor_email` | Email of book donor | yes

**Response:**

For now, there will be no content returned in the response. The status codes should be suffucient and errors must be handled in the front end. 


HTTP Code | Meaning
----|------
`404` | route has been changed 
`500` | database error 
`401` | Invalid schoolID/password combination
`269` | ISBN not resolved from external sources
`409` | Duplicate barcode entered
`204` | Success (No content returned)

## DELETE /api/books/:id

Removes a book from the database. The `:id` is the internal identifier of the book in the database (not the ISBN).

## GET /search/:isbn

Search a book by `:isbn` in different third-party services, and returns the book information.