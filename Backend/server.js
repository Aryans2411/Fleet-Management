import express from "express";
import pkg from "pg";
import path from "path";
// import Groq from "groq-sdk";
import { fileURLToPath } from "url";
import fs from "fs";
import "dotenv/config";
import bcrypt from "bcrypt";
import cors from "cors";
import { start } from "repl";

const { Client } = pkg;
const app = express();
const port = 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const con = new Client({
  host: "localhost",
  user: "postgres",
  port: process.env.POSTGRES_PORT || 5432,
  password: process.env.POSTGRES_PASS, // Replace with your actual password
  database: process.env.POSTGRES_NAME,
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

app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    credentials: true, // Allow cookies and credentials
  })
);

let userid = process.env.userid;
let emailid = process.env.emailid;
// Function to initialize database tables
async function initializeDatabase() {
  try {
    const sqlFilePath = path.join(__dirname, "db", "table.sql");
    const sqlCommands = fs.readFileSync(sqlFilePath, "utf8");
    await con.query(sqlCommands);
    console.log("Tables initialized successfully");
  } catch (err) {
    console.error("Error initializing tables:", err);
  }
}

//login api controller
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

    console.log("reached here");
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

//sign up controller
app.post("/signUpPost", async (req, res) => {
  try {
    console.log("Sign-up form submitted:", req.body);

    const { name, email, password, phonenumber } = req.body;

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

    const values = [userid, name, email, hashedPassword, phonenumber];

    await con.query(query, values);

    console.log("New user created successfully:", email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error processing sign-up:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//initialising table
app.get("/initialise_table", async (req, res) => {
  await initializeDatabase();
  res.send("Tables initialized successfully");
  console.log("Tables initialized successfully");
});
// api endpoint for finding out total number of drivers
app.get("/api/get_totaldriver", async (req, res) => {
  try {
    const query = `
      SELECT Count(*) FROM Drivers WHERE userid= $1
    `;
    const response = await con.query(query, [userid]);
    res.json(response.rows[0].count);
  } catch (error) {
    console.log("Error in fetching total number of drivers");
    res.status(500).json({ error: "Fetching total number of drivers" });
  }
});

app.get("/api/get_totalvehicles", async (req, res) => {
  try {
    const query = `
      SELECT Count(*) FROM vehicles WHERE userid= $1
    `;
    const response = await con.query(query, [userid]);
    res.json(response.rows[0].count);
  } catch (error) {
    console.log("Error in fetching total number of vehicles");
    res.status(500).json({ error: "Fetching total number of vehicles" });
  }
});

//post api endpoint for vehicle register
app.post("/api/vehicle_register", async (req, res) => {
  try {
    // Destructure inputs from the request body
    const {
      registrationnumber,
      make,
      latitude,
      longitude,
      fueltype,
      idealmileage,
    } = req.body;

    // Validate required fields
    if (
      !registrationnumber ||
      !make ||
      !fueltype ||
      !idealmileage ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({
        error:
          "Required fields are missing: registrationnumber, make, fueltype, idealmileage",
      });
    }

    // Validate fueltype
    const validFuelTypes = ["Petrol", "Diesel"];
    if (!validFuelTypes.includes(fueltype)) {
      return res.status(400).json({ error: "Invalid fuel type" });
    }

    // Insert data into the Vehicles table
    const query = `
            INSERT INTO Vehicles (
                userid, registrationnumber, make, fueltype, idealmileage,latitude,longitude
            )
            VALUES ($1, $2, $3, $4, $5,$6,$7)
            RETURNING vehicleid;
        `;

    const values = [
      userid,
      registrationnumber,
      make,
      fueltype,
      idealmileage, // Defaults to 'Active' if not provided
      latitude,
      longitude,
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
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Registration number already exists",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

//driver_register table
app.post("/api/driver_register", async (req, res) => {
  try {
    // Destructure inputs from the request body
    const { name, earningperkm, licensenumber, phonenumber } = req.body;
    console.log(req.body);
    //console.log(req.body.licensenumber);
    //console.log(req.body.phonenumber);
    // Validate required fields
    if (!name || !licensenumber || !phonenumber) {
      return res.status(400).json({
        error: "Required fields are missing: name, licensenumber, phonenumber",
      });
    }

    // Validate the format of the license number (optional)
    if (licensenumber.length > 50) {
      return res
        .status(400)
        .json({ error: "License number exceeds maximum length" });
    }

    // Validate that earning per km, if provided, is a positive number
    if (earningperkm !== undefined && earningperkm < 0) {
      return res
        .status(400)
        .json({ error: "Earning per km must be a positive value" });
    }

    // Insert data into the Drivers table
    const query = `
            INSERT INTO Drivers (
              userid, name, earningperkm, LicenseNumber, PhoneNumber  
            )
            VALUES ($1, $2, $3, $4,$5)
            RETURNING driverid;
        `;

    const values = [
      userid,
      name,
      earningperkm,
      licensenumber,
      phonenumber,
      // Set to NULL if not provided
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
    if (err.code === "23505") {
      return res.status(409).json({
        error: "License number already exists",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

//api for getting all drivers
app.get("/api/get_all_drivers", async (req, res) => {
  try {
    console.log(userid);
    const query = `SELECT * FROM drivers WHERE userid=$1`;

    const response = await con.query(query, [userid]);
    console.log(response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error("Error fetching drivers data", error);
    res.status(500).json({
      error: "Error fetching in drivers data",
    });
  }
});
// api endpoint for editing the trips table
// app.put("/api/delete_trips",async(req,res)=>{
//   const query = `DELETE FROM Trips
//               WHERE tripID = $1;
//             `;
//   const result = await con.query(query,[])
// })
//api for getting all vehicles
app.get("/api/get_all_vehicles", async (req, res) => {
  try {
    const query = `SELECT * FROM vehicles WHERE userid=$1`;
    const response = await con.query(query, [userid]);
    console.log(response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error("Error fetching vehicles data", error);
    res.status(500).json({
      error: "Error fetching in vehicles data",
    });
  }
});
// API endpoint for trip backend
app.post("/api/tripregistered", async (req, res) => {
  try {
    const {
      starttime,
      endtime,
      startlatitude1,
      startlongitude1,
      endlatitude1,
      endlongitude1,
      distancetravalled1,
    } = req.body;
    console.log(req.body);
    // Parse numeric and integer values
    const startlatitude = parseFloat(startlatitude1);
    const startlongitude = parseFloat(startlongitude1);
    const endlatitude = parseFloat(endlatitude1);
    const endlongitude = parseFloat(endlongitude1);
    const distancetravelled = parseInt(distancetravalled1);
    console.log(distancetravalled1);

    // Validate required fields
    if (
      !startlatitude ||
      !startlongitude ||
      !endlatitude ||
      !endlongitude ||
      !starttime
    ) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields properly." });
    }

    // Find the best-suited vehicle ID (Placeholder for logic)
    let bestVehicleID = null; // Initialize variable to store the best vehicle ID

    /*
      Algorithm for finding the best-suited vehicle:
      1. Query the database to get all inactive vehicles and their current locations (latitude, longitude).
      2. Calculate the Euclidean distance between the start point of the trip (startlatitude, startlongitude) and each vehicle's location.
      3. Select the vehicle with the minimum distance.
      4. Assign the vehicle ID to the `bestVehicleID` variable.
    */
    const inactiveVehiclesQuery = `
      SELECT vehicleid, latitude, longitude
      FROM vehicles
      WHERE status = 'Inactive';
    `;
    const vehicles = await con.query(inactiveVehiclesQuery);

    if (vehicles.rows.length > 0) {
      let minDistance = Number.MAX_SAFE_INTEGER;

      vehicles.rows.forEach((vehicle) => {
        const vehicleLatitude = parseFloat(vehicle.latitude);
        const vehicleLongitude = parseFloat(vehicle.longitude);

        // Calculate Euclidean distance
        const distance = Math.sqrt(
          Math.pow(vehicleLatitude - startlatitude, 2) +
            Math.pow(vehicleLongitude - startlongitude, 2)
        );

        // Update the bestVehicleID if a closer vehicle is found
        if (distance < minDistance) {
          minDistance = distance;
          bestVehicleID = vehicle.vehicleid;
        }
      });
    } else {
      return res.status(404).json({ error: "No inactive vehicles available." });
    }
    console.log(bestVehicleID);
    // selecting driver_id
    const query3 = `
      SELECT driverid
      FROM drivers
      WHERE userid = $1 AND assignedvehicleid IS NULL;
    `;
    const response3 = await con.query(query3, [userid]);
    const driverid = response3.rows[0].driverid;
    console.log(driverid);
    // Define the query to insert the trip into the database
    const query = `
    INSERT INTO trips (
      userid,
      vehicleid,
      driverid,
      startlatitude,
      startlongitude,
        endlatitude,
        endlongitude,
        starttime,
        endtime,
        distancetravelled
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10)
        RETURNING tripid;
        `;

    // console.log("reached here",distancetravelled);
    // Execute the query
    const response = await con.query(query, [
      userid,
      bestVehicleID,
      driverid,
      startlatitude,
      startlongitude,
      endlatitude,
      endlongitude,
      starttime,
      endtime,
      distancetravelled,
    ]);
    const query4 = `
      UPDATE drivers
      SET assignedvehicleid = $1
      WHERE driverid = $2
    `;
    const response4 = await con.query(query4, [bestVehicleID, driverid]);
    const query5 = `
      UPDATE vehicles
      SET status = $1
      WHERE vehicleid = $2
    `;
    const response5 = await con.query(query5, ["Active", bestVehicleID]);

    // console.log(response4.rows);
    // Return the newly created trip ID
    console.log(response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error("Error in registering trips:", error);
    res.status(500).json({ error: "Error in registering for trips" });
  }
});
//API endpoint for getting all trips
app.get("/api/get_all_trips", async (req, res) => {
  try {
    const query = `
      SELECT 
        Trips.tripid,
        Trips.userid,
        Drivers.name AS name,
        Vehicles.registrationNumber AS registrationnumber,
        Trips.Startlatitude,
        Trips.Startlongitude,
        Trips.Endlatitude,
        Trips.Endlongitude,
        Trips.StartTime,
        Trips.EndTime,
        Trips.DistanceTravelled,
        Trips.TripStatus,
        Trips.revenue
      FROM Trips
      INNER JOIN Drivers ON Trips.driverid = Drivers.driverid
      INNER JOIN Vehicles ON Trips.vehicleid = Vehicles.vehicleid
      WHERE Trips.userid = $1
    `;

    // console.log("reached here", userid)
    const response = await con.query(query, [userid]);
    res.json(response.rows);
  } catch (error) {
    console.error("Error fetching trips data:", error);
    res.status(500).json({
      error: "Error fetching trips data",
    });
  }
});

//API endpoint for getting total active vehicles
app.get("/api/get_active_vehicle", async (req, res) => {
  try {
    const query = `SELECT Count(*) FROM vehicles where userid=$1 AND status='Active'`;
    const response = await con.query(query, [userid]);
    const activeVehicleCount = response.rows[0].count;
    console.log("active vehicles", activeVehicleCount);
    res.json(response.rows[0].count); // return only the count as an object
  } catch (error) {
    console.error("error in fetching total active vehicles", error);
    res.status(500).json({ error: "error in fetching active vehicles" });
  }
});
//api endpoint for getting all the maintenance record
app.get("/api/get_maintenance", async (req, res) => {
  try {
    const query = `SELECT * FROM maintenancerecords WHERE userid= $1`;
    const result = await con.query(query, [userid]);
    console.log("Result :", result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error({ error: "Error in getting the maintainance record" });
    res.status(500).json({ error: "Error fetching in maintainance record" });
  }
});
//api endpoint for posting all the maintenance record
app.post("/api/maintenanceregister", async (req, res) => {
  try {
    const { vehicleid, maintenancetype, cost, maintenancedate, remarks } =
      req.body;
    if (
      !vehicleid ||
      !maintenancetype ||
      !cost ||
      !maintenancedate ||
      !remarks
    ) {
      res.status(400).json({ error: "Please fill all the details" });
    }

    const query = `
    INSERT INTO maintenancerecords(userid,vehicleid,maintenancetype,cost,maintenancedate,nextduedate,remarks)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING recordid
    `;
    const nextduedate = null;
    const result = await con.query(query, [
      userid,
      vehicleid,
      maintenancetype,
      cost,
      maintenancedate,
      nextduedate,
      remarks,
    ]);
    console.log(result.rows[0].recordid);

    const update_query = `UPDATE vehicles
                            SET status='Under Maintenance'
                            where vehicleid=$1`;

    const result1 = await con.query(update_query, [vehicleid]);
    res.json(result.rows[0].recordid);
  } catch (error) {
    console.error({ error: "Error in posting the record" });
    res.status(400).json({ error: "Error in posting the record" });
  }
});

app.get("/api/get_total_maintenance_vehicles", async (req, res) => {
  try {
    const query = `
      SELECT Count(*) FROM vehicles WHERE userid= $1 AND status='Under Maintenance'
    `;
    const response = await con.query(query, [userid]);
    res.json(response.rows[0].count);
  } catch (error) {
    console.log("Error in fetching total number of vehicles");
    res.status(500).json({ error: "Fetching total number of vehicles" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
