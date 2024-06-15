const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Serve static files from the 'assets' directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create a directory for uploads if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name as the stored file name
    }
});

// Initialize multer upload middleware
const uploadMiddleware = multer({ storage: storage });

// Endpoint to handle file upload
app.post('/upload', uploadMiddleware.single('file'), (req, res) => {
    console.log('File:', req.file);
    console.log('Body:', req.body);
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Send the URL of the uploaded file as a response
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl
    });
});

// Endpoint to list all uploaded files
app.get('/list-uploads', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        // Filter only images and videos
        const fileList = files.filter(file => /\.(jpg|jpeg|png|gif|mp4|mov|avi)$/i.test(file));
        res.json(fileList);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server up and running on port ${PORT}`);
});

