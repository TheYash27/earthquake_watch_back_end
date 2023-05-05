const { Client } = require('@elastic/elasticsearch')
const express = require('express');
const client = require('./elasticsearch/client');
const cors = require('cors');

const app = express();
const port = process.env.port;

const data = require('./data_management/retrieve_and_ingest_data');

app.use('/ingest_data', data);

app.use(cors());

app.get('/results', (req, res) => {
    const passedType = req.query.type;
    const passedMag = req.query.mag;
    const passedLocation = req.query.location;
    const passedDateRange = req.query.dateRange;
    const passedSortOption = req.query.sortOption;

    async function sendESRequest() {
        const body = await client.search({
            index: 'earthquakes',
            body: {
                sort: [
                    {
                        mag: {
                            order: passedSortOption
                        }
                    }
                ],
                size: 300,
                query: {
                    bool: {
                        filter: [
                            {
                                term: { type: passedType }
                            },
                            {
                                range: {
                                    mag: {
                                        gte: passedMag
                                    }
                                }
                            },
                            {
                                match: { place: passedLocation }
                            },
                            {
                                range: {
                                    '@timestamp': {
                                        gte: `now-${passedDateRange}d/d`,
                                        lt: `now/d`
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        })
        res.json(body.hits.hits);
    }
    sendESRequest();
})

app.listen(port, () => {
    console.log(`The server is listening to https://localhost:${port}`);
})