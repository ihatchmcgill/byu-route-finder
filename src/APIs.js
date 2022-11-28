const Building = require('./Classes/Building')
const Step = require('./Classes/Step')
const Route = require('./Classes/Route')
const DB = require('./database')
const inquirer = require('inquirer')
const axios = require('axios')
const {get} = require("html-to-text/lib/helper");

const KM_TO_MILES = 0.621371


const getBuildingArr = (data) => {
    let buildingArr = []
    for(let i = 0; i < data.length; i++){
        let currBuilding = new Building(data[i].acronym,data[i].name,data[i].latitude,data[i].longitude)
        buildingArr.push(currBuilding)
    }
    return buildingArr;
}

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

const parseClassList = (classList) => {
    let classArr = []
    for(let i = 0; i < classList.length; i++) {
        //TODO Filter for online classes - What field to read off of?

        //if(!onlineClass){
        let currClass = {
            classTitle: classList[i].course_title,
            building: classList[i].schedule[0].building,
            daysTaught: classList[i].schedule[0].days_taught,
            startTime: classList[i].schedule[0].begin_time,
        }
        classArr.push(currClass)
    //}
    }
    return classArr
}

const buildDaySchedule = (classList, day) => {
    let dayClassArr = []
    for(let i = 0; i < classList.length; i++){
        if(classList[i].daysTaught.includes(day)){
            dayClassArr.push(classList[i])
        }
    }
    //can be empty if there isn't any classes on that day for student
    return dayClassArr
}

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
    for(let i = 0; i < classList.length;i++){
        if(i !== classList.length - 1){
            buildingString += classList[i].building.toUpperCase() + ','
        }else{
            buildingString += classList[i].building.toUpperCase()
        }

    }
    const scheduleBuildingArr = buildingString.split(',')
    const stepsArr = await createStepsArr(scheduleBuildingArr,user,weekday)
    return stepsArr
}

async function createStepsArr(scheduleBuildingArr,user,weekday){
    let stepsArr = []
    let stepOrder = 1
    for(let i = 0; i < scheduleBuildingArr.length - 1; i++){
        let startBuilding = await DB.getBuilding(scheduleBuildingArr[i]) //LSB
        let destinationBuilding = await DB.getBuilding(scheduleBuildingArr[i+1])  //JKB

        //start getting data for Step
        try{
            const distanceAndDuration = await getDistanceBuildings(startBuilding,destinationBuilding)
            const stepToAdd = new Step(stepOrder,user.userID,null, weekday, startBuilding.building_acronym, destinationBuilding.building_acronym,
                parseFloat(distanceAndDuration.distance), parseFloat(distanceAndDuration.duration))
            stepsArr.push(stepToAdd)
        }catch(e){
            console.log("Cannot create step array")
            return
        }
        stepOrder++
    }
    return stepsArr
}


async function getDistanceBuildings(start, destination){
    const config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${start.latitude},${start.longitude}&destinations=${destination.latitude},${destination.longitude}&mode=walking&key=AIzaSyBaz1xa-mDVKkpE5sKufyr1uvkDCgcjHLw`,
        headers: { }
    };
    try{
        const response = await axios(config)
        const distanceKM = response.data.rows[0].elements[0].distance.value
        let duration = response.data.rows[0].elements[0].duration.value
        //distance and duration values are in meters and seconds, so convert them here
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

async function generateRoute(stepArr,user){
    //console.log(stepArr)
    let distanceSum = 0;
    let timeSum = 0;
    let locations = ''
    let day
    const newRouteID = Math.random().toString(36).slice(2)

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

async function getUserSchedule(user){
    const options = {
        url: `https://api-sandbox.byu.edu:443/domains/legacy/academic/registration/enrolled_classes/v1/byuid/${user.userID}/20225`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.userToken}`
        }
    }


    let classInfo
    //This API is pretty unreliable, half the time it works.
    try {
        const response = await axios(options)
        classInfo = response.data.EnrolledClassesService.response.class_list
    }catch(e) {
        console.error('Error occurred while attempting to make schedule API request, unable to generate starting routes')
        console.error(e)
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
    }catch (e) {
        console.error("An error occurred while creating steps")
    }

    if(mondaySteps.length !== 0){
        const mondayRoute = await generateRoute(mondaySteps,user)
        await DB.insertRoute(mondayRoute)
        await DB.insertSteps(mondaySteps)
        //console.log(mondayRoute)
    }
    if(tuesdaySteps.length !== 0){
        const tuesdayRoute = await generateRoute(tuesdaySteps,user)
        await DB.insertRoute(tuesdayRoute)
        await DB.insertSteps(tuesdaySteps)
        //console.log(tuesdayRoute)
    }
    if(wednesdaySteps.length !== 0){
        const wednesdayRoute = await generateRoute(wednesdaySteps,user)
        await DB.insertRoute(wednesdayRoute)
        await DB.insertSteps(wednesdaySteps)
        //console.log(wednesdayRoute)
    }
    if(thursdaySteps.length !== 0){
        const thursdayRoute = await generateRoute(thursdaySteps,user)
        await DB.insertRoute(thursdayRoute)
        await DB.insertSteps(thursdaySteps)
        //console.log(thursdayRoute)
    }
    if(fridaySteps.length !== 0){
        const fridayRoute = await generateRoute(fridaySteps,user)
        await DB.insertRoute(fridayRoute)
        await DB.insertSteps(fridaySteps)
        //console.log(fridayRoute)
    }

}


module.exports = {getUserFromToken,getBuildings,getUserSchedule,getDistanceBuildings,generateRoute}