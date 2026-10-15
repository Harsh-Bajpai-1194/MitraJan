const express = require('express');
require('dotenv').config({ path: '../../.env' });
const cloudinary = require('cloudinary').v2;
const app = express();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

app.get('/api/folder-songs', async (req, res) => {
  try {
    const videoResult = await cloudinary.api.resources({ resource_type: 'video', max_results: 30 });
    const rawResult = await cloudinary.api.resources({ resource_type: 'raw', max_results: 30 });
    const allFiles = [...videoResult.resources, ...rawResult.resources];
    const songs = allFiles.map(file => file.secure_url);
    res.json(songs);
  } catch (error) {
    console.error("Cloudinary Detailed Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(7777, () => console.log('Server running on port 7777'));