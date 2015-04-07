We have the sign-up form, which add an organization with the following information:
- Organization name = username
- Contact email (not the username because the email may change)
- Password
Optional:
- Logo
- Location of the box where they can donate books (For now it's fine with one)
Init to 0:
- outreach
- numberBooks

We need to be able to print that information as a table. 
- numBooks will change from python
- outreach will change (+1) when people like the group with their account (we still don't allow to register users).

What I've done:
- routes/organizations.js: Added: some sign up stuff
- routes/api.js: Added: somethign to find books
- services/organizations.js: Added: find to find all books
- views/partials/organization-template.js: Added: something like the book template for handlebars if I'm not wrong.
- views/partials/navbar.ejs: Added: login/logout apart from organizations (organizations should always have a list with the organizations, even if you're not registered. Eventually you would have an organization panel, but for now the only functionality is sign up)
- views/organizations/logout.ejs: Added empty file

