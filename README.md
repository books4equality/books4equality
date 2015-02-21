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

## API

* GET /books/:id
* GET /books
* GET /tags
