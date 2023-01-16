### mcgill-technical-challenge

# BYU Route Finder
## Description:
The BYU Route Finder app is the latest and greatest in BYU technology. With this app, users will be given a set of routes that they can use to track helpful information such as distance and time, as well as other health considerations like the steps taken and calories burned. Using state of the art algorithms, these routes are generated for students, but are completely customizable. Achieving your health goals isn't easy, but with the Route Finder app you can track your fitness goals and Route Finder will let you know which of your routes helps you the most. The future is now!



## Requirements:

### API's

* You will need to make sure that you have a valid bearer token to access the following BYU API's:
    * OpenID-Userinfo (v1): https://api.byu.edu:443/openid-userinfo/v1/userinfo?schema=openid
    * AcademicRegistrationEnrolledClasses(v1): https://api-sandbox.byu.edu:443/domains/legacy/academic/registration/enrolled_classes/v1/byuid/{byu_id}/{term}
    * LocationService (v2): https://api.byu.edu:443/domains/mobile/location/v2/buildings
   
* A Google Maps API is used to fetch route data.
    * Google Distance Matrix: https://maps.googleapis.com/maps/api/distancematrix/json?origins={start.latitude},{start.longitude}&destinations={destination.latitude},{destination.longitude}&mode=walking&key={API_KEY}

Before the program can be used, users must generate a valid bearer token here: https://training-token-generator.byu.edu 
****
### Install All Necessary Software:

Please ensure that the following programs are correctly installed on your computer:

- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-started/overview/)
****
### Make sure Docker is running in the background

The program will be hosting the database locally on Docker, so you will need Docker installed and running on your 
machine before starting the program.
****
### Amazon Web Service
Log on to [AWS services](https://byulogin.awsapps.com/start#/) and navigate to the BYU AWS Store

![AWS](https://user-images.githubusercontent.com/112526259/198143730-a0a14707-17b7-4698-85f2-0606cc5e5036.PNG)

Under PowerUser, select Command line or programmatic access.

Click the commands under `Option 1` to copy the set of 3 commands to set the proper environmental variables for you shell. 

![AWS COMMANDS](images/envAWS.png?raw=true "envAWS")

Paste these into the terminal before running your program in order to access the AWS Parameter Store

![SHELL PASTE](images/pasteenv.png?raw=true "pasteenv")

## Usage

1. Clone this project to your directory of choice with `git clone`
2. `cd` into the project with `cd mcgill-technical-challenge/`
3. Start the program with `npm run all`. This will extract and start the database and run the program.
4. Enter your **bearer token** when prompted by the program. 
5. Upon beginning the program for the first time, starting routes will be generated for the user based on their current class scheudle.
6. The welcome screen and main menu will be shown, select options to interact with the program.

## Architecture and Database

The program is broken up into files to help organize the code. This is an object oriented application, with those classes being Routes, Steps, and Buildings. These objects are stored in a database useing Docker. The database can be viewed using Adminer, which is most easily accesed from the Docker Desktop application. Certain values are stored in the database and calculated as automatically as data is stored there. These values are calories_burned and distance_steps. You should be aware of this when pulling data from the Database, as these values will be returned, but not stored locally.

Although the list of buildings is quite long, this data is not cached as the API is only called one time, when first populating the database with the appropriate tables.

A full list of the dependencies used is as follows:
1. aws-sdk - For accesssing the AWS Parameter Store 
2. open - For opening a browswer given an link.
3. pg - For interacting with the Database
4. inquirer - For collecting and validating user input
5. axios - To retrieve data from GET API calls.
6. uuid - To create unique ID's for Routes
