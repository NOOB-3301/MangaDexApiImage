import express from "express"
import axios from 'axios'
import cors from 'cors'


const app = express();


app.use(express.json());
app.use(cors())
app.get("/", (req, res) => res.send("Express on Vercel"));


app.post('/proxy/mangadex-cover', async (req, res) => {
  const { mangaId } = req.body;

  if (!mangaId) {
    return res.status(400).send('Missing manga ID');
  }

  try {
    // Step 1: Get fresh cover information from MangaDex
    const coverInfoResponse = await axios.get(
      `https://api.mangadex.org/manga/${mangaId}?includes%5B%5D=cover_art&_=${Date.now()}`, // Add timestamp to bypass caching
      {
        headers: {
          'accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );

    const coverData = coverInfoResponse.data.relationships.find(
      (rel) => rel.type === 'cover_art'
    );

    if (!coverData) {
      return res.status(404).send('Cover data not found');
    }

    const coverFilename = coverData.attributes.fileName;
    const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}.256.jpg`;

    // Step 2: Fetch the image
    const imageResponse = await axios.get(coverUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': 'https://mangadex.org', // MangaDex-specific header
        'Cache-Control': 'no-cache',
      },
    });

    // Step 3: Set appropriate headers to prevent caching
    res.setHeader('Content-Type', imageResponse.headers['content-type']);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Expires', '0');
    res.setHeader('Pragma', 'no-cache');

    // Step 4: Send the image data
    res.send(Buffer.from(imageResponse.data, 'binary'));
  } catch (error) {
    console.error('Error fetching image:', error.message);
    res.status(500).send('Error fetching image');
  }
});


app.listen(3000, () => console.log("Server ready on port 3000."));

export default app;