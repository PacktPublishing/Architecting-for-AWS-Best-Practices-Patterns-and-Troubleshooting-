'use strict';
const aws = require('aws-sdk');
const s3 = new aws.S3();
const table = 'packt-authors-table';

aws.config.update({
    region: "eu-west-1"
});

var docClient = new aws.DynamoDB.DocumentClient();

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello ' + event.pathParameters.name + ' youve setup a serverless API',
    }),
  };
  callback(null, response);
};

module.exports.reads3 = (event, context, callback) => {
  const getParams = {
      Bucket: 'packt-james-test-bucket', // your bucket name,
      Key: 'packt-test-file.txt' // path to the object you're looking for
  }

  s3.getObject(getParams, function(err, data) {

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        s3data: data.Body.toString('utf-8'),
      }),
    };

    callback(null, response)
  });
};

module.exports.getAuthors = (event, context, callback) => {
  var email_address = event.pathParameters.email

  console.log('Using ' + email_address)

  var params = {
        TableName: table,
        KeyConditionExpression: 'email_address = :email_address',
        ExpressionAttributeValues: {
            ":email_address": email_address
        }
    }

  docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");

            const response = {
              statusCode: 200,
              body: JSON.stringify({
                dynamodata: data.Items
              }),
            };

            callback(null, response)
        }
    });
}

module.exports.createAuthor = (event, context, callback) => {
  console.log(event.body)

  const data = JSON.parse(event.body)

  var email_address = data.email_address
  var first_name = data.first_name
  var last_name = data.last_name
  var course_title = data.course_title
  
  var params = {
        TableName: table,
        Item:{
          "email_address": email_address,
          "first_name": first_name,
          "last_name": last_name,
          "course_title": course_title
        }
  }

  console.log("Inserting item " + params.Item)

  docClient.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: 501,
        body: 'Couldn\'t create the author item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };

    console.log("Added item:", JSON.stringify(data, null, 2));
    callback(null, response);
  });
}
