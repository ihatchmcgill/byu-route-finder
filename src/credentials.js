/**
 * @file File that handles the collection of the user's credentials
 * @author Isaac McGill
 * Last edited: November 30, 2022
 */


const inquirer = require('inquirer')
const API = require('./APIs')
const DB = require('./database')

/**
 * Prompts the user for their token and validates it. Repeats prompting until a valid token is given.
 * User data is retrieved from their bearer token using the BYU OpenID API. Once the token is validated, the building
 * table is also populated with the BYU Buildings API
 *
 * @param none
 * @returns a user object containing the user's name, byu id, bearer token, and goals
 */
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