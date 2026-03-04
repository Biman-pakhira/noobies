import AWS from 'aws-sdk';
/**
 * Setup AWS SDK
 */
export function setupAWSSDK() {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
    });
}
export default AWS;
//# sourceMappingURL=aws.js.map