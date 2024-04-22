//import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import axios from 'axios';

const app = express();
const port = 3000;
const apikey  = process.env.FMP_API_KEY;
//console.log("API key", apikey);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());

app.post('/ticker-data', async (req, res) => {
  const { ticker } = req.body;
  try {
    const response = await axios.get(
	`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${apikey}`);

    if (response.data && response.data.length > 0) {
      const data = response.data[0];
      res.json({
        company: data.name,
        symbol: data.symbol,
        price: data.price,
        volume: data.volume,
        price50: data.priceAvg50,
        pe: data.pe,
        // Add more fields as needed
      });
    } else {
      res.status(404).json({ message: `No data found for ticker symbol '${ticker}'` });
    }
  } catch (error) {
    console.error('Error fetching ticker data:', error.message);

    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      res.status(error.response.status).json({ message: 'Error fetching ticker data' });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      res.status(500).json({ message: 'No response received from server' });
    } else {
      // Other errors that occurred during the request
      console.error('Error:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Serve index.html
app.get('/', async (req, res) => {
  try {
    const html = await readFile(join(__dirname, 'index.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } catch (error) {
    console.error('Error serving index.html:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

