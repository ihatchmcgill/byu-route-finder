const AWS = require('aws-sdk')
//AWS.config.update({region: 'us-west-2'})
const ssm = new AWS.SSM()
let awsUsername
let awsPassword
let awsGoogleAPI

const awsUsernameParams = {
    Name: '/mcgill-technical-challenge/dev/DB_USERNAME',
    WithDecryption: true
}
const awsPasswordParams = {
    Name: '/mcgill-technical-challenge/dev/DB_PASSWORD',
    WithDecryption: true
}
// const awsGoogleParams = {
//     Name: '/mcgill_technical-challenge/dev/GOOGLE_API_KEY',
//     WithDecryption: true
// }

// async function getAWSParams () {
//     try{
//         awsUsername = await ssm.getParameter(awsUsernameParams).promise()
//         awsPassword = await ssm.getParameter(awsPasswordParams).promise()
//         //awsGoogleAPI = await ssm.getParameter(awsGoogleParams).promise()
//         return [awsUsername,awsPassword,awsGoogleAPI]
//     } catch (e){
//         console.log(e)
//     }
//
// }



//module.exports = {getAWSParams}