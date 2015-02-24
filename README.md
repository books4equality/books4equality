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

See also [how to get it up and running into the cloud](/docs/DEPLOY.md) for free.

### Advanced configuration

The following environment variables are available:

* **PORT**: Web server port (default 3200).
* **MONGO_URL**: Connection string to the mongodb database (default mongodb://localhost:27017/b4e).
* **ADMIN_PASS**: Administrative password (default random password).

## [Public API](/docs/API.md)

## License

**AGPL v3.0 LICENSE**
http://www.gnu.org/licenses/agpl-3.0.html
