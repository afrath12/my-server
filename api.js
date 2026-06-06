const express = require("express");
const app = express();

// --- MIDDLEWARE ---
// Without this middleware, Express will not parse incoming JSON payloads.
// As a result, 'req.body' would return 'undefined' on POST and PUT requests.
app.use(express.json());

// --- MOCK DATABASE ---
// An in-memory array acting as our temporary database.
// Note: If you restart your Node server, this data resets back to these 2 users.
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob",   email: "bob@example.com" }
];

// Tracking variable to auto-increment user IDs sequentially when creating new records.
let nextId = 3;

// ==========================================
// 1. READ (ALL) - GET /users
// ==========================================
app.get("/users", (req, res) => {
  // Returns the entire array of users with a default 200 OK status code.
  res.json(users);
});

// ==========================================
// 2. READ (SINGLE) - GET /users/:id
// ==========================================
// ':id' is a dynamic route parameter. Express populates this in 'req.params.id'.
app.get("/users/:id", (req, res) => {
  // Route parameters always arrive as strings, so we must parse it to an Integer.
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  // Guard Clause: If user isn't found, stop execution immediately and return a 404.
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // If found, return the requested user object.
  res.json(user);
});

// ==========================================
// 3. CREATE - POST /users
// ==========================================
app.post("/users", (req, res) => {
  // Destructure the user properties sent inside the request body payload.
  const { name, email } = req.body;

  // Server-side Validation: Ensure both required fields exist.
  if (!name || !email) {
    // 400 Bad Request indicates client error (missing information).
    return res.status(400).json({ error: "Name and email are required" });
  }

  // Construct the new record, using 'nextId++' to allocate and increment the ID unique value.
  const newUser = { id: nextId++, name, email };
  users.push(newUser);

  // 201 Created indicates successful resource creation.
  res.status(201).json(newUser); 
});

// ==========================================
// 4. UPDATE - PUT /users/:id
// ==========================================
app.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  // Locate where the user exists inside our array index.
  const index = users.findIndex(u => u.id === userId);

  // If findIndex returns -1, the user does not exist.
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // Spread operator logic:
  // Merges the existing user record (...users[index]) with incoming updates (...req.body).
  // The 'id' property cannot be overwritten because users[index] retains its initial ID placement.
  users[index] = { ...users[index], ...req.body };
  
  // Return the updated user object.
  res.json(users[index]);
});

// ==========================================
// 5. DELETE - DELETE /users/:id
// ==========================================
app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  // Store the initial length to track whether an entry was actually removed.
  const before = users.length;
  
  // Filter out the target user, generating a new array lacking the matching ID entry.
  users = users.filter(u => u.id !== userId);

  // If lengths match, it means the targeted ID wasn't in the database to begin with.
  if (users.length === before) {
    return res.status(404).json({ error: "User not found" });
  }

  // Send a success message payload indicating removal.
  res.json({ message: "User deleted" });
});

// --- SERVER START ---
// Instantiates network listener on standard local development port 3000.
app.listen(3000, () => {
  console.log("API running at http://localhost:3000");
});