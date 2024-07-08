/* eslint-env node */

require('dotenv').config();

const express = require('express');

const app = express();

const port = process.env.PORT || 3000;

const {
  DynamoDBClient,
  ListTablesCommand,
  PutItemCommand,
  ScanCommand
} = require('@aws-sdk/client-dynamodb');

const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');

const { marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocument.from(client);

const tableName = process.env.DYNAMODB_TABLE_NAME;

app.use(express.json());

app.use(express.static('public'));

/**
 * Get log entries.
 */
app.get('/api/log', async (req, res) => {
  const command = new ScanCommand({
    TableName: tableName
  });

  const response = await client.send(command);

  return res.json(response.Items);
});

app.get('/api/log/:id', (req, res) => {

});

/**
 * Add log entry.
 */
app.post('/api/log', (req, res) => {
  const command = new PutItemCommand({
    TableName: tableName,
    Item: marshall(req.body)
  });

  client.send(command);

  return res.json({ message: 'Log entry added.' });
});

/**
 * Update rating of log entry.
 */
app.put('/api/log/:id/update-rating', async (req, res) => {
  const response = await docClient.update({
    TableName: tableName,
    Key: {
      id: req.params.id
    },
    UpdateExpression: 'SET rating = :rating',
    ExpressionAttributeValues: { ':rating': req.body.rating },
    ReturnValues: 'ALL_NEW'
  });

  return res.json(response.Attributes);
});

/**
 * Update feedback of log entry.
 */
app.put('/api/log/:id/update-feedback', async (req, res) => {
  const response = await docClient.update({
    TableName: tableName,
    Key: {
      id: req.params.id
    },
    UpdateExpression: 'SET feedback = :feedback',
    ExpressionAttributeValues: { ':feedback': req.body.feedback },
    ReturnValues: 'ALL_NEW'
  });

  return res.json(response.Attributes);
});

app.delete('/api/log/:id', (req, res) => {

});

app.delete('/api/log', (req, res) => {

});

app.listen(port, async () => {
  console.log(`App running on port ${ port }.`);

  const command = new ListTablesCommand({});

  const response = await client.send(command);

  if (!response.TableNames.includes(tableName)) {
    console.error(`[DynamoDB] Table ${ tableName } not found.`);
  } else {
    console.log(`[DynamoDB] Table ${ tableName } found.`);
  }
});