const express = require("express");
const app = express();


//   GLOBAL APPLICATION MIDDLEWARE
// Global middleware intercepts ALL incoming HTTP requests before they hit any route targets.

// 1. Built-in body parser middleware:
// intercepts incoming data packets, parses raw string buffer payloads into clean JavaScript objects,
// and appends them to the request lifecycle context under 'req.body'.
app.use(express.json());

// 2. Custom Logging middleware:
// Evaluates every operation passing into the environment. It acts as an observation deck, 
// printing runtime telemetry data straight to your terminal screen for diagnostics.
app.use((req, res, next) => {
  const time = new Date().toISOString();
  // Prints structured analytics tags like: [2026-06-06T22:37:24.000Z] POST /users
  console.log(`[${time}] ${req.method} ${req.url}`);
  
  // CRITICAL STEP: Tells Express to release the lock on this request and advance to the next 
  // operation chain function. Without invoking next(), your client connection spins infinitely and times out.
  next(); 
});


//   MOCK APPLICATION STATE (IN-MEMORY DATA)
// Temporary local array container serving as our sandbox infrastructure. 
// Modifying this data updates live app states, but restarting the Node process wipes it back to baseline.
let users = [
  { id: 1, name: "Ainstein", email: "antn@example.com" },
  { id: 2, name: "Bob",      email: "bob@example.com" }
];
let nextId = 3; // Tracking pointer to assign predictable, automated increments to unique user IDs.


//   REUSABLE ROUTE-LEVEL MIDDLEWARE (GUARD)
/**
 * Validation Pipeline Middleware:
 * Inspects request packages to prevent malformed data from infecting our storage system.
 * By standardizing this validation into an independent module function, we can pass it as a filter 
 * array check to multiple specific controllers (like creation and modification).
 */
function validateUser(req, res, next) {
  // Pull fields out from the parsed request body wrapper object
  const { name, email } = req.body;

  // Validation Check 1: Empty Field Assertions
  // Verifies variables are fully defined, non-empty, and aren't falsey values.
  if (!name || !email) {
    // Return early with HTTP 400 (Bad Request). Express halts further execution down this route track.
    return res.status(400).json({
      error: "Validation failed",
      message: "Both name and email are required"
    });
  }

  // Validation Check 2: Structural Conformity Check
  // Ensures the string content includes fundamental token components required for emails.
  if (!email.includes("@")) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Email must contain @"
    });
  }

  // PASS CONTEXT SIGNALLING: 
  // If the logic successfully reaches this point, our data criteria are satisfied. 
  // Hand control off safely to the final functional endpoint controller block.
  next(); 
}

//   ROUTE DEFINITIONS & CONTROLLERS
// 1. READ ALL RECORDS - GET /users
app.get("/users", (req, res) => {
  // Directly transmits our storage array structured out as a valid JSON string body back to client.
  res.json(users);
});

// 2. READ TARGET SPECIFIC RECORD - GET /users/:id
// The syntax token ':id' sets up a dynamic route wildcard placeholder variable.
app.get("/users/:id", (req, res) => {
  // String parameters from paths are cast back into numbers so structural strict equality checks work.
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  // Error Guard Clause: Immediately break operation sequence if lookup evaluation drops undefined results.
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// 3. CREATE NEW RESOURCE ENTRY - POST /users
// Injection Point: We place 'validateUser' right between the route declaration string and the final code callback. 
// Data travels into 'validateUser' first, checks values, and only hits the execution function if valid.
app.post("/users", validateUser, (req, res) => {
  const { name, email } = req.body;
  
  // Package structural blueprint assembly 
  const newUser = { id: nextId++, name, email };
  users.push(newUser);
  
  // Set explicit response status code 201 (Created) confirming permanent system change.
  res.status(201).json(newUser);
});

// 4. UPDATE TARGET RESOURCE - PUT /users/:id
// Reuse our validation middleware guard to block users from saving empty fields during live updates.
app.put("/users/:id", validateUser, (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === userId);

  // If findIndex drops -1, it means search returned nothing in array ranges.
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // IMMUTABLE MERGING VIA SPREAD OPERATOR:
  // Extracts original data fields (...users[index]), overlaying incoming field property overrides (...req.body).
  // Because we force track parameters by index array addresses, the primary matching index 'id' 
  // is fully preserved, preventing client modifications from arbitrarily rewriting system keys.
  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});

// 5. REMOVE INDIVIDUAL RESOURCE ENTRY - DELETE /users/:id
app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const before = users.length; // Cache historical state measurements for data variation verification checks
  
  // Overwrite existing data container, dropping array segments matching target identification conditions.
  users = users.filter(u => u.id !== userId);

  // If container arrays evaluate with matching indices length, target entity was never part of original system collection.
  if (users.length === before) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: "User deleted" });
});

//   CENTRALIZED APPLICATION ERROR SAFETY NET
// Global catch-all error containment handler.
// IMPORTANT NOTE: Express uniquely relies on signature function parameters to isolate Error Middleware. 
// It MUST accept exactly 4 explicit positional arguments '(err, req, res, next)' to route unexpected runtime faults.
app.use((err, req, res, next) => {
  // Standard out diagnostic trace logs into server console windows to protect data streams from exposure risks.
  console.error(err.stack); 
  
  // Return HTTP 500 (Internal Server Error) to hide internal system configurations from malicious exploration efforts.
  res.status(500).json({ error: "Something went wrong" });
});

//   SERVER ACTIVATION BINDING
app.listen(3000, () => {
  console.log("API running at http://localhost:3000");
});