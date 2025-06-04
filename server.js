// /server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {create_context} = require('./core/context');

const app = express();
const port = 8080;

app.use(bodyParser.json());

const context = create_context();

// POST /events/incoming
app.post('/events/incoming', (req, res) => {
    const {type, payload} = req.body;

    if (!type) {
        return res.status(400).json({error: 'missing "type" field'});
    }

    context.logger.log(`[API] Injected event: ${type}`);
    context.emit({type, payload});

    res.status(200).json({success: true});
});

app.listen(port, () => {
    console.log(`[API] listening on http://localhost:${port}`);
});