const AWS = require('aws-sdk')
AWS.config.update({region: 'us-west-2'})
const ssm = new AWS.SSM()
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
    Name: '/imcgill_technical-challenge/dev/GOOGLE_API_KEY',
    WithDecryption: true
}


async function getAWSParams () {
    try{
        awsUsername = await ssm.getParameter(awsUsernameParams).promise().then(data => {
            return data.Parameter.Value
        })
        awsPassword = await ssm.getParameter(awsPasswordParams).promise().then(data => {
            return data.Parameter.Value
        })
        awsGoogleAPI = await ssm.getParameter(awsGoogleParams).promise().then(data => {
            return data.Parameter.Value
        })
        //console.log(typeof awsPassword)
        return [awsUsername,awsPassword,awsGoogleAPI]
    } catch (e){
        console.log(e)
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