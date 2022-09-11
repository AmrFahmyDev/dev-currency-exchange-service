const express = require('express');
const bodyParser = require('body-parser');
const redis = require('ioredis');
const request = require('request');
const redisConfig = require('./db/redisConfig.js').redisConfig;
const socketStore = new redis(redisConfig.port, redisConfig.host, redisConfig.redisOptions);

// const AWS = require("aws-sdk");
// AWS.config.update({ region: 'eu-west-1' });

// const dynamodb = new AWS.DynamoDB.DocumentClient();
// const TableName = 'currencies';


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const dbConnection = require('./db/dbConnection');
dbConnection.connect(); //.then(startApp)

app.get('/', (req, res) => {
  console.log('req.query:', req.query);
  var currency = req.query.currency;
  if (!currency) {
    return res.send('Please query about vaild Currency!');
  }

  return getExchangeRate(res, currency);
});

app.post('/', (req, res) => {
  console.log('req.body:', req.body);
  let currency = req.body.currency;
  let mailAddress = req.body.mailAddress;

  if (!currency) {
    return res.send('Please query about vaild Currency!');
  }
  if (!mailAddress) {
    return res.send('Please query about vaild Email Address!');
  }

  var options = {
    url: process.env.MAIL_SERVICE,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'mailAddress=' + mailAddress
  }
console.log('options:',options);

  request(options, function (err, response, body) {
    console.log('mail service err:', err);
    console.log('mail service body:', body);
    return getExchangeRate(res, currency);
  });
});

app.get('/health', (req, res) => {
  res.status(200);
  res.send('healthy');
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});

function getExchangeRate(res, currency) {
  let exchangeRateKey = currency + '_key';

  socketStore.get(exchangeRateKey, function (getKeyErr, exchangeRateKeyCached) {
    if (getKeyErr) {
      console.log('serverCached|getKeyErr:', getKeyErr);
    } else if (!getKeyErr && exchangeRateKeyCached && exchangeRateKeyCached !== null) {
      console.log('exchangeRateKeyCached:', exchangeRateKeyCached);

      return res.send("Redis_Excange rate for " + currency + " is: " + exchangeRateKeyCached + " LE");
    } else {
      getCurrencyPrice(res, currency);
    }
  });
}

async function getCurrencyPrice(res, currency) {
  const currencyCollection = dbConnection.getCurrencyCollection();
  let result = await currencyCollection.findOne({ currency: currency });

  console.log('result:', result);
  console.log('result.Price:', result.Price);
  res.send("MongoDB_Excange rate for " + currency + " is: " + result.Price + " LE");

  let exchangeRateKey = currency + '_key';
  socketStore.set(exchangeRateKey, result.Price, function (setKeyErr, setKeyResult) {
    socketStore.expire(exchangeRateKey, (60 * 60), function (setExpireErr, setExpireResult) {
      return false;
    });
  });
}