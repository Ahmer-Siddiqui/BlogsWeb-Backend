const crypto = require("crypto");
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const {
    S3_BUCKET_NAME: s3BucketName,
    S3_BUCKET_REGION: s3BucketRegion,
    S3_ACCESS_KEY: s3AccessKey,
    S3_SECRET_ACCESS_KEY: s3SecretAccessKey,
} = process.env;

// Initialize S3
const s3 = new S3Client({
    credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretAccessKey
    },
    region: s3BucketRegion
});


const randomFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');


// Save file to S3 bucket.
const saveFileToS3Bucket = async ({ name, buffer, mimetype, public, fileDirname, allowedTypes }) => {
    try {
        if (!fileDirname) {
            throw new Error('Mention file directory to store files.');
        }

        // Validate file type (if required)
        if (allowedTypes && typeof allowedTypes === 'string') {
            if (!mimetype.startsWith(allowedTypes)) {
                throw new Error(`Please upload a ${allowedTypes} file, you uploaded '${mimetype}' file.`);
            }
        } else if (allowedTypes && Array.isArray(allowedTypes)) {
            if (!allowedTypes.some(type => mimetype.startsWith(type))) {
                throw new Error(`Please upload a file of type: ${allowedTypes.join(', ')}, you uploaded '${mimetype}' file.`);
            }
        }

        // Create unique file name and file path.
        let fileName;
        if (name) fileName = `${randomFileName()}-${name.replaceAll(' ', '-')}`;
        else fileName = randomFileName();

        let filePath;
        if (public) filePath = `public/${fileDirname}/${fileName}`;
        else filePath = `${fileDirname}/${fileName}`;


        // Set params and save file to S3
        let params = {
            Bucket: s3BucketName,
            Key: filePath,
            Body: buffer,
            ContentType: mimetype,
        }

        if (public) params.ACL = 'public-read';

        const putCommand = new PutObjectCommand(params);
        await s3.send(putCommand);

        // Construct the public URL
        let fileUrl;
        if (public) {
            fileUrl = `https://${s3BucketName}.s3.amazonaws.com/${filePath}`;
        } else {
            fileUrl = null;
        }

        return { success: true, fileName, fileUrl };

    } catch (error) {
        console.log("error: ", error);
        return { success: false, error: error.message };
    }
};


// Get signed url for the private files
const getFileSignedURLFromS3Bucket = async ({ fileName, fileDirname, expiresIn = 900 }) => {
    try {
        const command = new GetObjectCommand({
            Bucket: s3BucketName,
            Key: `${fileDirname}/${fileName}`,
        });
        const fileUrl = await getSignedUrl(s3, command, { expiresIn });

        return { success: true, fileUrl }
    } catch (error) {
        console.log("error: ", error);
        return { success: false, error: error.message };
    }
}


// Delete file from S3 bucket.
const deleteFileFromS3Bucket = async ({ fileName, public, fileDirname }) => {
    try {

        let filePath;
        if (public) filePath = `public/${fileDirname}/${fileName}`;
        else filePath = `${fileDirname}/${fileName}`;

        const command = new DeleteObjectCommand({
            Bucket: s3BucketName,
            Key: filePath,
        });

        await s3.send(command);

        return { success: true, fileName };
    } catch (error) {
        console.log("error: ", error);
        return { success: false, error: error.message };
    }

}



module.exports = {
    saveFileToS3Bucket,
    getFileSignedURLFromS3Bucket,
    deleteFileFromS3Bucket,
}



/* S3 Configration for Public + Private Access Files


*************** IAM Configrations ***************
- Go to the policy for the user.
- Set the following policy for the user:
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualEditor0",
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject",
                    "s3:GetObject",
                    "s3:DeleteObject",
                    "s3:PutObjectAcl"
                ],
                "Resource": "arn:aws:s3:::DOC-EXAMPLE-BUCKET/*"
            }
        ]
    }

*************** S3 Configrations ***************

STEP 1: Block public access (bucket settings)
- Set 'Block all public access' to uncheck.
- Click on 'Save Changes'


STEP 2: Make a Bucket Policy
- Set the following policy for the bucket:
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AddPerm",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::DOC-EXAMPLE-BUCKET/publicprefix/*"
            }
        ]
    }
- Click on 'Save Changes'

STEP 3: Object Ownership
- Set 'ACLs enabled'
- Click on 'Save Changes'

*/