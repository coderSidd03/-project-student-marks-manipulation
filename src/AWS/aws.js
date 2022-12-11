const aws = require("aws-sdk");


aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})


let uploadFile = async (file) => {

    // this function will upload file to aws and return the link
    return new Promise(function (resolve, reject) {

        // create S3 service object
        let s3 = new aws.S3({ apiVersion: '2006-03-01' });                              // we will be using the s3 service of aws

        const uploadParams = {
            ACL: "public-read",                                                         // this file is accessible publicly.. giving permission
            Bucket: "classroom-training-bucket",                                        // it's our main folder name in aws bucket
            Key: "plutonium/backend assignment/user/profileImage/" + file.originalname, // subfolders or path where we place our file                                                         
            Body: file.buffer                                                           // file.originalname >>   will save with the exact file name at the uploading time what we are giving
        }

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data);
            console.log(`file uploaded successfully : ${data.location}`);
            return resolve(data.Location)
        });
    });
}


module.exports = { uploadFile };