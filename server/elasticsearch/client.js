const { Client } = require('@elastic/elasticsearch');
const config = require('config');
const { response } = require('express');

const elasticConfig = config.get('elastic');

const client = new Client({
    cloud: {
        id: elasticConfig.cloudID
    },
    auth: {
        apiKey: elasticConfig.apiKey
    }
});

client.ping()
    .then(response => {
        console.log("Congratulations! The Node.js server that U created is now connected to Ur Elasticsearch deployment server!")
    })
    .catch(response => {
        console.log("Uh oh! The Node.js server that U created is NOT yet connected to Ur Elasticsearch deployment server!")
    })

module.exports = client;