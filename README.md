# AV Money

AV Money is an invoicing application written specifically for an interior designer, but can be used for anyone who needs to:

 * Track hours
 * Track expenses
 * Track resale taxes
 * Track by client and project
 * Track project costs against a work order cap
 * Generate invoices in html and pdf
 * Track Payments
 * Create rolled up reports for clients
 * Create rolled up reports for accounting

Written as a single page app, the main components are:

 * Rails backend, as API server
 * AngularJS frontend
 * Couchdb database
 * Omniauth authentication


## Configuration

In order to configure the app for your own use, create a .env file at the root level with the following settings:

```
# run 'rake secret' to generate a secret key for the rails app
SECRET_KEY_BASE=9febf...59164

# set up a google account to use google for omniauth
GOOGLE_KEY=13...-r2...apps.googleusercontent.com
GOOGLE_SECRET=e0_rshhhveryprivate

# set up an account on cloudant, the dbname is set in config/couchdb.yml
COUCH_USER=taskit
COUCH_PASSWORD=qet135QET

# your list of allowed users by gemail address
ALLOWED_USERS=['a@gmail.com','b@gmail.com']

# using rollbar to alert on exceptions
ROLLBAR_ACCESS_TOKEN=0..e
```

then push your config with `heroku config:push`