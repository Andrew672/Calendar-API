const express = require('express');
const router = express.Router();

const { createEvent, listAll, getEvent, deleteEventByFilename } = require('../services/davicalClient');
const { parseICSEvents } = require('../utils/icsParser');

/**
 * POST /api/events
 * Create a new calendar event
 */
router.post('/', async (req, res) => {
    try {
        await createEvent(req.body);
        res.status(201).json({ message: 'Event created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error while creating the event.' });
    }
});

/**
 * GET /api/events
 * List all raw ICS events
 */
router.get('/', async (_req, res) => {
    try {
        const filenames = await listAll();
        const events = await Promise.all(filenames.map(async (filename) => {
            const ics = await getEvent(filename);
            return { filename, ics };
        }));
        res.status(200).json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error while retrieving events.' });
    }
});

/**
 * GET /api/events/json
 * Return parsed ICS events as JSON
 */
router.get('/json', async (_req, res) => {
    try {
        const filenames = await listAll();
        const rawEvents = await Promise.all(filenames.map(async (filename) => {
            const ics = await getEvent(filename);
            return { filename, ics };
        }));
        const parsed = parseICSEvents(rawEvents);
        res.status(200).json(parsed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error while parsing events.' });
    }
});

/**
 * DELETE /api/events/:filename
 * Delete an event by its filename
 */
router.delete('/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        await deleteEventByFilename(filename);
        res.status(200).json({ message: `Event ${filename} deleted successfully!` });
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: `File ${filename} not found.` });
    }
});

const { updateEventByFilename } = require('../services/davicalClient');

/**
 * PUT /api/events/update/:filename
 * Update an event by its filename
 */
router.put('/:filename', async (req, res) => {
    const { filename } = req.params;

    try {
        await updateEventByFilename(filename, req.body);
        res.status(200).json({ message: `Event ${filename} updated successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error updating event ${filename}.` });
    }
});


module.exports = router;
