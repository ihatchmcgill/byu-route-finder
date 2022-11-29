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

Before the program can be used, users must generate a valid bearer token here: https://training-token-generator.byu.edu/#
