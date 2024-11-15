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
      // Step 1: Get cover information
      const coverInfoResponse = await axios.get(
        `https://api.mangadex.org/cover?limit=10&manga%5B%5D=${mangaId}&order%5BcreatedAt%5D=asc&order%5BupdatedAt%5D=asc&order%5Bvolume%5D=asc`,
        {
          headers: { 'accept': 'application/json' },
        }
      );
  
      const coverData = coverInfoResponse.data.data[0]; // Assuming we take the first cover
      const coverFilename = coverData.attributes.fileName;
  
      // Step 2: Fetch the actual cover image
      const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}`;
      const imageResponse = await axios.get(coverUrl, {
        responseType: 'arraybuffer',
        headers: { 'Referer': 'https://mangadex.org' },
      });
  
      // Return image to the client
      res.setHeader('Content-Type', imageResponse.headers['content-type']);
      res.send(imageResponse.data);
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).send('Error fetching image');
    }
  });
  

app.listen(3000, () => console.log("Server ready on port 3000."));

export default app;