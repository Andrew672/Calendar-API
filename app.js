require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

const eventsRoutes = require('./routes/events');
app.use('/api/events', eventsRoutes);

const server = app.listen(PORT, () => {
    console.log(`✅ Backend server started at http://localhost:${PORT}`);
});


server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please choose another one.`);
        process.exit(1); // quitte le programme proprement
    } else {
        console.error('❌ An unexpected error occurred while starting the server:', err);
        process.exit(1);
    }
});
