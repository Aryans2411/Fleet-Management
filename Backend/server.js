import express from "express";
import pkg from "pg";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const { Client } = pkg;
const app = express();
const port = 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const con = new Client({
    host: "localhost",
    user: "postgres",
    port:  process.env.POSTGRES_PORT || 5432,
    password: process.env.POSTGRES_PASS, // Replace with your actual password
    database: "fleet"
});
con.connect(async (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to database");
    }
});
// Function to initialize database tables
console.log("reached here")
 async function initializeDatabase() {
     try {
         const sqlFilePath = path.join(__dirname, 'db', 'table.sql');
         const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
         await con.query(sqlCommands);
         console.log("Tables initialized successfully");
     } catch (err) {
        console.error("Error initializing tables:",err);
    }
}
app.get('/initialise_table', async (req, res) => {
    await initializeDatabase();
    res.send("Tables initialized successfully");
    console.log("Tables initialized successfully");
});
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
}); 