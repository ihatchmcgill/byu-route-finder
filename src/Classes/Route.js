/**
 * @file File containing the structure of the Route class including all the necessary getters and setters
 * @author Isaac McGill
 * Last edited: November 30, 2022
 */


const open = require("open");
const DB = require("../database")

class Route {
    constructor(route_id, byu_id,route_locations,week_day,distance_miles,time_minutes) {
        this._route_id = route_id
        this._byu_id = byu_id
        this._route_locations = route_locations
        this._week_day = week_day
        this._distance_miles = distance_miles
        this._time_minutes = time_minutes
    }

    get route_id() {
        return this._route_id;
    }

    set route_id(value) {
        this._route_id = value;
    }

    get byu_id() {
        return this._byu_id;
    }

    set byu_id(value) {
        this._byu_id = value;
    }

    get route_locations() {
        return this._route_locations;
    }

    set route_locations(value) {
        this._route_locations = value;
    }

    get week_day() {
        return this._week_day;
    }

    set week_day(value) {
        this._week_day = value;
    }

    get distance_miles() {
        return this._distance_miles;
    }

    set distance_miles(value) {
        this._distance_miles = value;
    }

    get time_minutes() {
        return this._time_minutes;
    }

    set time_minutes(value) {
        this._time_minutes = value;
    }


    /**
     * Uses the 'open' package to open a web browser that contains a Google Maps route displaying all the steps in the specified route.
     * The building names are used to query the database and retrieve latitude and longitude data for each building and construct a URL to open
     * @param none
     * @returns none
     */
    async openRoute(){
        //use url format - https://www.google.com/maps/dir/lat1,long1/lat2,long2/.../data=!4m2!4m1!3e2

        const endingData = 'data=!4m2!4m1!3e2'
        const urlStart = 'https://www.google.com/maps/dir/'

        //makes database queries to get lat and longs for path

        const buildingNames = this.route_locations.split(',')

        let dataForUrl = ''
        try{
            for(let i = 0; i < buildingNames.length; i++){
                const building = await DB.getBuilding(buildingNames[i])
                dataForUrl += (building.latitude + ',' + building.longitude + '/')
            }

            open(urlStart + dataForUrl + endingData)
            console.log('Browser opened')
        }catch (e){
            console.log("Unable to open browser. Please try again.")
        }

    }
}






module.exports = Route