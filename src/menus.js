/**
 * @file File containing the methods that display the UI to the user and handles their inputs, including various helper methods.
 * @author Isaac McGill
 * Last edited: November 30, 2022
 */


const inquirer = require('inquirer')
inquirer.registerPrompt('search-list', require('inquirer-search-list'))
const Building = require('./Classes/Building')
const Step = require('./Classes/Step')
const Route = require('./Classes/Route')
const API = require('./APIs')
const DB = require('./database')


/**
 * Displays the title for the application. Color of choice is blue.
 */
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

/**
 * Prompts the user to input the new goals that they would like to have. Validates that the goal is an appropriate format
 * After the goals are validated, the user's goals are updated and will be synced later with the database
 * @param user
 * @returns none
 */
async function getGoals(user) {
    let stepGoal = await inquirer.prompt([
            {
                name: 'stepGoal',
                message: 'Please input your daily step goal, or enter 0 to skip this part: ',
                type: 'input',
                validate: (answer) => {
                    answer = parseInt(answer)
                    if (Number.isInteger(parseInt(answer)) && answer >= 0) {
                        //validStepGoal = true
                        user.userStepGoal = answer
                        return true
                    }
                    else{
                        return 'Sorry, please input a positive integer.'
                    }
                }
            }
        ])
    console.log(`Updated your current daily step goal`)


    let calorieGoal = await inquirer.prompt([
        {
            name: 'calorieGoal',
            message: 'Please input your daily calories burned goal, or enter 0 to skip this part: ',
            type: 'input',
            validate: (answer) => {
                answer = parseInt(answer)
                if (Number.isInteger(answer) && answer >= 0) {
                    //validCalorieGoal = true
                    user.userCalorieGoal = answer
                    return true
                }
                else{
                    return 'Sorry, please input a positive integer.'
                }
            }
        }
    ])
    console.log(`Updated your current goal for daily calories burned`)
}

/**
 * Displays the main menu options and gets the choice of the user
 * @returns user's choice
 */
async function getUserMenuChoice() {
    const userChoice = await inquirer.prompt([
        {
        name: 'menuOption',
        message: 'Please select an option from the menu below: ',
        type: 'list',
        choices: ['View/Modify goals', 'Create a new route', 'View/Modify existing routes', 'Regenerate class routes', 'Exit'],
        }
    ])
    return userChoice.menuOption
}

/**
 * Displays the user's current goals in a table and gives users the option to modify those goals. The goals are then updated in the database
 * @param user
 * @returns none
 */
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

/**
 * Given a specific user, all routes saved for the user are displayed. If there are 0 routes, a message is displayed indicating the user needs to
 * create routes
 * @param user
 * @returns the routes for a specified user, false if there aren't any goals saved
 */
async function displayRoutes(user){
    let user_routes
    try{
        user_routes = await DB.getRoutesUser(user.userID)
        console.clear()
        displayTitle()
        console.table(user_routes)
        console.log(`You have ${user_routes.length} routes saved.`)
        await checkGoals(user_routes,user)
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


/**
 * Prompts users to create a route and takes input from them to build the Route object. Steps are created for the route
 * as the user selects buildings and both the route and the steps are attached to the user and inserted into the database.
 * @param user
 * @returns none
 */
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

    //get weekday for the new route
    const getWeekday = await inquirer.prompt([
        {
            name: 'day',
            message: 'What is the weekday for the new route?',
            type: 'list',
            choices: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        }
    ])

    //start adding steps into step array
    let stepArr = []
    let stepOrder = 1
    while(!finished){
        let startingBuildingName
        let endingBuildingName
        let startBuildingObj
        let endBuildingObj

        //first step will have a start and end location
        if(stepOrder === 1){
            startingBuildingName =  await chooseBuilding('starting')
            endingBuildingName  = await chooseBuilding('destination',startingBuildingName)
        }
        //all other steps only get a destination
        else{
            startingBuildingName =  stepArr[stepArr.length-1].end_location
            endingBuildingName  = await chooseBuilding('destination',startingBuildingName)
        }

        //get actual building objects using the names chosen by user
        startBuildingObj = await DB.getBuilding(startingBuildingName)
        endBuildingObj = await DB.getBuilding(endingBuildingName)

        //calculate distances using google maps api
        const distanceAndDuration = await API.getDistanceBuildings(startBuildingObj, endBuildingObj)

        //create and add step to the array
        let stepToAdd = new Step(stepOrder, user.userID, null, getWeekday.day, startingBuildingName, endingBuildingName,
            parseFloat(distanceAndDuration.distance), parseFloat(distanceAndDuration.duration))
        stepArr.push(stepToAdd)

        //increment order of the steps
        stepOrder++

        //show current steps
        console.clear()
        console.log('Here are your current steps')
        console.table(stepArr)


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

    //generate route and assign route id to steps
    const newRoute = await API.generateRoute(stepArr,user)
    await DB.insertRoute(newRoute)
    await DB.insertSteps(stepArr)

    console.clear()
    displayTitle()
    console.log('Here is your new route!')
    console.table(stepArr)
}

/**
 * Displays the menu of options that users may select from when modifying a route. Options include
 * 1. Showing route steps
 * 2. Deleting routes
 * 3. Opening routes in the browser
 * 4. Adding steps to a route
 * 5. Deleting steps from a route
 * 6. Edit the weekday for a route
 *
 * Helper functions are utilized for most of these choices
 * @param user
 * @returns none
 */
async function modifyRoutes(user){

    let finished = false

    let user_routes = await displayRoutes(user)
    while(!finished) {

        //if routes were actually found

        if (user_routes) {
            const routeMenu = await inquirer.prompt([
                {
                    name: 'choice',
                    message: 'Please select what you want to do: ',
                    type: 'list',
                    choices: ['Show route steps','Modify a route', 'Delete a route', 'Delete all routes', 'Open route in browser', 'Back to main menu'],
                }
            ])
            if(routeMenu.choice === 'Show route steps'){
                user_routes = await displayRoutes(user)
                const index = await getValidIndex(user_routes, 'display')
                console.clear()
                displayTitle()
                console.log('Steps for selected route:')
                const allSteps = await DB.getSteps(user_routes[index])
                console.table(allSteps)
            }
            if (routeMenu.choice === 'Delete a route') {
                user_routes = await displayRoutes(user)
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
                        if(user_routes.length === 0){
                            console.log("deleted last route")
                            finished = true
                        }else{
                            user_routes = await displayRoutes(user)
                        }
                    } catch (e) {
                        console.clear()
                        displayTitle()
                        console.log('Sorry, something went wrong deleting route from the database')
                        finished = true
                    }
                }
            }
            if(routeMenu.choice === 'Delete all routes'){
                const validate = await inquirer.prompt([
                    {
                        name: 'answer',
                        message: `Are you sure you want to delete all your saved routes?`,
                        type: 'list',
                        choices: ['Yes', 'No'],
                    }
                ])
                if (validate.answer === 'Yes') {
                    try {
                        await DB.deleteAllRoutes(user)
                        console.clear()
                        displayTitle()
                        console.log('Deleted routes successfully')
                        finished = true
                    } catch (e) {
                        console.clear()
                        displayTitle()
                        console.log('Sorry, something went wrong deleting routes from the database')
                        finished = true
                    }
                }
            }
            if (routeMenu.choice === 'Modify a route') {
                user_routes = await displayRoutes(user)
                //1. add a step
                //2. delete a step
                const modify = await inquirer.prompt([
                    {
                        name: 'method',
                        message: `How do you want to modify the route?`,
                        type: 'list',
                        choices: ['Add a step', 'Delete a step','Change weekday', 'Back'],
                    }
                ])
                if (modify.method === 'Add a step') {
                    const index = await getValidIndex(user_routes, 'modify')
                    //creates route and gets steps for that route from DB

                    const newRouteSteps = await DB.getSteps(await addStepToRoute(user_routes[index], user))

                    //show updated steps
                    console.clear()
                    displayTitle()
                    console.log('Here is your new route!')
                    console.table(newRouteSteps)
                }
                if (modify.method === 'Delete a step') {
                    const index = await getValidIndex(user_routes, 'modify')
                    console.log("test for route at index: " + index + "with route:")
                    console.table(user_routes[index])
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

                    await DB.updateDayRoute(user_routes[index], getWeekday.day)
                    await DB.updateDaySteps(user_routes[index], getWeekday.day)
                    console.clear()
                    displayTitle()
                    console.log('Updated route.')
                    user_routes = await displayRoutes(user)
                }
            }
            if (routeMenu.choice === 'Open route in browser') {
                user_routes = await displayRoutes(user)
                //get route index
                const index = await getValidIndex(user_routes, 'display')
                const routeToDisplay = new Route(user_routes[index].route_id, user_routes[index].byu_id, user_routes[index].route_locations, user_routes[index].week_day,
                    user_routes[index].distance_miles, user_routes[index].time_minutes)
                console.clear()
                displayTitle()
                await routeToDisplay.openRoute()
                user_routes = await displayRoutes(user)
            }
            if (routeMenu.choice === 'Back to main menu') {
                console.clear()
                displayTitle()
                finished = true
            }
        }
        else{
            //no routes found
            finished = true
        }
    }
}

/**
 * Helper function to prompt the user for the index for the array that is passed into the method. Validates that this index is correct
 * @param user_routes
 * @param message - The message displayed (Modify or delete)
 * @returns index
 */
async function getValidIndex(user_routes, message){
    let index
    const chooseIndex = await inquirer.prompt([
        {
            name: 'index',
            message: `Please input the index of the route you wish to ${message}: `,
            type: 'input',
            validate: (answer) => {
                answer = parseInt(answer)
                if (answer < 0 || answer >= user_routes.length || !Number.isInteger(answer)) {
                    return 'Sorry, please enter a valid index.'
                }
                else{
                    index = answer
                    return true
                }
            }
        }
    ])
    return index
}

/**
 * Using prompts, data is collected from the user to begin adding steps to the route. Once the user has finished indicating
 * the new steps, the old route is deleted and a new route is created using these steps and then inserted into the database
 *
 * Handles reordering the steps based on the step order provided by the user as well as cascading the proceeding steps to
 * match start and end locations.
 * @param routeToModify
 * @param user
 * @returns the new route created
 */
async function addStepToRoute(routeToModify,user){
    let finished = false
    let validOrder = false
    let order
    let stepArr = await DB.getSteps(routeToModify)

    while(!finished) {
        //display steps of route
        console.clear()
        console.log('Current steps for selected route:')
        console.table(stepArr)


        let getStep = await inquirer.prompt([
            {
                name: 'order',
                message: 'Enter the new step order. (1 for first step, 2 for second, etc...): ',
                type: 'input',
                validate: (answer) => {
                    answer = parseInt(answer)
                    if (!Number.isInteger(answer) || answer > stepArr.length + 1 || answer < 1) {
                        return 'Sorry, please enter a valid number.'
                    } else {
                        order = answer
                        return true

                    }
                }
            }
        ])

        //begin creating new step
        let startingBuildingName
        let endingBuildingName

        if (order === 1) {
            startingBuildingName = await chooseBuilding('starting')
            endingBuildingName = stepArr[0].start_location
        } else if (order !== (stepArr.length + 1)){
            startingBuildingName = stepArr[order - 2].end_location
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

/**
 * Gets the steps for a specific route and will prompt the user for an index for a step to delete. The step is deleted
 * from the step array and a new route is created. The old route is deleted and the new one is inserted.
 *
 * Handles reordering the steps based on the step order as well as cascading the proceeding steps to
 * match start and end locations.
 * @param routeToModify
 * @param user
 * @returns newRoute - the new route created
 */
async function deleteStepFromRoute(routeToModify,user){
    console.clear()
    console.log('Current steps for selected route:')
    let stepArr = await DB.getSteps(routeToModify)
    console.table(stepArr)

    let sure = true
    let validOrder = false
    let indexToDelete

    let getStep = await inquirer.prompt([
        {
            name: 'index',
            message: 'Enter the index for the step you wish to delete: ',
            type: 'input',
            validate: (answer) => {
                answer = parseInt(answer)
                if (!Number.isInteger(answer) || answer > stepArr.length - 1 || answer < 0) {
                    return 'Sorry, please enter a valid number.'
                } else {
                    indexToDelete = answer
                    return true
                }
            }
        }
    ])

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
        stepArr.splice(indexToDelete, 1)
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
    //don't return a new route, user decided not to delete the step
    return null
}

/**
 * Adjusts all the start and end locations in the step array to be correct. Start locations should be the end location of the previous step.
 * @param stepArr
 * @returns none
 */
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

/**
 * Helper function defining how two different Step objects should be compared using the step order property.
 * @param stepA
 * @param stepB
 * @returns -1 to indicate that stepA comes before stepB, and a 1 for the opposite.
 */
function compareStepOrder(stepA, stepB) {
    if (stepA.step_order < stepB.step_order) {
        return -1
    } else {
        return 1
    }
}

/**
 * Checks the step and calories burned data on the routes to show to users which routes don't meet their goals
 * @param user_routes - the routes for the given user
 * @param user - the user for whose goals we are checking
 * @returns none
 */
async function checkGoals(user_routes,user){
    const stepGoal = user.userStepGoal
    const calorieGoal = user.userCalorieGoal

    for(let i = 0; i < user_routes.length; i++) {
        if(user_routes[i].distance_steps < stepGoal){
            console.log(`Warning: Route ${i} doesn't meet your step goal`)
        }
        if(user_routes[i].calories_burned < calorieGoal){
            console.log(`Warning: Route ${i} doesn't meet your calories burned goal`)
        }
    }
}



module.exports = {getGoals,getUserMenuChoice,modifyGoals,modifyRoutes,createRoute,displayTitle,chooseBuilding}