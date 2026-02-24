const express = require('express');
const app = express();
const port = 3000;

// Middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Middleware to parse URL-encoded form data (from the storefront form)
app.use(express.urlencoded({ extended: true }));

// Simple in-memory data store for our items (will reset on server restart)
const catalog = [
  { name: 'Track 1 - Sleepy Vibes', price: 10.99 },
  { name: 'Track 2 - RED Dreams', price: 12.50 }
];

// Home page served by public/index.html (automatic with express.static('public'))

// Route to handle adding an item from the form
app.post('/add-item', (req, res) => {
  const { itemName, itemPrice } = req.body;
  
  // Logic to process the data
  if (itemName && itemPrice) {
    catalog.push({ 
      name: itemName, 
      price: parseFloat(itemPrice) 
    });
    console.log(`📦 New item added: ${itemName} - $${itemPrice}`);
  }

  // Redirect back to the catalog view after processing
  res.redirect('/catalog');
});

// Route to view the current catalog
app.get('/catalog', (req, res) => {
  let catalogHtml = '<h1>My Music Catalog</h1><ul>';
  
  catalog.forEach(item => {
    catalogHtml += `<li><strong>${item.name}</strong> - $${item.price.toFixed(2)}</li>`;
  });
  
  catalogHtml += '</ul><br><a href="/">Back to Form</a>';
  res.send(catalogHtml);
});

// Start the server and listen for requests
app.listen(port, () => {
  console.log(`🎧 Server is running! Open http://localhost:${port} in your browser`);
});
