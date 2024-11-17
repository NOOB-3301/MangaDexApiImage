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
        `https://api.mangadex.org/manga/${mangaId}?includes%5B%5D=cover_art`,
        {
          headers: { 'accept': 'application/json' },
        }
      );
  
      const coverData = coverInfoResponse.data.data.relationships.find((item)=> item.type === "cover_art");
      console.log(coverData) // Assuming we take the first cover
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


app.post("/api/v1/chapter-read",async(req,res)=>{
  try {
    const {chapId} = req.body
    const resp = await axios.get (
      `https://api.mangadex.org/at-home/server/${chapId}`
    )
    console.log(resp.data)
    return res.status(200).send({message: resp.data})    
  } catch (error) {
      return res.status(400).send({message:"error while fetching image", error})
  }
})
  

app.get("/proxy/random", async (req, res) => {
  try {
    const coverUrl = `https://pic.re/images`;
    const imageResponse = await axios.get(coverUrl, {
      responseType: 'arraybuffer',
      // headers: { 'Referer': 'https://mangadex.org' },
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow any origin to access this resource
    res.setHeader('Content-Type', imageResponse.headers['content-type']);  // Set the correct image content type
    res.send(imageResponse.data);  // Send image data as response
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

app.listen(3001, () => console.log("Server ready on port 3001."));

export default app;