class Step {

    constructor(step_order, byu_id, route_id, week_day, start_location, end_location, distance_miles, time_minutes) {

        //use this value to generate the distance in steps and calories burned, values in the db.
        this._step_order = step_order
        this._byu_id = byu_id
        this._route_id = route_id
        this._week_day = week_day
        this._start_location = start_location
        this._end_location = end_location
        this._distance_miles = distance_miles      //found using maps API
        this._time_minutes = time_minutes

    }

    get week_day() {
        return this._week_day;
    }

    set week_day(value) {
        this._week_day = value;
    }

    get step_order() {
        return this._step_order;
    }

    set step_order(value) {
        this._step_order = value;
    }

    get byu_id() {
        return this._byu_id;
    }

    set byu_id(value) {
        this._byu_id = value;
    }

    get route_id() {
        return this._route_id;
    }

    set route_id(value) {
        this._route_id = value;
    }
    get start_location() {
        return this._start_location;
    }

    set start_location(value) {
        this._start_location = value;
    }

    get end_location() {
        return this._end_location;
    }

    set end_location(value) {
        this._end_location = value;
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
}

module.exports = Step