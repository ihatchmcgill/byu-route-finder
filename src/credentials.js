const inquirer = require('inquirer')
const API = require('./APIs')
const DB = require('./database')


async function getUserCreds () {
    let valid = false
    let user
    while(!valid){
        let userToken = await inquirer.prompt({
            name: 'tokenPrompt',
            message: 'Please enter your Bearer Token: ',
            type: 'input'
        })
        try{
            user = await API.getUserFromToken(userToken.tokenPrompt)
            valid = true
            if(await DB.tableIsEmpty('buildings')){
                //gets and adds buildings to database
                const buildings = API.getBuildings(userToken.tokenPrompt)
                await DB.addBuildings(buildings)
                console.log('Added building info to database.')
            }
        }catch (e){
            //console.error(e)
            console.log('Sorry, that isn\'t an active or valid bearer token')
            valid = false;
        }
    }
    return user
}


module.exports = {getUserCreds}