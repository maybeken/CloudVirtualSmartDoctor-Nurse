'use strict';

exports.handler = (event, context, callback) => {
    var AWS = require("aws-sdk");
    
    var s3 = new AWS.S3();
    var docClient = new AWS.DynamoDB.DocumentClient();
    
    var dbParams = {
        TableName : "Nurse"
    };
    
    docClient.scan(dbParams, function(err, data) {
        if(err) console.log(err);
        
        var s3Params = {Bucket: 'iot-project-subtitle', Key: 'queue-nurse.json', Body: JSON.stringify(data.Items), ACL: 'public-read', ContentType: 'text/plain'};

        s3.upload(s3Params, function(err, data) {
           if(err) console.log(err);
           
           callback(null);
        });
    });
};
