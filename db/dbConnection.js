const { MongoClient } = require('mongodb');
const dbConfig = require('./dbconfig');
const authMechanism = 'DEFAULT';
var currencyCollection;

async function connect() {
    let authDB = `${dbConfig.authDB || dbConfig.dbName}`;
    let dbURL = `mongodb://${encodeURIComponent(dbConfig.dbUsername)}:${encodeURIComponent(dbConfig.dbPassword)}@${dbConfig.dbHost}:${dbConfig.dbPort}/${authDB}?authMechanism=${authMechanism}`;

    // let dbURL = `mongodb://${encodeURIComponent(dbConfig.dbUsername)}:${encodeURIComponent(dbConfig.dbPassword)}@${dbConfig.dbHost}:${dbConfig.dbPort}`; // /${dbConfig.dbName}

    const options = {
        useUnifiedTopology: true,
        keepAlive: true,
    };

    const mongoClient = new MongoClient(dbURL, options);

    let result = await mongoClient.connect()
        .catch(err => {
            console.log('create client err:', err);
            if (process.env.NODE_ENV !== 'localhost') {
                setTimeout(function () {
                    process.exit(1);
                }, 1000 * 10);
            }
        });

    console.log(`Connected to ${dbConfig.dbName}`);

    currencyCollection = mongoClient.db(dbConfig.dbName).collection('currency');

    // currencyCollection = mongoClient.collection('currency');
}

function getCurrencyCollection() {
    return currencyCollection;
}

module.exports = {
    connect,
    getCurrencyCollection
}