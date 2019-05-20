'use strict';
const aws = require('aws-sdk');

var kinesis = new aws.Kinesis({region : 'eu-west-1'});
const stream_name = 'my-first-stream'

module.exports.produce = (event, context, callback) => {
  for(var i =0; i < 1000; i++) {
    _writeToKinesis();  
  }
};

function _writeToKinesis() {
    var currTime = new Date().getMilliseconds();
    var sensor = 'sensor-' + Math.floor(Math.random() * 100000);
    var reading = Math.floor(Math.random() * 1000000);

    var record = JSON.stringify({
      time : currTime,
      sensor : sensor,
      reading : reading
    });

    var recordParams = {
      Data : record,
      PartitionKey : sensor,
      StreamName : stream_name
    };

    kinesis.putRecord(recordParams, function(err, data) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('Successfully sent data to Kinesis.');
      }
    });
  }


