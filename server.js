// Import Node's built-in http module
const http = require("http");

// Create an HTTP server instance using the 'http' module.
// The callback function automatically fires every time a client (like a browser) sends a request to the server.
const server = http.createServer((req, res) => {
  
  // Log the requested URL path (e.g., '/', '/about') to the server console for debugging.
  console.log("Request received:", req.url);
  
  // --- ROUTING LOGIC ---
  
  // Route 1: Handle requests to the root/home URL path
  if (req.url === "/") {
    // Send an HTTP 200 OK status code and inform the browser to expect HTML content
    res.writeHead(200, { "Content-Type": "text/html" });
    // Send the HTML payload and close the response stream
    res.end("<h1>Home Page</h1><p>Welcome to my server!</p>");
    
  } 
  // Route 2: Handle requests to the "/about" URL path
  else if (req.url === "/about") {
    // Send an HTTP 200 OK status code and set the content type to HTML
    res.writeHead(200, { "Content-Type": "text/html" });
    // Send the About page HTML content and close the response stream
    res.end("<h1>About Page</h1>");
    
  } 
  // Route 3: Fallback / Catch-all route for any undefined URL paths
  else {
    // Send an HTTP 404 Not Found status code to indicate the page doesn't exist
    res.writeHead(404, { "Content-Type": "text/html" });
    // Send a friendly error message to the user and close the response stream
    res.end("<h1>404 - Page not found</h1>");
  }
});

// Start listening on port 3000
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});