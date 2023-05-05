const express = require('express');
const router = express.Router();
const axios = require('axios');
const client = require('../elasticsearch/client');
require('log-timestamp');

const URL = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson`;

router.get('/earthquakes', async function (req, res) {
    console.log('Loading application....');
    res.json('Running application....');

    indexData = async () => {
        try {
            console.log('Retrieving all earthquake-related data from the USGS API....');

            const EARTHQUAKES = await axios.get(`${URL}`, {
                headers: {
                    'Content-Type': ['application/json', 'charset=utf-8']
                }
            });

            console.log('All earthquake-related data has been retrieved!');

            results = EARTHQUAKES.data.features;

            console.log('Indexing all retrieved earhtquake-related data');

            results.map(async (results) => {
                (earthquakeObject = {
                    place: results.properties.place,
                    time: results.properties.time,
                    tz: results.properties.tz,
                    url: results.properties.url,
                    detail: results.properties.detail,
                    felt: results.properties.felt,
                    cdi: results.properties.cdi,
                    alert: results.properties.alert,
                    status: results.properties.status,
                    tsunami: results.properties.tsunami,
                    sig: results.properties.sig,
                    net: results.properties.net,
                    code: results.properties.code,
                    sources: results.properties.sources,
                    nst: results.properties.nst,
                    dmin: results.properties.dmin,
                    rms: results.properties.rms,
                    mag: results.properties.mag,
                    magType: results.properties.magType,
                    type: results.properties.type,
                    longitude: results.properties.longitude,
                    latitude: results.properties.latitude,
                    depth: results.properties.depth
                }),
                await client.index({
                    index: 'earthquakes',
                    id: results.id,
                    body: earthquakeObject,
                    pipeline: 'earthquake_data_pipeline'
                })
            })

            if (EARTHQUAKES.data.length) {
                indexData();
            } else {
                console.log('Congratulations! All the retrieved earthquake-related data has been indexed successfully!');                
            }
        }

        catch (err) {
            console.error(err);
        }

        console.log('Preparing for the next iteration....');
    };
    indexData();
});

module.exports = router;