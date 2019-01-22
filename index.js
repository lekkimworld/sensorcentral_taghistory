const moment = require('moment-timezone');
const fetch = require('node-fetch');
require('dotenv').config()

const DATETIME_FORMAT = process.env.DATETIME_FORMAT || 'DD-MM-YYYY HH:mm';
const TIMEZONE = process.env.TIMEZONE || 'Europe/Copenhagen';
const GRAFANA_URL = process.env.GRAFANA_URL;
const GRAFANA_APIKEY = process.env.GRAFANA_APIKEY;

const tags = '&tags=' + (process.env.GRAFANA_TAGS || 'genstart').split(',').join('&tags=')

fetch(`${GRAFANA_URL}/api/annotations?type=user${tags}`, {
    headers: {
        'Authorization': `Bearer ${GRAFANA_APIKEY}`
    }
}).then(resp => resp.json()).then(payload => {
    const entries = payload.map(entry => {
        const text = entry.text;
        const tags = entry.tags;
        const firstTag = entry.tags[0];
        const obj_moment = moment(entry.time).tz(TIMEZONE);
        const datetime = obj_moment.format(DATETIME_FORMAT);
        return {
            text, 
            tags,
            firstTag,
            'moment': obj_moment,
            datetime
        }
    });
    entries.sort((a, b) => {
        return -1 * a.moment.utc().diff(b.moment.utc());
    })
    entries.forEach(entry => {
        console.log(`${entry.datetime} ${entry.text}`);
    })
});
