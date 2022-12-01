### mcgill-technical-challenge

# BYU Route Finder
## Description:
The BYU Route Finder app is the latest and greatest in BYU technology. With this app, users will be given a set of routes that they can use to track helpful information such as distance and time, as well as other health considerations like the steps taken and calories burned. Using state of the art algorithms, these routes are generated for students, but are completely customizable. Achieving your health goals isn't easy, but with the Route Finder app you can track your fitness goals and Route Finder will let you know which of your routes help you the most. The future is now!



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

In the terminal before you run the program, type `aws configure` and then copy and paste in your AWS credentials. This will allow 
you to set the aws_access_key_id and the aws_secret_access_key.

![AWS_CONFIGURE](https://github.com/byu-oit-training/mcgill-technical-challenge/blob/main/awsConfig.PNG?raw=true)

After you have set your Access Key ID and the Secerte Access Key, you will need to set your Session token by 
typing in `aws configure set aws_session_token` and then your session token.





## Usage

1. Clone this project to your directory of choice with `git clone`
2. Start the program with `npm run all`. This will extract and start the database and run the program.
3. Enter your **bearer token** when prompted by the program. 
4. The welcome screen and main menu will be shown, select options to interact with the program.



