/**
 * @file The file that handles all the communication with the AWS parameter store
 * @author Isaac McGill
 * Last edited: November 30, 2022
 */

const AWS = require('aws-sdk')
let awsUsername
let awsPassword
let awsGoogleAPI

const awsUsernameParams = {
    Name: '/imcgill-technical-challenge/dev/DB_USERNAME',
    WithDecryption: true
}
const awsPasswordParams = {
    Name: '/imcgill-technical-challenge/dev/DB_PASSWORD',
    WithDecryption: true
}
const awsGoogleParams = {
    Name: '/imcgill-technical-challenge/dev/GOOGLE_API_KEY',
    WithDecryption: true
}

/**
 * Using the AWS SDK, the method grabs the parameters. Credentials for the parameter store are provided by the user beforehand.
 * Catches the error thrown by the ssm if an error occurs while attempting to access the parameter store.
 * @param none
 * @returns An array containing all the necessary values for database credentials and API keys
 */
async function getAWSParams () {
    AWS.config.update({region: 'us-west-2'})
    const ssm = new AWS.SSM()
    try{
        const dataUser = await ssm.getParameter(awsUsernameParams).promise()
        awsUsername = dataUser.Parameter.Value
        //console.log(awsUsername)
        const dataPass = await ssm.getParameter(awsPasswordParams).promise()
        awsPassword = dataPass.Parameter.Value
        //console.log(awsPassword)
        const dataGoogle = await ssm.getParameter(awsGoogleParams).promise()
        awsGoogleAPI = dataGoogle.Parameter.Value
        //console.log(awsGoogleAPI)
        return [awsUsername,awsPassword,awsGoogleAPI]
    } catch (e){
        console.log('An unexpected error occurred connecting to the AWS parameter store. Please check your credentials and try again. Exiting program...')
    }
}

async function testConn(){
    try{
        return getAWSParams()
    }catch(e){
        return false
    }
}

module.exports = {getAWSParams,testConn}