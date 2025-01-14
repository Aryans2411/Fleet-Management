import express from "express";
import pkg from "pg";
import path from 'path';
// import Groq from "groq-sdk";
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';
import bcrypt from "bcrypt";
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
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data
let userid;
let emailid;
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
app.post("/formPost", async (req, res) => {
    try {
        // console.log("Received login request:", req.body); // Debug log

        const { email, password } = req.body;

        if (!email || !password) {
            console.error("Missing required fields");
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Check if the user exists in the database
        const checkQuery = "SELECT * FROM users WHERE email = $1";
        // console.log("Executing query with email:", email); // Debug log
        const result = await con.query(checkQuery, [email]);

        console.log("Query result:", result.rows.length); // Debug log

        if (result.rows.length === 0) {
            console.error("User does not exist in the database");
            return res
                .status(404)
                .json({ error: "User does not exist. Please sign up first." });
        }

        // User exists; verify the password
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.passwordhash);
        // console.log("Password match:", passwordMatch); // Debug log

        if (!passwordMatch) {
            console.error("Invalid password");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Route to the home page if credentials are valid
        //console.log("User authenticated successfully:", email);
        emailid = email;
        const query = "SELECT userid FROM users WHERE email=$1";
        const uuid = await con.query(query, [emailid]);

        userid = uuid.rows[0].userid;
        console.log(userid);
        // console.log(uuid.rows[0].userid);
        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        console.error("Detailed error in login:", err); // More detailed error logging
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/signUpPost", async (req, res) => {
    try {
        console.log("Sign-up form submitted:", req.body);

        const { name, email, password,phonenumber } = req.body;

        // Validate input fields
        if (!name || !email || !password || !phonenumber) {
            console.error("Missing required fields");
            return res.status(400).json({
                error: "All fields (firstName, email, password) are required",
            });
        }

        // Check if the user already exists
        const checkQuery = "SELECT * FROM users WHERE email = $1";
        const existingUser = await con.query(checkQuery, [email]);

        if (existingUser.rows.length > 0) {
            console.error("User already exists with this email");
            return res
                .status(409)
                .json({ error: "User already exists. Please log in." });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Insert new user into the users table
        const userid = `user-${Date.now()}`; // Generate a simple unique identifier
        const query = `
    INSERT INTO users (userid, name, email, passwordhash, phonenumber)
    VALUES ($1, $2, $3, $4, $5)
`;

        const values = [
            userid,
            name,
            email,
            hashedPassword,
            phonenumber,
        ];

        await con.query(query, values);

        console.log("New user created successfully:", email);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error processing sign-up:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
//initialising table
app.get('/initialise_table', async (req, res) => {
    await initializeDatabase();
    res.send("Tables initialized successfully");
    console.log("Tables initialized successfully");
});
app.post('/api/vehicle_register', async (req, res) => {
    try {
        // Destructure inputs from the request body
        const {
            userid,
            registrationnumber,
            make,
            latitude,
            longitude,
            fueltype,
            idealmileage,
            status,
        } = req.body;

        // Validate required fields
        if (!userid || !registrationnumber || !make || !fueltype) {
            return res.status(400).json({
                error: "Required fields are missing: userid, registrationnumber, make, fueltype",
            });
        }

        // Validate fueltype
        const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
        if (!validFuelTypes.includes(fueltype)) {
            return res.status(400).json({ error: "Invalid fuel type" });
        }

        // Validate status (optional field with default value 'Active')
        const validStatuses = ['Active', 'Inactive', 'Under Maintenance'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        // Insert data into the Vehicles table
        const query = `
            INSERT INTO Vehicles (
                userid, registrationnumber, make, latitude, longitude, fueltype, idealmileage, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'Active'))
            RETURNING vehicleid;
        `;

        const values = [
            userid,
            registrationnumber,
            make,
            latitude,
            longitude,
            fueltype,
            idealmileage,
            status, // Defaults to 'Active' if not provided
        ];

        const result = await con.query(query, values);

        // Respond with success and the newly created vehicle ID
        res.status(201).json({
            message: "Vehicle registered successfully",
            vehicleid: result.rows[0].vehicleid,
        });
    } catch (err) {
        console.error("Error registering vehicle:", err);

        // Handle unique constraint violation for registrationnumber
        if (err.code === '23505') {
            return res.status(409).json({
                error: "Registration number already exists",
            });
        }

        res.status(500).json({ error: "Internal server error" });
    }
});
app.post('/api/driver_register', async (req, res) => {
    try {
        // Destructure inputs from the request body
        const {
            userid,
            name,
            earningperkm,
            licensenumber,
            phonenumber,
            assignedvehicleid,
        } = req.body;

        // Validate required fields
        if (!userid || !name || !licensenumber || !phonenumber) {
            return res.status(400).json({
                error: "Required fields are missing: userid, name, licensenumber, phonenumber",
            });
        }

        // Validate the format of the license number (optional)
        if (licensenumber.length > 50) {
            return res.status(400).json({ error: "License number exceeds maximum length" });
        }

        // Validate that earning per km, if provided, is a positive number
        if (earningperkm !== undefined && earningperkm < 0) {
            return res.status(400).json({ error: "Earning per km must be a positive value" });
        }

        // Insert data into the Drivers table
        const query = `
            INSERT INTO Drivers (
                userid, name, earningperkm, licensenumber, phonenumber, assignedvehicleid
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING driverid;
        `;

        const values = [
            userid,
            name,
            earningperkm,
            licensenumber,
            phonenumber,
            assignedvehicleid || null, // Set to NULL if not provided
        ];

        const result = await con.query(query, values);

        // Respond with success and the newly created driver ID
        res.status(201).json({
            message: "Driver registered successfully",
            driverid: result.rows[0].driverid,
        });
    } catch (err) {
        console.error("Error registering driver:", err);

        // Handle unique constraint violation for licensenumber
        if (err.code === '23505') {
            return res.status(409).json({
                error: "License number already exists",
            });
        }

        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
}); 