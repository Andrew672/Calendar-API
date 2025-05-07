const ical = require('node-ical');

/**
 * Converts a list of objects { filename, ics } into simplified JSON
 */
function parseICSEvents(icsList) {
    const events = [];

    for (const { filename, ics } of icsList) {
        try {
            const parsed = ical.parseICS(ics);
            for (const k in parsed) {
                const ev = parsed[k];
                if (ev.type === 'VEVENT') {
                    events.push({
                        filename,
                        uid: ev.uid,
                        title: ev.summary,
                        description: ev.description,
                        startDate: ev.start?.toISOString(),
                        endDate: ev.end?.toISOString(),
                        location: ev.location || null,
                        allDay: ev.datetype === 'date' ||   (ev.start && ev.end && ev.start.valueOf() === ev.end.valueOf() && ev.start.getHours() === 0 && ev.start.getMinutes() === 0),
                        fullDescription: ev["FULL-DESCRIPTION"] || ev["full-description"] || null,
                        icon: ev["ICON"] || ev["icon"] || null,
                        color: ev["COLOR"] || ev["color"] || null,

                    });
                }
            }
        } catch (err) {
            console.warn(`❌ Échec de parsing pour ${filename}:`, err.message);
        }
    }

    return events;
}

module.exports = { parseICSEvents };
