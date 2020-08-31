// THIS FILE WILL RESET THE DATABASE
// DO NOT RUN UNLESS SOMETHING WENT HORRIBLY WRONG

const Enmap = require('enmap');

const db = new Enmap({
    name: "settings",
    fetchAll: true,
    autoFetch: true,
    cloneLevel: 'deep'
});

// Default settings taken from bot.js
const defaultSettings = {
    prefix: '~',
    adminrole: 'Admin',
    channels: {},
    filter: {
        list: [],
        response: 'Please don\'t use banned words'
    },
    keyphrases: []
}

// db.set('722768991273353246', defaultSettings);
console.log(db.get('722768991273353246'));