/**
 * @file This is the file for the Building class including all the necessary getters and setters
 * @author Isaac McGill
 * Last edited: November 30, 2022
 */

class Building {
    constructor(building_acronym,building_name,latitude,longitude){
        this._building_acronym = building_acronym;
        this._building_name = building_name;
        this._latitude = latitude;
        this._longitude = longitude;
    }
    get building_acronym() {
        return this._building_acronym;
    }

    set building_acronym(value) {
        this._building_acronym = value;
    }

    get building_name() {
        return this._building_name;
    }

    set building_name(value) {
        this._building_name = value;
    }

    get latitude() {
        return this._latitude;
    }

    set latitude(value) {
        this._latitude = value;
    }

    get longitude() {
        return this._longitude;
    }

    set longitude(value) {
        this._longitude = value;
    }
}

module.exports = Building