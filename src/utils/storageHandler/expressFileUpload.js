const fs = require('fs');
const path = require('path');

const saveFileThroughExpressUpload = ({ file, fileDirname, allowedTypes }) => {
    console.log(file);
    try {

        if (!fileDirname) {
            throw new Error('Mention file directory to store files.');
        }

        // Validate file type (if required)
        if (allowedTypes && typeof allowedTypes === 'string') {
            if (!file.mimetype.startsWith(allowedTypes)) {
                throw new Error(`Please upload a ${allowedTypes} file, you uploaded '${file.mimetype}' file.`);
            }
        } else if (allowedTypes && Array.isArray(allowedTypes)) {
            if (!allowedTypes.some(type => file.mimetype.startsWith(type))) {
                throw new Error(`Please upload a file of type: ${allowedTypes.join(', ')}, you uploaded '${mimetype}' file.`);
            }
        }

        const fileName = `${Date.now()}-${file.name.replaceAll(' ', '-')}`;
        const filePath = path.join(process.cwd(), 'public', fileDirname, fileName);

        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

        file.mv(filePath, (error) => {
            if (error) {
                console.log("error: ", error);
                throw error;
            }
        });

        const fileUrl = `http://localhost:${process.env.PORT}/public/${fileDirname}/${fileName}`;

        return { success: true, fileName, fileUrl };
    } catch (error) {
        console.log("error: ", error);
        return { success: false, error: error.message };
    }
};

const deleteFileThroughExpressUpload = ({ fileName, fileDirname }) => {
    
    const filePath = path.join(process.cwd(), 'public', fileDirname, fileName);
    if (!fs.existsSync(filePath)) return { success: false, error: 'File does not exist' }

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return { success: true, fileName };
        } else {
            throw new Error('File not found!');
        }
    } catch (error) {
        console.log("error: ", error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    saveFileThroughExpressUpload,
    deleteFileThroughExpressUpload
};
