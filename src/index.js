/**
 * @file This is the index file for controls the flow of the program
 * @author Isaac McGill
 * Last edited: November 30, 2022
 */


const CRED = require('./credentials');
const MENU = require('./menus')
const DB = require('./database')
const API = require('./APIs')
const AWS = require('./aws')


/**
 * Function to start the program. The connections to the AWS parameter store and the Database are tested here. If connections aren't successful, the program
 * will notify the user and exit gracefully.
 * @param none
 * @returns none
 */
async function start() {
    const awsCreds = await AWS.testConn()
    if(awsCreds){
        const connectedToDB = await DB.testDBConn(awsCreds[0],awsCreds[1])
        if(connectedToDB){
            await main().then(() => {})
        }
        else{
            console.log('An unexpected error occurred connecting to the database. Please try again later. Exiting program...')
        }
    }
}

/**
 * The main method that controls the flow of the program. Once connections have been successfully established, credentials are requested from the user and an
 * object is constructed containing their data. The program checks to see if the user already exists and handles that accordingly
 *
 * If the user is new and a student, their goals are collected and starting routes are automatically generated for them. If not, the program
 * simply starts by displaying the main menu.
 *
 * @param none
 * @returns none
 */

async function main() {
    console.clear()
    let user = await CRED.getUserCreds()

    //check if building table is empty, populate it
    if(await DB.tableIsEmpty("buildings")){
        const buildings = await API.getBuildings(user.userToken)
        await DB.addBuildings(buildings)
    }

    const userExists = await DB.findUser(user.userID)
    console.clear()
    if(!userExists) {
        try{
            console.log(`Welcome ${user.userFirst} to the Route Finder app!`)
            await MENU.getGoals(user)
            console.clear()
            await DB.addUser(user)

            //returns false is there are no classes in their schedule (not a student)
            const userSchedule = await API.getUserSchedule(user)
            if(userSchedule){
                console.log('Starting routes have been generated for you based your current class schedule!')
            }
            else{
                console.log('Could not generate starting class routes, no classes found.')
            }
        }catch(e){
            console.log("Starting routes could not be created for new user.")
        }
    }
    else{
        await DB.getGoalsfromDB(user)
        console.log(`Welcome back ${user.userFirst} to the Route Finder app!`)
    }
    MENU.displayTitle()
    let userChoice = await MENU.getUserMenuChoice()
    let exit = false
    while(!exit){
        switch(userChoice) {
            case 'View/Modify goals':
                console.clear()
                await MENU.modifyGoals(user)
                break
            case 'Create a new route':
                console.clear()
                await MENU.createRoute(user)
                break
            case 'View/Modify existing routes':
                console.clear()
                await MENU.modifyRoutes(user)
                break
            case 'Regenerate class routes':
                console.clear()
                try{
                    const valid = await API.getUserSchedule(user)
                    if(valid){
                        console.log('Starting routes have been generated for you based your current class schedule!')
                    }
                    else{
                        console.log('Could not generate starting class routes, no classes found.')
                    }
                }catch (e) {
                    console.log("An error occurred, please try again.")
                }
                MENU.displayTitle()
                break
            case "Exit":
                console.clear()
                exit = true
                break
        }
        if(!exit){
            userChoice = await MENU.getUserMenuChoice()
        }
    }
    MENU.displayTitle()
    console.log('Thank you for user the Route Finder! Log in anytime to continue to create and view your routes!\nGoodbye!')
}

/**
 * Calls start() which begins the program
 */
start().then(() => {
    process.exit(1)
})