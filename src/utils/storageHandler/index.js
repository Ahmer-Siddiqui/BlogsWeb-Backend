const { saveFileThroughExpressUpload, deleteFileThroughExpressUpload } = require("./expressFileUpload");
const { saveFileToS3Bucket, deleteFileFromS3Bucket } = require("./s3Bucket");
const path = require('path');
const fs = require("fs");

const saveFile = async ({ file, fileDirname, public, allowedTypes }) => {
    try {
        if (!file || !fileDirname) {
            throw new Error('Must provide file and file directory both!');
        }

        const { name, data: buffer, mimetype } = file;

        let uploaded;
        if (process.env.STORAGE_MODE === 's3') {
            uploaded = await saveFileToS3Bucket({
                name,
                buffer,
                mimetype,
                public,
                fileDirname,
                allowedTypes
            });
        } else if (process.env.STORAGE_MODE === 'express-fileupload') {
            uploaded = saveFileThroughExpressUpload({
                file,
                fileDirname,
                allowedTypes
            });
        } else {
            return { success: false, error: 'Specifiy storage mode e.g. s3, express-fileupload etc.'}
        }

        return uploaded;
    } catch (error) {
        console.log('error:', error)
        return { success: false, error: error.message }
    }
}

const deleteFile = async ({fileUrl, fileDirname, public}) => {
    try {

        if (!fileUrl || !fileDirname || !public) {
            throw new Error('Must provide file and file directory both!');
        }

        const urlObj = new URL(fileUrl);
        const pathSegments = urlObj.pathname.split('/');
        const fileName = pathSegments.pop();
        
        let deleted;
        if (process.env.STORAGE_MODE === 's3') {
            deleted = await deleteFileFromS3Bucket({fileName, public, fileDirname });
        } else {
            deleted = deleteFileThroughExpressUpload({ fileName, fileDirname });
        }

        return deleted;

    } catch (error) {
        console.log('error:', error)
        return { success: false, error: error.message }
    }

}


module.exports = {
    saveFile,
    deleteFile
}