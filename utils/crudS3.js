
const AWS = require("aws-sdk");

const accessKeyId = process.env.aws_accessKeyId;
const secretAccessKey = process.env.aws_secretAccessKey;
const dataBucket = process.env.s3_data_bucket;
const fileName = process.env.s3_filename;

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
});

async function putDataToS3(data) {
  try {
    log(`Putting ${fileName} to S3 in progress....`);
    await s3
      .putObject({
        Bucket: dataBucket,
        Key: fileName,
        Body: JSON.stringify(data),
        ContentType: "application/json",
      })
      .promise();
    log(`Successfully uploaded to s3 for ${fileName}`);
  } catch (err) {
    log(`Failed to upload to s3 for ${fileName}`, err);
  }
}
async function getDataFromS3() {
  try {
    log("Getting data from S3");
    const result = await s3
      .getObject({
        Bucket: dataBucket,
        Key: fileName,
      })
      .promise();
    return JSON.parse(result.Body.toString());
  } catch (e) {
    log('Failed to get data from S3', e);
    if (e.code === "NoSuchKey") {
      return null;
    }
    throw e;
  }
}

exports.getDataFromS3 = getDataFromS3;
exports.putDataToS3 = putDataToS3;
