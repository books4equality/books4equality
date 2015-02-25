# How to deploy your own pod

You can [create a free Openshift account](https://www.openshift.com/app/account/new) to deploy the app.
Once your account is ready, you only need to create a Node.js 0.10 application with a MongoDB 2.4 cartridge.

```
> export APP_NAME=b4e
> sudo gem install rhc
> rhc setup
> rhc app create $APP_NAME nodejs-0.10 mongodb-2.4 --scaling --from-code=git://github.com/palmerabollo/books4equality.git
```

That will deploy and give you some information about the URL to access the site.

You will also find your private git repository. It looks like this:

```
ssh://ab45fc4df38aec39250000ab@b43-youruser.rhcloud.com/~/git/b4e.git/
```

## Development

If you want to make changes to the codebase, first fork and clone this repository.
After committing your changes, you can redeploy them:

```
> git remote add openshift -f ssh://YOUR_PRIVATE_GIT_REPOSITORY
> git merge openshift/master -s recursive -X ours
> git push openshift master
```

Don't forget to PR your changes back to improve Books For Equality.

## Backup your database

You need to forward the local ports to the remote ports in order to access the mongodb database from your local machine.

```
rhc port-forward -a $APP_NAME # this will show your local MONGODB_PORT
```

Then use ```mongodump```:

```
rhc apps # will show your database password
mongodump --host localhost -d $APP_NAME --port <MONGODB_PORT> --username admin --password <YOUR_MONGODB_PASSWORD>
```

That will place a backup in a local folder (```./dump```).
You can use [```mongorestore```](http://docs.mongodb.org/manual/reference/program/mongorestore/) to restore the backup.
