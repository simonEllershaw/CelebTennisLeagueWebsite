Celebrity Tennis League

Features

Player profiles
Admin and player level restictions
Automatic fixture generation
Personalised fixture and result lists for each player
Results input and league table updates
Add and remove players (as admin)
Full features can be seen in the Celebrity Tennis League Webpage Video

Implementation

Uses bootstrap as the basis of 
the HTML design. The data is then loaded via AJAX restful API. A simple JSON file is 
used as the database backend.


Instructions

To deploy run:
  npm install
  npm start 
The following message should be outputed:
  "server is running on port 8090"
The website can then be accessed from the following url:
  http://127.0.0.1:8090/home.html
The following users are preloaded:
  Username		Password
  elt_john		password
  bill_g		password
  rod_fed 		password
  doctorwhocomposer 	password
  admin			password (Note: has admin privelages)
