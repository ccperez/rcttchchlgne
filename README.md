## Instructions for deployment:
  Inside project root
  1. remove proxy setting on package.json
      "proxy": "...."

  2. login heroku and create react-app
    $ heroku login
    $ heroku heroku apps:create react-app-name    

  3. for first deployment
    $ git init
    $ git add . && git commit -m "deployment"
    $ git push heroku master

  4. On Heroku, create Config Vars
    REACT_APP_APIURL: https://mock-api.dev.....com/route
    REACT_APP_GOOGLEMAPURL: https://maps.googleapis.com/maps/api/js?libraries=places&key=
    REACT_APP_GMAPIKEY: APIKEY

  5. redeploy
    $ git add . && git commit -m "deployment"
    $ git push heroku master --force
