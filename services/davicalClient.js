require('dotenv').config();


const { ICalCalendar } = require('ical-generator');
const btoa = require('btoa');
const { parseStringPromise } = require('xml2js');

const DAVICAL_URL = process.env.DAVICAL_URL;
const USERNAME = process.env.DAVICAL_USERNAME;
const PASSWORD = process.env.DAVICAL_PASSWORD;

const { v4: uuidv4 } = require('uuid');
/**
 * Create a new calendar event and upload it to DAViCal as an ICS file
 */
async function createEvent({ title, description, full_description, start, end, icon, color }) {
    const calendar = new ICalCalendar();
    const uuid = uuidv4();
    const uid = `${uuid}@app.local`;

    const event = calendar.createEvent({
        uid,
        start: new Date(start),
        end: new Date(end),
        summary: title,
        description,
        location: 'Depuis React',    
    });
    if (icon) event.x('X-ICON', icon);
    if (full_description) event.x('X-FULL-DESCRIPTION', full_description);
    if (color) event.x('X-COLOR', color);

    const icsData = calendar.toString();
    const filename = `${uid}.ics`;

    const response = await fetch(`${DAVICAL_URL}${filename}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Authorization': 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`)
        },
        body: icsData
    });

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status} ${response.statusText}`);
    }

    console.log("✅ Event successfully published!");
    return filename;
}


/**
 * List all .ics files available in the DAViCal calendar
 */
async function listAll() {
    const response = await fetch(DAVICAL_URL, {
        method: 'PROPFIND',
        headers: {
            'Authorization': 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`),
            'Depth': '1',
            'Content-Type': 'application/xml'
        },
        body: `<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:getetag/>
    <d:getlastmodified/>
    <d:getcontenttype/>
  </d:prop>
</d:propfind>`
    });

    if (!response.ok) {
        throw new Error(`Erreur PROPFIND : ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const json = await parseStringPromise(xml);

    const responses = json.multistatus?.response || [];

    const icsFiles = responses
        .map(r => r.href?.[0])
        .filter(href => href && href.endsWith('.ics'))
        .map(href => decodeURIComponent(href.replace('/test/calendar/', '')));

    return icsFiles;
}


/**
 * Retrieve the raw ICS content of a specific event
 */
async function getEvent(filename) {
    const res = await fetch(`${DAVICAL_URL}${filename}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`)
        }
    });

    if (!res.ok) {
        throw new Error(`Erreur lors du téléchargement de ${filename}`);
    }

    return await res.text(); // retourne le contenu `.ics`
}

/**
 * Delete an event by its filename
 */
async function deleteEventByFilename(filename) {
    const res = await fetch(`${DAVICAL_URL}${filename}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`)
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to delete ${filename}: ${res.status} ${res.statusText}`);
    }

    console.log(`🗑️ Event ${filename} deleted successfully.`);
}

/**
 * Update an existing event (by filename)
 */
async function updateEventByFilename(filename, {uid, title, description, full_description, start, end, icon, color}) {
    const calendar = new ICalCalendar();

    const event = calendar.createEvent({
        uid,
        start: new Date(start),
        end: new Date(end),
        summary: title,
        description,
        location: 'Depuis React',
    });

    if (icon) event.x('X-ICON', icon);
    if (full_description) event.x('X-FULL-DESCRIPTION', full_description);
    if (color) event.x('X-COLOR', color);

    const icsData = calendar.toString();

    const response = await fetch(`${DAVICAL_URL}${filename}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Authorization': 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`)
        },
        body: icsData
    });

    if (!response.ok) {
        throw new Error(`Failed to update ${filename}: ${response.status} ${response.statusText}`);
    }

    console.log(`🔄 Event ${filename} updated successfully.`);
}


module.exports = {
    createEvent,
    listAll,
    getEvent,
    deleteEventByFilename,
    updateEventByFilename
};
