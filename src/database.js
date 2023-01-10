/**
 * @file File containing the all the methods necessary to communicate with the database.
 * @author Isaac McGill
 * Last edited: November 30, 2022
 */


const { Client } = require('pg')
const Step = require('./Classes/Step')
const {CREATE_PEOPLE_TABLE, CREATE_USER_ROUTES_TABLE, CREATE_BUILDINGS_TABLE, CREATE_STEPS_TABLE} = require('../SQL')


const clientParams = {
    host: 'localhost',
    user: '',
    password: '',
    database: 'pgdb',
    port: 5432
}

/**
 * Sets the correct username and password to use in the client parameters when connecting to the database. Username and passwords
 * are collected from the parameter store.
 * @param username for the database
 * @param password for the database
 * @returns none
 */
async function setParams(user,pass){
    clientParams.user = user;
    clientParams.password = pass
}

/**
 * Tests the connection to the database and creates the table if they don't already exist.
 * @param awsUser
 * @param awsPass
 * @returns true if the program is able to connect to the database, false otherwise.
 */
async function testDBConn(awsUser,awsPass) {
    await setParams(awsUser,awsPass)
    let connected = false
    const client = new Client(clientParams)
    try{
        await client.connect()
        await createTables(client)
        //console.log('Successfully connected to local database.')
        await client.end()
        connected = true
    } catch (e) {
        await client.end()
        console.log(e)
        console.error('Unable to connect to local database.')
    }
    return connected
}

/**
 * Creates the database tables if they don't already exist.
 * @param A client connection to the database
 * @returns none
 */
async function createTables(client) {
    try{
        await client.query(CREATE_PEOPLE_TABLE)
        await client.query(CREATE_USER_ROUTES_TABLE)
        await client.query(CREATE_STEPS_TABLE)
        await client.query(CREATE_BUILDINGS_TABLE)
        await client.end()
        //console.log('Successfully populated database with tables.')
    } catch(e){
        await client.end()
        console.error('Unable to create tables in database.')
    }
}

/**
 * Given a specific byuID, the table is queried to see if there exists a user with the byuID as the primary key.
 * @param byuID
 * @returns true if there exists a record, otherwise false.
 */
async function findUser(byuID){
    let userFound = false;
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `SELECT COUNT(byu_id) from people WHERE byu_id = ${byuID}`
        const result = await client.query(queryText)
        const count = result.rows[0].count
        if(parseInt(count)){
            userFound = true
        }
        await client.end()
    } catch(e) {
        await client.end()
        console.error('Unable to successfully query People table')
        throw e
    }
    return userFound
}

/**
 * Searches the Buildings table for a record that matches on the primary key: building acronym
 * @param buildingAcronym
 * @returns The data for the building found
 * @throws an error should the query fail
 */

async function getBuilding(buildingAcronym){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `SELECT * FROM buildings WHERE building_acronym = '${buildingAcronym}'`
        const result = await client.query(queryText)
        let buildingFound = result.rows[0]
        await client.end()
        return buildingFound
    } catch(e) {
        await client.end()
        console.error('Unable to successfully find building')
        throw e
    }
}

/**
 * Queries the database to return all the building names.
 * @param none
 * @returns all of the names for the buildings in the database
 */
async function getAllBuildings(){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = 'SELECT building_name FROM buildings'
        const result = await client.query(queryText)
        let buildingsFound = result.rows
        await client.end()
        return buildingsFound
    } catch(e) {
        await client.end()
        console.error('Unable to successfully list all buildings')
        throw e
    }
}

/**
 * Given a specific user, the database is queried to find the user's goals and syncs them to the user that is being used
 * during the current session of the program.
 * @param user
 * @returns none
 * @throws an error should the query fail
 */
async function getGoalsfromDB(user){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `SELECT * from people WHERE byu_id = ${user.userID}`
        const result = await client.query(queryText)
        const data = result.rows[0]
        user.userStepGoal = data.step_goal
        user.userCalorieGoal = data.calorie_goal
        await client.end()
    } catch(e) {
        console.error(e)
        await client.end()
        throw e
    }
}

/**
 * Updates goals in database to match the goals of the given user whose goals were collected previously and stored within memory
 * @param user
 * @returns none
 * @throws an error should the query fail
 */
async function updateGoals(user){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `UPDATE people SET step_goal = $1, calorie_goal = $2 WHERE byu_id = ${user.userID}`
        const values = [user.userStepGoal,user.userCalorieGoal]
        await client.query(queryText, values)
        await client.end()
    } catch(e) {
        console.error('Unable to successfully update goals')
        await client.end()
        throw e
    }
}

/**
 * Given a user object, the method inserts a record into the User table.
 * @param user
 * @returns none
 * @throws an error should the query fail
 */
async function addUser(user) {
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = 'INSERT INTO people (byu_id,first_name,last_name,step_goal,calorie_goal) VALUES ($1,$2,$3,$4,$5)'
        const values = [user.userID,user.userFirst,user.userLast,user.userStepGoal,user.userCalorieGoal]
        await client.query(queryText,values)
        await client.end()
    } catch (e){
        await client.end()
        console.log(e)
        console.error("Unable to add user into table")
        throw e
    }
}

/**
 * Populates the Buildings table in the database by inserting an array of building objects that is constructed using the API
 * @param buildingArr
 * @returns none
 */
async function addBuildings(buildingArr){
    const client = new Client(clientParams)
    try{
        await client.connect()
        for(let i = 0; i < buildingArr.length; i++){
            const queryText = 'INSERT INTO buildings (building_acronym,building_name,latitude,longitude) VALUES ($1,$2,$3,$4)'
            const values = [buildingArr[i].building_acronym, buildingArr[i].building_name,buildingArr[i].latitude,buildingArr[i].longitude]
            await client.query(queryText,values)
        }
    }catch(e){
        console.error("Unable to populate buildings table")
        await client.end()
    }
}

/**
 * Checks to see if a specific table is empty
 * @param tableName
 * @returns true if empty, false otherwise.
 */
async function tableIsEmpty(tableName){
    let isEmpty = true
    const client = new Client(clientParams)
    try{

        await client.connect()
        const queryText = `SELECT COUNT(*) from ${tableName}`
        const result = await client.query(queryText)
        const count = result.rows[0].count
        if(parseInt(count)){
            isEmpty = false
        }

    } catch(e){
        await client.end()
        console.error(`Failed to check if ${tableName} table is empty.`)
    }
    return isEmpty
}

/**
 * Populates a row in the steps table using an array of steps created for a specific route.
 * @param stepsArr
 * @returns none
 */
async function insertSteps(stepsArr) {
    await insertRoute(stepsArr)
    const client = new Client(clientParams)
    try{
        await client.connect()
        for(let i = 0; i < stepsArr.length; i++){
            const queryText = 'INSERT INTO steps (step_order, byu_id, route_id, week_day, start_location, end_location, distance_miles, time_minutes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)'
            const values = [stepsArr[i].step_order,stepsArr[i].byu_id,stepsArr[i].route_id,stepsArr[i].week_day,stepsArr[i].start_location,stepsArr[i].end_location,stepsArr[i].distance_miles,stepsArr[i].time_minutes]
            await client.query(queryText,values)
        }
        await client.end()
    } catch(e){
        console.error(e)
        console.error('Failed to insert steps into steps table')
        await client.end()
    }
}

/**
 * Inserts a specific route into the database
 * @param route
 * @returns none
 */
async function insertRoute(route){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = 'INSERT INTO user_routes (route_id, byu_id, route_locations, week_day, distance_miles, time_minutes) VALUES ($1,$2,$3,$4,$5,$6)'
        const values = [route.route_id,route.byu_id,route.route_locations,route.week_day,route.distance_miles,route.time_minutes]
        await client.query(queryText,values)
        await client.end()
    }catch (e) {
        await client.end()
        //console.error(e)
    }
}

/**
 * Queries the database find all the routes for a specific user.
 * @param userID
 * @returns all of the routes with the given byu_id
 * @throws an error should the query fail
 */
async function getRoutesUser(userID){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `SELECT * FROM user_routes WHERE byu_id = ${userID}`
        const result = await client.query(queryText)
        await client.end()
        return result.rows
    }catch (e){
        await client.end()
        throw e
        console.error(`Error while getting routes for user: ${userID}`)
    }
}

/**
 * Deletes a route from the database
 * @param routeToDelete
 * @returns none
 * @throws an error should the query fail
 */
async function deleteRoute(routeToDelete){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `DELETE FROM user_routes WHERE route_id = '${routeToDelete.route_id}'`
        await client.query(queryText)
        await client.end()
    }catch (e){
        await client.end()
        throw e
    }
}

/**
 * Deletes all routes in the database for a specific user
 * @param user
 * @returns none
 * @throws an error should the query fail
 */
async function deleteAllRoutes(user){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `DELETE FROM user_routes WHERE byu_id = '${user.userID}'`
        await client.query(queryText)
        await client.end()
    }catch (e){
        await client.end()
        throw e
    }
}

/**
 * Given a specific route, the database is queried and all steps for that route are returned in an array. Creates a step
 * object for each record found in the table
 * @param route
 * @returns an array of Step objects
 * @throws an error should the query fail
 */
async function getSteps(route){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `SELECT * FROM steps WHERE route_id = '${route.route_id}'`
        const result = await client.query(queryText)
        await client.end()
        //create step objects with data from table, return arr
        let stepArr = []
        for(let i = 0; i < result.rows.length; i++){
            stepArr.push(new Step(result.rows[i].step_order,result.rows[i].byu_id,result.rows[i].route_id,result.rows[i].week_day,result.rows[i].start_location,
                result.rows[i].end_location,result.rows[i].distance_miles,result.rows[i].time_minutes))
        }

        return stepArr
    }catch (e){
        await client.end()
        throw e
    }
}

/**
 * Given a specific building name, the method gets the correlating building acronym
 * @param buildingName
 * @returns a string with the building acronym
 * @throws an error should the query fail
 */
async function getAcronym(buildingName){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `SELECT building_acronym FROM buildings WHERE building_name = '${buildingName}'`
        const result = await client.query(queryText)
        await client.end()
        return result.rows[0].building_acronym
    }catch (e){
        await client.end()
        console.log(e)
        throw e
    }
}

/**
 * Updates the specified route to have a different week_day property.
 * @param route
 * @param day
 * @returns none
 * @throws an error should the query fail
 */
async function updateDayRoute(route, day){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `UPDATE user_routes SET week_day = $1 WHERE route_id = '${route.route_id}'`
        const values = [day]
        await client.query(queryText, values)
        await client.end()
    } catch(e) {
        console.error('Unable to successfully update weekday')
        await client.end()
        throw e
    }
}

/**
 * Updates the Steps on the specified route to have a different week_day property.
 * @param route
 * @param day
 * @returns none
 * @throws an error should the query fail
 */
async function updateDaySteps(route,day){
    const client = new Client(clientParams)
    try{
        await client.connect()
        const queryText = `UPDATE steps SET week_day = $1 WHERE route_id = '${route.route_id}'`
        const values = [day]
        await client.query(queryText, values)
        await client.end()
    } catch(e) {
        console.error('Unable to successfully update weekday')
        await client.end()
        throw e
    }
}


module.exports = {testDBConn,findUser,addUser,addBuildings,tableIsEmpty,getGoalsfromDB,updateGoals,getBuilding,insertSteps,insertRoute,
    getRoutesUser,deleteRoute,getSteps,getAllBuildings,getAcronym,updateDayRoute,updateDaySteps,deleteAllRoutes}