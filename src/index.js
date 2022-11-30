const CRED = require('./credentials');
const MENU = require('./menus')
const DB = require('./database')
const API = require('./APIs')
const AWS = require('./aws')



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


async function main() {
    console.clear()
    let user = await CRED.getUserCreds()
    const userExists = await DB.findUser(user.userID)
    console.clear()
    if(!userExists) {
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
    }
    else{
        await DB.syncGoals(user)
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


start().then(() => {})