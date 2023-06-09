/**
 * @file File containing all the methods that utilize different API calls, including various helper methods.
 * @author Isaac McGill
 * Last edited: November 30, 2022
 */


const Building = require('./Classes/Building')
const Step = require('./Classes/Step')
const Route = require('./Classes/Route')
const DB = require('./database')
const AWS = require('./aws')
const axios = require('axios')
const inquirer = require("inquirer");




/**
 * Helper method that creates building objects from the data retrieved from the API and pushes them into an array
 *
 * @param data - The result of the Buildings API get request
 * @returns buildingArr - an array containing Building objects
 */
const getBuildingArr = (data) => {

    const buildingArr = data.map(currBuilding => new Building(currBuilding.acronym,currBuilding.name,currBuilding.latitude, currBuilding.longitude))

    // let buildingArr = []
    // for(let i = 0; i < data.length; i++){
    //     let currBuilding = new Building(data[i].acronym,data[i].name,data[i].latitude,data[i].longitude)
    //     buildingArr.push(currBuilding)
    // }
    return buildingArr;
}

/**
 * Uses the bearer token to make a get request to the BYU location API to get a list of all building on campus and their
 * latitude and longitude data
 * @param token
 * @returns an array of Building objects
 * @throws an error should a problem occur while making the API request
 */
async function getBuildings(token){
    const options = {
        url: 'https://api-sandbox.byu.edu:443/domains/mobile/location/v2/buildings',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    let buildings //array of building objects
    try{
        const response = await axios(options)
        buildings = getBuildingArr(response.data)
    } catch (e){
        throw e
    }
    return buildings
}


/**
 * Uses the OpenID API to get user information based on the bearer token. Creates a variable with the user information.
 * @param token
 * @returns a user object
 * @throws an error should a problem occur while making the API request
 */
async function getUserFromToken(token){
    const options = {
        url: 'https://api-sandbox.byu.edu:443/openid-userinfo/v1/userinfo?schema=openid',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    try{
        const response = await axios(options)
        const data = response.data
        const user = {
            userID: data['http://byu.edu/claims/client_byu_id'],
            userFirst: data.given_name,
            userLast: data.family_name,
            userStepGoal: 0,
            userCalorieGoal: 0,
            userToken: token
        }
        return user
    }catch(e){
        throw e
    }
}

/**
 * Helper method that looks at the class list and builds an array of classes that are found on the user. Creates class variables
 * and stores data including the title, building, daysTaught, and start time.
 * @param classList - Part of the data returned from the EnrolledService API
 * @returns classArr - an array of class variables.
 */
const parseClassList = (classList) => {

    let newClass;
    const classArr = classList.map(currClass => newClass = {
            classTitle: currClass.course_title,
            building: currClass.schedule[0].building,
            daysTaught: currClass.schedule[0].days_taught,
            startTime: currClass.schedule[0].begin_time,
        }
    )

    // let classArr = []
    // for(let i = 0; i < classList.length; i++) {
    //     let currClass = {
    //         classTitle: classList[i].course_title,
    //         building: classList[i].schedule[0].building,
    //         daysTaught: classList[i].schedule[0].days_taught,
    //         startTime: classList[i].schedule[0].begin_time,
    //     }
    //     classArr.push(currClass)
    // }
    return classArr
}

/**
 * Given a list of classes and a specific day, creates an array with every class that takes place on the specific day.
 * @param classList
 * @param day
 * @returns dayClassArr - an array of all the classes with happening on the specific day
 */
const buildDaySchedule = (classList, day) => {

    const dayClassArr = classList.filter(currClass => currClass.daysTaught.includes(day))

    // let dayClassArr = []
    // for(let i = 0; i < classList.length; i++){
    //     if(classList[i].daysTaught.includes(day)){
    //         dayClassArr.push(classList[i])
    //     }
    // }
    // //can be empty if there isn't any classes on that day for student
    return dayClassArr
}

/**
 * Defines how classes should be sorted within an array. Sorts the classes by start time and then
 * constructs a list of buildings that the student must travel to during the day. These buildings
 * are ordered by start time and placed into an array
 *
 * Calls createStepArray to create the steps between the buildings
 *
 * @param classList - The list of unsorted classes
 * @param user
 * @param weekday - The day of the week that these classes take place
 * @returns stepsArr - An array of steps between all the buildings on the specified day
 */

async function sortAndCreateSteps(classList,user,weekday) {
    const compareStartTimes = (classA, classB) => {
        if(classA.startTime < classB.startTime){
            return -1
        }
        else{
            return 1
        }
    }
    classList.sort(compareStartTimes)
    //console.log(classList)

    let buildingString = ''
    //use for loop because the index is important
    for(let i = 0; i < classList.length;i++){
        if(i !== classList.length - 1){
            buildingString += classList[i].building.toUpperCase() + ','
        }else{
            buildingString += classList[i].building.toUpperCase()
        }

    }
    const scheduleBuildingArr = buildingString.split(',')
    try{
        const stepsArr = await createStepsArr(scheduleBuildingArr,user,weekday)
        return stepsArr
    }catch (e){
        throw e
    }


}


/**
 * Helper method that creates Step objects and inserts them into an array. Gets building info from the database by the building name and then calculates
 * the distance for the step
 *
 * @param scheduleBuildingArr - The buildings that mark the start and end of each step
 * @param user
 * @param weekday - The day of the week on which the step takes place.
 * @returns stepsArr
 */
async function createStepsArr(scheduleBuildingArr,user,weekday){
    let stepsArr = []
    let stepOrder = 1
    let i = 0
    if(scheduleBuildingArr.length === 1) {
        i -= 1
    }
    for(i; i < scheduleBuildingArr.length - 1; i++){
        let startBuilding
        let destinationBuilding
        if(scheduleBuildingArr.length === 1) {
            console.log(`Looks like you only have one class on ${weekday}, please select a starting point for your route.`)
            startBuilding = await DB.getBuilding(await chooseBuilding("starting"))
            destinationBuilding = await DB.getBuilding(scheduleBuildingArr[0])
        }
        else {
            startBuilding = await DB.getBuilding(scheduleBuildingArr[i])
            destinationBuilding = await DB.getBuilding(scheduleBuildingArr[i + 1])  //JKB
        }
        //start getting data for Step
        try{
            const distanceAndDuration = await getDistanceBuildings(startBuilding,destinationBuilding)
            //if distance = 0, two classes are in the same building. Don't create a step
            if(parseFloat(distanceAndDuration.distance) !== 0){
                const stepToAdd = new Step(stepOrder,user.userID,null, weekday, startBuilding.building_acronym, destinationBuilding.building_acronym,
                    parseFloat(distanceAndDuration.distance), parseFloat(distanceAndDuration.duration))
                stepsArr.push(stepToAdd)
                stepOrder++
            }
        }catch(e){
            console.log("Cannot create step array")
            throw e
            return
        }
    }
    return stepsArr
}

/**
 * Uses Google Map's API to get location data for each building through the latitude and longitude coordinates. Converts
 * distance and duration data into miles and minutes.
 * @param start - The starting building
 * @param destination - The destination building
 * @returns variable containing both distance and duration
 * @throws an error if the get request fails
 */
async function getDistanceBuildings(start, destination){
    const data = await AWS.getAWSParams()
    const key = data[2]

    const config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${start.latitude},${start.longitude}&destinations=${destination.latitude},${destination.longitude}&mode=walking&key=` + key,
        headers: { }
    };
    try{
        const response = await axios(config)
        const distanceKM = response.data.rows[0].elements[0].distance.value
        let duration = response.data.rows[0].elements[0].duration.value
        //distance and duration values are in meters and seconds, so convert them here
        const KM_TO_MILES = 0.621371
        const distanceMI = function(distance) {
            distance /= 1000
            distance *= KM_TO_MILES
            return distance.toFixed(2)
        }
        duration /= 60
        duration = duration.toFixed(2)
        return {
            distance: distanceMI(distanceKM),
            duration: duration
        }
    }catch(e){
        console.error("Error occurred while using the Google Maps API")
        throw e
    }


}

/**
 * Using an array of Steps, generates a route object and assigns it a unique id.
 * @param stepArr - The array of steps that make up the route
 * @param user - The user for which the route belongs
 * @returns the generate route
 */
async function generateRoute(stepArr,user){
    //console.log(stepArr)
    let distanceSum = 0;
    let timeSum = 0;
    let locations = ''
    let day
    const newRouteID = Math.random().toString(36).slice(2)

    //need to know index? not sure forEach would work here
    for(let i = 0; i < stepArr.length; i++){
        day = stepArr[i].week_day
        distanceSum += stepArr[i].distance_miles
        timeSum += stepArr[i].time_minutes
        locations += (stepArr[i].start_location + ',')
        if(i === stepArr.length - 1){
            locations += stepArr[i].end_location
        }
        //set route id on step
        stepArr[i].route_id = newRouteID
        //console.log(stepArr[i])
    }
    const route = new Route(newRouteID,user.userID,locations,day,distanceSum.toFixed(2),timeSum.toFixed(2))
    //console.log(route)
    return route
}

/**
 * Helper function that will simply calculate the year term for the current date. This is intentional as the program is meant to
 * only display data from the user's current classes if there are any.
 * @returns The year term as a string
 */

const getYearTermHelper = () => {
    const currDate = new Date
    const currYear = currDate.getFullYear()
    const currMonth = currDate.getMonth()
    let term

    if(0 <= currMonth < 4){
        //winter semester
        term = 1
    }
    else if(4 <= currMonth < 6){
        //spring
        term = 3
    }
    else if(6 <= currMonth < 8){
        //summer
        term = 4
    }
    else{
        //fall
        term = 5
    }
    return (currYear.toString() + term.toString())
}


/**
 * The main method called to generate routes for a user based on their class schedule. Calls the EnrolledClasses API from BYU
 * and creates a route for each day of the week. The routes and the corresponding steps are then inserted into the Database
 * so long as the number of steps in the route isn't 0
 *
 * @param user
 * @returns True if the user had classes, and they were successfully turned into routes, false otherwise
 */

async function getUserSchedule(user){
    let yearTerm = getYearTermHelper()
    const options = {
        url: `https://api-sandbox.byu.edu:443/domains/legacy/academic/registration/enrolled_classes/v1/byuid/${user.userID}/${yearTerm}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.userToken}`
        }
    }

    let classInfo
    try {
        const response = await axios(options)
        classInfo = response.data.EnrolledClassesService.response.class_list
    }catch(e) {
        console.error('Error occurred while attempting to make schedule API request, unable to generate starting routes')
        return false
    }

    if(classInfo.length === 0){
        //console.log('No classes!')
        return false
    }

    console.log(`Generating starting routes...`)

    const allClassesArr = parseClassList(classInfo)

    //may be empty if there aren't any classes on the specified day
    const mondayClasses = buildDaySchedule(allClassesArr,'M')
    const tuesdayClasses = buildDaySchedule(allClassesArr,'T')
    const wednesdayClasses = buildDaySchedule(allClassesArr,'W')
    const thursdayClasses = buildDaySchedule(allClassesArr,'Th')
    const fridayClasses = buildDaySchedule(allClassesArr,'F')


    let mondaySteps
    let tuesdaySteps
    let wednesdaySteps
    let thursdaySteps
    let fridaySteps

    try{
        //sort classes, get building list and create steps to add to DB

        mondaySteps = await sortAndCreateSteps(mondayClasses,user,"Monday")
        tuesdaySteps = await sortAndCreateSteps(tuesdayClasses,user,"Tuesday")
        wednesdaySteps = await sortAndCreateSteps(wednesdayClasses,user,"Wednesday")
        thursdaySteps = await sortAndCreateSteps(thursdayClasses,user,"Thursday")
        fridaySteps = await sortAndCreateSteps(fridayClasses,user,"Friday")

        await generateAndInsertRoute(mondaySteps,user)
        await generateAndInsertRoute(tuesdaySteps,user)
        await generateAndInsertRoute(wednesdaySteps,user)
        await generateAndInsertRoute(thursdaySteps,user)
        await generateAndInsertRoute(fridaySteps,user)
        return true
    }catch (e) {
        throw e
        return false
    }


}

async function generateAndInsertRoute(stepArr,user){
    if(stepArr.length !== 0){
        const route = await generateRoute(stepArr,user)
        await DB.insertRoute(route)
        await DB.insertSteps(stepArr)
    }
}

/**
 * Gets all the buildings from the database and displays just the names. The user selects the building name for the building
 * they wish to choose
 * @param message - (start or destination)
 * @param buildingToRemove - removes the building from the list of options (so users can't have the start and end buildings be the same building)
 * @returns the acronym for the building selected by the user
 */
async function chooseBuilding(message,buildingToRemove){
    //array of objects
    const buildings = await DB.getAllBuildings()

    //pull out just the names of buildings

    let buildingNames = buildings.map(currBuilding => currBuilding.building_name)

    // let buildingNames = []
    // for(let i = 0; i < buildings.length;i++){
    //     buildingNames.push(buildings[i].building_name)
    // }
    //sort names
    buildingNames.sort();

    const index = buildingNames.indexOf(buildingToRemove);
    if (index > -1) {
        buildingNames.splice(index, 1);
    }
    const buildingList = await inquirer.prompt([
        {
            name: 'choice',
            message: `Please select a ${message} building`,
            type: 'rawlist',
            pageSize: 25,
            choices: () => buildingNames,
        }
    ])
    //returns just the acronym
    try{
        return DB.getAcronym(buildingList.choice)
    }catch(e){
        console.error("Something went wrong selecting buildings")
    }

}



module.exports = {getUserFromToken,getBuildings,getUserSchedule,getDistanceBuildings,generateRoute,chooseBuilding}