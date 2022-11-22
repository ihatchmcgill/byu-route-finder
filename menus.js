const inquirer = require('inquirer')
const Building = require('./Building')
const Step = require('./Step')
const Route = require('./Route')
const API = require('./APIs')
const DB = require('./database')
const readline = require("readline");
const {get} = require("html-to-text/lib/helper");
const {generateRoute} = require("./APIs");



function displayTitle(){
    console.log('\x1b[34m%s\x1b[0m','░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n' +
        '░     ░░░░░   ░░░░░░   ░   ░░░░░   ░░░░░░░        ░░░░░░░░░     ░░░░░░   ░░░░░   ░           ░         ░░░░░░░        ░░   ░    ░░░░░   ░      ░░░░░         ░        ░░░░\n' +
        '▒  ▒▒   ▒▒▒▒   ▒▒▒▒   ▒▒   ▒▒▒▒▒   ▒▒▒▒▒▒▒   ▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒   ▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒▒▒▒▒▒▒▒▒   ▒▒▒▒▒▒▒   ▒  ▒   ▒▒▒   ▒   ▒▒▒   ▒▒   ▒▒▒▒▒▒▒   ▒▒▒▒   ▒▒\n' +
        '▒  ▒▒▒   ▒▒▒▒   ▒   ▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒▒▒   ▒▒▒▒   ▒▒▒   ▒▒▒▒▒▒▒▒   ▒   ▒▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒▒▒▒▒▒▒▒▒   ▒▒▒▒▒▒▒   ▒   ▒   ▒▒   ▒   ▒▒▒▒   ▒   ▒▒▒▒▒▒▒   ▒▒▒▒   ▒▒\n' +
        '▓      ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓▓  ▓   ▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓   ▓   ▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓       ▓▓▓▓▓▓▓▓▓       ▓▓▓   ▓   ▓▓   ▓   ▓   ▓▓▓▓   ▓       ▓▓▓  ▓   ▓▓▓▓▓▓\n' +
        '▓  ▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓▓   ▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓▓▓   ▓   ▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓   ▓   ▓▓▓  ▓   ▓   ▓▓▓▓   ▓   ▓▓▓▓▓▓▓   ▓▓   ▓▓▓▓\n' +
        '▓  ▓▓▓▓▓  ▓▓▓▓▓   ▓▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓   ▓▓   ▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓   ▓   ▓▓▓▓  ▓  ▓   ▓▓▓   ▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓   ▓▓\n' +
        '█    █   ██████   ████████      ██████████   ██████   █████     ████████      ████████   █████         ███████   ███████   █   ██████   █      █████         █   ██████   \n' +
        '██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████')
}

async function getGoals(user) {
    let validStepGoal = false
    let stepGoal
    let calorieGoal
    while(!validStepGoal){
        stepGoal = await inquirer.prompt([
            {
                name: 'stepGoal',
                message: 'Please input your daily step goal, or enter 0 to skip this part: ',
                type: 'number'
            }
        ])
        if(Number.isInteger(stepGoal.stepGoal) && stepGoal.stepGoal >= 0){
            validStepGoal = true
            if(stepGoal.stepGoal !== 0){
                console.log(`Updated your current daily step goal to: ${stepGoal.stepGoal}`)
                user.userStepGoal = stepGoal.stepGoal
            }
        }
        else{
            console.log('Sorry, please input a positive integer.')
        }
    }
    let validCalorieGoal = false
    while(!validCalorieGoal){
        calorieGoal = await inquirer.prompt([
            {
                name: 'calorieGoal',
                message: 'Please input your daily calories burned goal, or enter 0 to skip this part: ',
                type: 'number'
            }
        ])
        if(Number.isInteger(calorieGoal.calorieGoal) && calorieGoal.calorieGoal >= 0){
            validCalorieGoal = true
            if(calorieGoal.calorieGoal !== 0){
                console.log(`Updated your current goal for daily calories burned to: ${calorieGoal.calorieGoal}`)
                user.userCalorieGoal = calorieGoal.calorieGoal
            }
        }
        else{
            console.log('Sorry, please input a positive integer.')
        }
    }
}



async function getUserMenuChoice() {
    const userChoice = await inquirer.prompt([
        {
        name: 'menuOption',
        message: 'Please select an option from the menu below: ',
        type: 'list',
        choices: ['View/Modify goals', 'Create a new route', 'View/Modify existing routes', 'Exit'],
        }
    ])
    return userChoice.menuOption
}

async function modifyGoals(user){
    const goalsTable = {
        "Step Goal": user.userStepGoal,
        "Calorie Goal": user.userCalorieGoal
    }
    //Display current goals
    console.table(goalsTable)
    const goalMenu = await inquirer.prompt([
        {
            name: 'choice',
            message: 'Please select what you want to do: ',
            type: 'list',
            choices: ['Modify goals','Back to main menu'],
        }
    ])
    if(goalMenu.choice === 'Modify goals'){
        await getGoals(user)
        await DB.updateGoals(user)
    }
    console.clear()
    displayTitle()
}

async function displayRoutes(user){
    let user_routes
    try{
        user_routes = await DB.getRoutesUser(user.userID)
        console.clear()
        console.table(user_routes)
        console.log(`You have ${user_routes.length} routes saved.`)
    }catch (e) {
        console.error(e)
        return false
    }

    //check there actually exists routes
    if(user_routes.length === 0){
        console.clear()
        displayTitle()
        console.log('Looks like you don\'t have any routes saved. Create a route and try again!')
        return false
    }
    return user_routes
}

async function createRoute(user){
    const options = await inquirer.prompt([
        {
            name: 'choice',
            message: 'Welcome to the route creator! What would you like to do?',
            type: 'list',
            choices: ['Create a route', 'Back to main menu'],
        }
    ])
    let finished = false
    if(options.choice === 'Back to main menu'){
        console.clear()
        displayTitle()
        return
    }
    const getWeekday = await inquirer.prompt([
        {
            name: 'day',
            message: 'What is the weekday for the new route?',
            type: 'list',
            choices: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        }
    ])
    let stepArr = []
    let stepOrder = 1
    while(!finished){
        let startingBuildingName
        let endingBuildingName
        let startBuildingObj
        let endBuildingObj
        if(stepOrder === 1){
            startingBuildingName =  await chooseBuilding('starting')
            endingBuildingName  = await chooseBuilding('destination',startingBuildingName)
        }
        else{
            startingBuildingName =  stepArr[stepArr.length-1].end_location
            endingBuildingName  = await chooseBuilding('destination',startingBuildingName)
        }
        startBuildingObj = await DB.getBuilding(startingBuildingName)
        endBuildingObj = await DB.getBuilding(endingBuildingName)
        const distanceAndDuration = await API.getDistanceBuildings(startBuildingObj, endBuildingObj)
        let stepToAdd = new Step(stepOrder, user.userID, null, getWeekday.day, startingBuildingName, endingBuildingName,
            parseFloat(distanceAndDuration.distance), parseFloat(distanceAndDuration.duration))
        stepArr.push(stepToAdd)
        stepOrder++
        const complete = await inquirer.prompt([
            {
                name: 'answer',
                message: `Would you like to add another step?`,
                type: 'list',
                choices: ['Yes', 'No'],
            }
        ])
        if(complete.answer === "No"){
            finished = true
        }
    }
    const newRoute = await API.generateRoute(stepArr,user)
    await DB.insertRoute(newRoute)
    await DB.insertSteps(stepArr)
    console.clear()
    displayTitle()
    console.log('Here is your new route!')
    console.table(stepArr)
}

async function modifyRoutes(user){

    let finished = false
    while(!finished) {
        const user_routes = await displayRoutes(user)
        if (user_routes) {
            const routeMenu = await inquirer.prompt([
                {
                    name: 'choice',
                    message: 'Please select what you want to do: ',
                    type: 'list',
                    choices: ['Modify a route', 'Delete a route', 'Open route in browser', 'Back to main menu'],
                }
            ])
            if (routeMenu.choice === 'Delete a route') {
                const index = await getValidIndex(user_routes, 'delete')
                const validate = await inquirer.prompt([
                    {
                        name: 'answer',
                        message: `Are you sure you want to delete route ${index}?`,
                        type: 'list',
                        choices: ['Yes', 'No'],
                    }
                ])
                if (validate.answer === 'Yes') {
                    const routeToDelete = user_routes[index]
                    try {
                        await DB.deleteRoute(routeToDelete)
                        console.clear()
                        displayTitle()
                        console.log('Deleted route successfully')
                        finished = true
                    } catch (e) {
                        console.clear()
                        console.log('Sorry, something went wrong deleting route from the database')
                        finished = true
                    }
                }
            }
            if (routeMenu.choice === 'Modify a route') {
                const modify = await inquirer.prompt([
                    {
                        name: 'method',
                        message: `How do you want to modify the route?`,
                        type: 'list',
                        choices: ['Add a step', 'Delete a step', 'Change weekday', 'Back'],
                    }
                ])

                if (modify.method === 'Add a step') {
                    const index = await getValidIndex(user_routes, 'modify')
                    const newRouteSteps = await DB.getSteps(await addStepToRoute(user_routes[index], user))
                    //console.clear()
                    //show updated steps
                    console.clear()
                    displayTitle()
                    console.log('Here is your new route!')
                    console.table(newRouteSteps)
                    finished = true
                }
                if (modify.method === 'Delete a step') {
                    const index = await getValidIndex(user_routes, 'modify')
                    const newRoute = await deleteStepFromRoute(user_routes[index], user)
                    if (newRoute !== null) {
                        const newRouteSteps = await DB.getSteps(newRoute)
                        //console.clear()
                        //show updated steps
                        console.clear()
                        displayTitle()
                        console.log('Here is your new route!')
                        console.table(newRouteSteps)
                    }
                }
                if (modify.method === 'Change weekday') {
                    const index = await getValidIndex(user_routes, 'modify')
                    const getWeekday = await inquirer.prompt([
                        {
                            name: 'day',
                            message: `What is the new weekday for route ${index}?`,
                            type: 'list',
                            choices: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                        }
                    ])

                    await DB.updateDay(user_routes[index], getWeekday.day)
                    console.clear()
                    displayTitle()
                    console.log('Updated route.')
                    finished = true
                }
            }
            if (routeMenu.choice === 'Open route in browser') {
                //get route index
                const index = await getValidIndex(user_routes, 'display')
                const routeToDisplay = new Route(user_routes[index].route_id, user_routes[index].byu_id, user_routes[index].route_locations, user_routes[index].week_day,
                    user_routes[index].distance_miles, user_routes[index].time_minutes)
                console.clear()
                displayTitle()
                await routeToDisplay.openRoute()
                finished = true
            }
            if (routeMenu.choice === 'Back to main menu') {
                console.clear()
                displayTitle()
                finished = true
            }
        }
        finished = true
    }
}



async function getValidIndex(user_routes, message){
    let validIndex = false
    while(!validIndex) {
        const chooseIndex = await inquirer.prompt([
            {
                name: 'index',
                message: `Please input the index of the route you wish to ${message}: `,
                type: 'number',
            }
        ])
        //check that input isn't out of bounds
        if (chooseIndex.index < 0 || chooseIndex.index >= user_routes.length || !Number.isInteger(chooseIndex.index)) {
            console.log('Sorry, please enter a valid index.')
        }
        else{
            return chooseIndex.index
        }
    }

}

async function addStepToRoute(routeToModify,user){
    //display steps of route
    console.clear()
    console.log('Current steps for selected route:')
    let stepArr = await DB.getSteps(routeToModify)
    console.table(stepArr)

    let finished = false
    let validOrder = false
    let order
    let getStep

    while(!finished) {

        while (!validOrder) {
            getStep = await inquirer.prompt([
                {
                    name: 'order',
                    message: 'Enter the new step order. (1 for first step, 2 for second, etc...): ',
                    type: 'number',
                }
            ])
            if (!Number.isInteger(getStep.order) || getStep.order > stepArr.length + 1 || getStep.order < 1) {
                console.log('Sorry, please enter a valid number.')
            } else {
                validOrder = true
                order = getStep.order
            }
        }

        //begin creating new step
        let startingBuildingName
        let endingBuildingName

        if (getStep.order === 1) {
            startingBuildingName = await chooseBuilding('starting')
            endingBuildingName = stepArr[0].start_location
        } else if (getStep.order !== (stepArr.length + 1)){
            startingBuildingName = stepArr[getStep.order - 2].end_location
            endingBuildingName = await chooseBuilding('destination')
        } else {
            startingBuildingName = stepArr[stepArr.length - 1].end_location
            endingBuildingName = await chooseBuilding('destination')
        }

        //get actual building objects
        const startBuildingObj = await DB.getBuilding(startingBuildingName)
        const endBuildingObj = await DB.getBuilding(endingBuildingName)

        const distanceAndDuration = await API.getDistanceBuildings(startBuildingObj, endBuildingObj)


        let stepToAdd = new Step(order, routeToModify.byu_id, routeToModify.route_id, routeToModify.week_day, startingBuildingName, endingBuildingName,
            parseFloat(distanceAndDuration.distance), parseFloat(distanceAndDuration.duration))


        //update orders on steps
        for (let i = 0; i < stepArr.length; i++) {
            if (stepArr[i].step_order >= order) {
                stepArr[i].step_order += 1
            }
        }
        stepArr.push(stepToAdd)
        stepArr.sort(compareStepOrder)
        await cascadeStepArr(stepArr)

        console.log('Step added!')
        const askFinished = await inquirer.prompt([
            {
                name: 'finished',
                message: `Are you finished adding steps?`,
                type: 'list',
                choices: ['Yes', 'No'],
            }
        ])
        if(askFinished.finished === 'Yes'){
            finished = true
        }
        else{
            validOrder = false
        }
    }


    //console.log(stepArr)
    //check that start and end locs make sense adjust ones that are off.


    //generateRoute will also update the stepArr to have the right ID
    const newRoute = await API.generateRoute(stepArr,user)
    //console.log(newRoute)
    //delete old route in DB, insert new one
    await DB.deleteRoute(routeToModify)
    //console.log('route deleted')
    await DB.insertRoute(newRoute)
    //console.log('route inserted')
    await DB.insertSteps(stepArr)

    return newRoute
}

async function chooseBuilding(message,buildingToRemove){
    //array of objects
    const buildings = await DB.getAllBuildings()

    //pull out just the names of buildings
    let buildingNames = []
    for(let i = 0; i < buildings.length;i++){
        buildingNames.push(buildings[i].building_name)
    }
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

async function deleteStepFromRoute(routeToModify,user){
    console.clear()
    console.log('Current steps for selected route:')
    let stepArr = await DB.getSteps(routeToModify)
    console.table(stepArr)

    let sure = true
    let validOrder = false
    let getStep


    while (!validOrder) {
        getStep = await inquirer.prompt([
            {
                name: 'index',
                message: 'Enter the index for the step you wish to delete: ',
                type: 'number',
            }
        ])
        if (!Number.isInteger(getStep.index) || getStep.index > stepArr.length - 1 || getStep.index < 0) {
            console.log('Sorry, please enter a valid number.')
        } else {
            validOrder = true
        }
    }

    if(stepArr.length === 1){
        const askFinished = await inquirer.prompt([
            {
                name: 'finished',
                message: `Deleting this step will delete the entire route. Are you sure you wish to proceed?`,
                type: 'list',
                choices: ['Yes', 'No'],
            }
        ])
        if(askFinished.finished === 'Yes'){
            sure = true
        }
        else{
            sure = false
        }
    }



    if(sure) {
        //delete step and reorganizes array
        stepArr.splice(getStep.index, 1)
        stepArr.sort(compareStepOrder)
        await cascadeStepArr(stepArr)

        //update orders on steps
        for (let i = 0; i < stepArr.length; i++) {
            stepArr[i].step_order = i + 1
        }


        console.log('Step deleted!')

        //generateRoute will also update the stepArr to have the right ID
        if(stepArr.length !== 0){
            const newRoute = await API.generateRoute(stepArr, user)
            //console.log(newRoute)
            //delete old route in DB, insert new one
            await DB.deleteRoute(routeToModify)
            //console.log('route deleted')
            await DB.insertRoute(newRoute)
            //console.log('route inserted')
            await DB.insertSteps(stepArr)

            return newRoute
        }else{
            await DB.deleteRoute(routeToModify)
        }
    }
    return null
}

async function cascadeStepArr(stepArr){
    //console.log('cascading steps')
    for(let i = 0; i < stepArr.length - 1; i++){
        const firstStep = stepArr[i]
        const secondStep = stepArr[i+1]
        secondStep.start_location = firstStep.end_location
        //console.log(firstStep)
        //console.log(secondStep)
    }
}

function compareStepOrder(stepA, stepB) {
    if (stepA.step_order < stepB.step_order) {
        return -1
    } else {
        return 1
    }
}


module.exports = {getGoals,getUserMenuChoice,modifyGoals,modifyRoutes,createRoute,displayTitle}