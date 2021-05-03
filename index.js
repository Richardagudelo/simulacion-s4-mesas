const express = require('express');
const app = express();
const port = process.env.port || 3000;
app.use(express.json());
app.use(express.urlencoded());

const logger = require('./logging/logger');

app.get('/', (req, res) => {
	res.send('Mesas funcionando !');
});

app.listen(port, () => {
	logger.info(`Mesas listening at http://localhost:${port}`);
});
