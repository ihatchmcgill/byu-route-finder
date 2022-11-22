const CREATE_PEOPLE_TABLE = 'CREATE TABLE IF NOT EXISTS people (' +
    'byu_id INT PRIMARY KEY, ' +
    'first_name TEXT, ' +
    'last_name TEXT, ' +
    'step_goal INT, ' +
    'calorie_goal INT ' +
    ')'

const CREATE_BUILDINGS_TABLE = 'CREATE TABLE IF NOT EXISTS buildings (' +
    'building_acronym TEXT PRIMARY KEY, ' +
    'building_name TEXT, ' +
    'latitude FLOAT, ' +
    'longitude FLOAT ' +
    ')'
const CREATE_USER_ROUTES_TABLE = 'CREATE TABLE IF NOT EXISTS user_routes (' +
    'route_id TEXT PRIMARY KEY,' +
    'byu_id INT REFERENCES people(byu_id) ON DELETE CASCADE ON UPDATE CASCADE, ' +
    'route_locations TEXT, ' +
    'week_day TEXT, ' +
    'distance_miles FLOAT, ' +
    'distance_steps INT GENERATED ALWAYS AS (distance_miles * 2200) STORED,' +
    'calories_burned INT GENERATED ALWAYS AS (distance_miles * 100) STORED, ' +
    'time_minutes FLOAT' +
    ')'

const CREATE_STEPS_TABLE = 'CREATE TABLE IF NOT EXISTS steps (' +
    'step_order INT, ' +
    'byu_id INT REFERENCES people(byu_id) ON DELETE CASCADE ON UPDATE CASCADE, ' +
    'route_id TEXT REFERENCES user_routes(route_id) ON DELETE CASCADE ON UPDATE CASCADE, ' +
    'week_day TEXT, ' +
    'start_location TEXT, ' +
    'end_location TEXT, ' +
    'distance_miles FLOAT, ' +
    'distance_steps INT GENERATED ALWAYS AS (distance_miles * 2200) STORED,' +
    'calories_burned INT GENERATED ALWAYS AS (distance_miles * 100) STORED, ' +
    'time_minutes FLOAT ' +
    ')'

const DROP_TABLES = [
    'DROP TABLE IF EXISTS steps',
    'DROP TABLE IF EXISTS user_routes',
    'DROP TABLE IF EXISTS people',
    'DROP TABLE IF EXISTS buildings'
]

module.exports = {CREATE_BUILDINGS_TABLE,CREATE_USER_ROUTES_TABLE,CREATE_PEOPLE_TABLE,CREATE_STEPS_TABLE, DROP_TABLES}
