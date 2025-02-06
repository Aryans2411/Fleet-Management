import express from "express";
import pkg from "pg";
import path from "path";
// import Groq from "groq-sdk";
import { fileURLToPath } from "url";
import fs from "fs";
import Groq from "groq-sdk";
import "dotenv/config";
import bcrypt from "bcrypt";
import cors from "cors";
import { start } from "repl";

const { Client } = pkg;
const app = express();
const port = 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({
  apiKey: API_KEY,
});
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
    // console.log("Tables initialized successfully");
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

    //  console.log("Query result:", result.rows.length); // Debug log

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

    // console.log("reached here");
    // Route to the home page if credentials are valid
    // console.log("User authenticated successfully:", email);
    emailid = email;
    const query = "SELECT userid FROM users WHERE email=$1";
    const uuid = await con.query(query, [emailid]);

    userid = uuid.rows[0].userid;
    // console.log(userid);
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
    //console.log("Sign-up form submitted:", req.body);

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

    // console.log("New user created successfully:", email);
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
  // console.log("Tables initialized successfully");
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
    // console.log("Error in fetching total number of drivers");
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
    //console.log("Error in fetching total number of vehicles");
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
    // console.log(req.body);
    // console.log(req.body.licensenumber);
    // console.log(req.body.phonenumber);
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
    // console.log(userid);
    const query = `SELECT * FROM drivers WHERE userid=$1`;

    const response = await con.query(query, [userid]);
    // console.log(response.rows);
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
    // console.log(response.rows);
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
      revenue,
    } = req.body;
    // console.log(req.body);
    // Parse numeric and integer values
    const startlatitude = parseFloat(startlatitude1);
    const startlongitude = parseFloat(startlongitude1);
    const endlatitude = parseFloat(endlatitude1);
    const endlongitude = parseFloat(endlongitude1);
    const distancetravelled = parseInt(distancetravalled1);
    const reveneue = parseInt(revenue);
    // console.log(distancetravalled1);

    // Validate required fields
    if (
      !startlatitude ||
      !startlongitude ||
      !endlatitude ||
      !endlongitude ||
      !starttime ||
      !revenue
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
    let mileage;
    const inactiveVehiclesQuery = `
      SELECT vehicleid, latitude, longitude,idealmileage
      FROM vehicles
      WHERE status = 'Inactive' AND ($1<nextduedate OR nextduedate is NULL);
    `;
    const vehicles = await con.query(inactiveVehiclesQuery, [endtime]);

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
          mileage = vehicle.idealmileage;
        }
      });
    } else {
      return res.status(404).json({ error: "No free  vehicles available." });
    }
    // console.log(bestVehicleID);
    // selecting driver_id
    const query3 = `
      SELECT driverid
      FROM drivers
      WHERE userid = $1
      AND assignedvehicleid IS NULL
      AND (lastdutydate IS NULL OR $2 - lastdutydate > 1);
    `;
    const response3 = await con.query(query3, [userid, starttime]);
    const driverid = response3.rows[0].driverid;
    const percentagedistancesaved = Math.random() * (25 - 10) + 10;
    const distancesaved = distancetravelled*percentagedistancesaved/100;
    const fuelsaved = distancesaved/mileage;
    const emissionfactor = 2.68;
    const co2emission = emissionfactor * fuelsaved;
    console.log("reached here " , co2emission);
    // console.log(driverid);
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
        distancetravelled,
        revenue,
        savings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12)
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
      revenue,
      co2emission
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
    // console.log(response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error("Error in registering trips:", error);
    res.status(500).json({ error: "Error in registering for trips" });
  }
});
//api endpoint for creating a graph for carbon emission on monthly basis
app.get("/api/carbonemissiondata",async(req,res)=>{
  try {
    const query1 = `
        WITH month AS (
        SELECT generate_series(1, 12) AS month_number
        )
        SELECT 
            m.month_number,
            COALESCE(SUM(t.savings),0) AS carbonemission
        FROM month m
        LEFT JOIN Trips t ON EXTRACT(MONTH FROM t.starttime) = m.month_number
        GROUP BY m.month_number
        ORDER BY m.month_number;
    `;
    const response = await con.query(query1);
    console.log(response.rows[0]);
    res.json(response.rows);
  } catch (error) {
    console.error({message:"Error in getting all the carbon emission data"});
    res.status(400).json({error:"Error in getting all the carbon emission data"});
  }
})
//api endpoint for marking the trip completion
app.post("/api/tripcompletion", async (req, res) => {
  try {
    const { registrationnumber, endtime } = req.body;

    const query1 = `
      SELECT vehicleid
      FROM vehicles
      WHERE registrationnumber = $1
    `;
    const response1 = await con.query(query1, [registrationnumber]);
    const vehicleid = response1.rows[0].vehicleid;
    const query2 = `
      UPDATE trips
      SET
        tripstatus = 'Completed'
        WHERE vehicleid = $1 AND tripstatus = 'Scheduled'
    `;
    const response2 = await con.query(query2, [vehicleid]);
    const query3 = `
      UPDATE vehicles
      SET 
        status = 'Inactive'
        WHERE vehicleid = $1
    `;
    const response3 = await con.query(query3, [vehicleid]);
    const query4 = `
      UPDATE drivers
SET 
    assignedvehicleid = NULL, 
    lastdutydate = $1
WHERE assignedvehicleid = $2;
    `;
    const response4 = await con.query(query4, [endtime, vehicleid]);
    res.status(200).json({ message: "Updated successfully trip completion!" });
  } catch (error) {
    console.error("Error in registering the trip completion:", error);
    res.status(500).json({ error: "Error in trip completion registered" });
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

app.get("/api/get_totalrevenue", async (req, res) => {
  try {
    const query = `
          SELECT SUM(revenue) 
          FROM Trips
          WHERE userid = $1
      `;
    const result = await con.query(query, [userid]);
    // console.log("result", result.rows[0].sum);
    res.json(Number(result.rows[0].sum));
  } catch (error) {
    console.error({ error: "Error in fetching the total revenue" });
    res.status(500).json({ error: "Error in fetching the total revenue" });
  }
});

app.get("/api/get_totalcost", async (req, res) => {
  try {
    const petrolprice = 102;
    const dieselprice = 75;
    const query1 = `
    SELECT SUM(cost)
    FROM maintenancerecords
    WHERE userid=$1
    `;
    const result = await con.query(query1, [userid]);
    const sum = isNaN(parseInt(result.rows[0].sum))
      ? 0
      : parseInt(result.rows[0].sum);

    // console.log("this is sum ", sum);
    //this query2 is for fuel consumption cost
    const query2 = `
    SELECT 
    SUM(
      (t.distancetravelled / v.idealmileage) * 
      CASE 
      WHEN v.fueltype = 'Petrol' THEN $1
      WHEN v.fueltype = 'Diesel' THEN $2
      ELSE 0
      END
      ) AS net_amount
      FROM trips t
      JOIN vehicles v ON t.vehicleid = v.vehicleid
      WHERE v.userid = $3;
      
      `;
    const result2 = await con.query(query2, [petrolprice, dieselprice, userid]);
    const netamount1 = parseInt(result2.rows[0].net_amount);
    // console.log("netamount1", netamount1);
    const query3 = `
      SELECT 
      SUM(t.distancetravelled * d.earningperkm) AS net_earning
      FROM trips t
      JOIN drivers d ON t.driverid = d.driverid 
      WHERE d.userid = $1;
      `;
    const result3 = await con.query(query3, [userid]);
    const netamount2 = parseInt(result3.rows[0].net_earning);
    // console.log("this is netamount2", netamount2);
    // console.log(netamount2);
    // console.log(netamount1);
    // console.log("result",result.rows[0].sum,result2.rows[0].net_amount," ",result3.rows[0].net_earning);
    const cost = sum + netamount1 + netamount2;
    //console.log(cost);
    res.json(cost);
  } catch (error) {
    console.error({ error: "Error in fetching the total cost" });
    res.status(500).json({ error: "Error in fetching the total cost" });
  }
});
//API endpoint for getting total active vehicles
app.get("/api/get_active_vehicle", async (req, res) => {
  try {
    const query = `SELECT Count(*) FROM vehicles where userid=$1 AND status='Active'`;
    const response = await con.query(query, [userid]);
    const activeVehicleCount = response.rows[0].count;
    // console.log("active vehicles", activeVehicleCount);
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
    // console.log("Result :", result.rows);
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
    const query5 = `
        SELECT status 
        FROM vehicles
        WHERE vehicleid = $1
    `;
    const result6 = await con.query(query5, [vehicleid]);
    if (
      result6.rows[0].status === "Active" ||
      result6.rows[0].status === "Under Maintenance"
    ) {
      return res
        .status(404)
        .json({ error: "Please select any inactive vehicle" });
    }

    const query = `INSERT INTO maintenancerecords(userid,vehicleid,maintenancetype,cost,maintenancedate,remarks)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING recordid`;
    const result = await con.query(query, [
      userid,
      vehicleid,
      maintenancetype,
      cost,
      maintenancedate,
      remarks,
    ]);
    // console.log(result.rows[0].recordid);

    const update_query = `UPDATE vehicles
                            SET status='Under Maintenance'
                            where vehicleid=$1;`;

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
    // console.log("Error in fetching total number of vehicles");
    res.status(500).json({ error: "Fetching total number of vehicles" });
  }
});
app.post("/api/set_maintenance_date", async (req, res) => {
  try {
    const { nextduedate, registrationnumber } = req.body;
    console.log("request body: ", req.body);
    const query = `UPDATE vehicles SET nextduedate = $1
                  WHERE registrationnumber = $2`;
    const response = await con.query(query, [nextduedate, registrationnumber]);
    res.json(response.rows);
  } catch (error) {
    console.error({ error: "Error in posting the record" });
    res.status(400).json({ error: "Error in posting the record" });
  }
});
// Function to get structure for all tables
const getTableStructures = async () => {
  const dbStructure = {};
  try {
    const query = `
      SELECT 
        table_name,
        column_name,
        data_type
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, ordinal_position;
    `;

    const result = await con.query(query);
    result.rows.forEach((row) => {
      if (!dbStructure[row.table_name]) {
        dbStructure[row.table_name] = [];
      }
      dbStructure[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
      });
    });

    return dbStructure;
  } catch (error) {
    console.error("Error fetching table structures:", error);
    throw error;
  }
};

// Function to let the agent decide which table to use
const determineRelevantTable = async (prompt, dbStructure) => {
  const schemaDescription = Object.entries(dbStructure)
    .map(([tableName, columns]) => {
      const columnDesc = columns
        .map((col) => `${col.column}: ${col.type}`)
        .join(", ");
      return `Table ${tableName} has columns: ${columnDesc}`;
    })
    .join("\n");

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a database expert. Given a user whose userid is ${userid} and user's question and database schema, return only the single most relevant table name that would be needed to answer the question. Return just the table name as a string without any additional text or formatting.`,
      },
      {
        role: "user",
        content: `Schema:\n${schemaDescription}\n\nQuestion: ${prompt}\n\nReturn only the most relevant table name.`,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.1,
    max_tokens: 50,
  });

  return completion.choices[0]?.message?.content.trim();
};

// Function to extract all content from the selected table
const extractTableContent = async (tableName) => {
  try {
    // Get all data from the table
    const query = `SELECT * FROM ${tableName};`;
    const result = await con.query(query);

    // Convert the table content to a formatted string
    const contentString = result.rows
      .map((row) => JSON.stringify(row))
      .join("\n");

    return {
      data: result.rows,
      contentString: contentString,
    };
  } catch (error) {
    console.error(`Error extracting content from ${tableName}:`, error);
    throw error;
  }
};

// Function to generate SQL query with table content context
const generateSQLQuery = async (
  prompt,
  dbStructure,
  tableName,
  tableContent
) => {
  // Create context with schema and table content
  const tableSchema = dbStructure[tableName];
  const schemaContext = `Table ${tableName}:\nColumns: ${tableSchema
    .map((col) => `${col.column}: ${col.type}`)
    .join(", ")}\n\nTable content sample:\n${tableContent.contentString.slice(
    0,
    1000
  )}...`; // Limiting content sample to avoid token limits

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
       You are an SQL expert who can only READ the database. Do not generate any queries related to INSERT, UPDATE, DELETE or other modification queries. You have access to the following database context:\n${schemaContext}\n and userid is ${userid} and emailid is ${emailid}.
        Do not entertain queries that request information about other users.
        Return only the SQL query without any explanation.
        Generate a SQL query that answers the user's question using the provided table.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.2,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content.trim();
};

// Function to interpret query results
const interpretResults = async (
  prompt,
  queryResults,
  query,
  tableName,
  tableContent
) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an expert at interpreting database results. Provide a clear, natural language answer to the user's question. Include relevant context from the data but be concise.`,
      },
      {
        role: "user",
        content: `Original question: ${prompt}\n
                 Query executed: ${query}\n
                 Table used: ${tableName}\n
                 Results: ${JSON.stringify(queryResults)}\n
                 Please provide a clear answer to the original question based on these results.`,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.7,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content;
};

// AI Inference API endpoint
app.post("/api/processPrompt", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Step 1: Get database schema
    const dbStructure = await getTableStructures();

    // Step 2: Determine the relevant table
    const relevantTable = await determineRelevantTable(prompt, dbStructure);
    //  console.log("reached here");
    // Step 3: Extract content from the relevant table
    const tableContent = await extractTableContent(relevantTable);

    // Step 4: Generate SQL query with context
    const sqlQuery = await generateSQLQuery(
      prompt,
      dbStructure,
      relevantTable,
      tableContent
    );
    // console.log("Generated SQL Query:", sqlQuery);

    // Step 5: Execute the query
    const sqlQueryTrim = sqlQuery.replace(/^```|```$/g, "").trim();

    const queryResult = await con.query(sqlQueryTrim);

    // Step 6: Interpret results with full context
    const interpretation = await interpretResults(
      prompt,
      queryResult.rows,
      sqlQuery,
      relevantTable,
      tableContent
    );
    //console.log(interpretation);
    // Send response
    res.json({
      response: interpretation,
      query: sqlQuery,
      relevantTable: relevantTable,
      rawResults: queryResult.rows,
    });
  } catch (err) {
    console.error("Error processing prompt:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//api call to get driver cost
app.get("/api/driver_cost", async (req, res) => {
  try {
    // console.log("here");
    const query = `SELECT d.name ,(t.distancetravelled*d.earningperkm) AS total_earning
FROM drivers d
JOIN trips t ON d.driverid=t.driverid
WHERE t.userid=$1
                     `;

    const result = await con.query(query, [userid]);
    //  console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error({ error: "Error getting data record" });
    res.status(400).json({ error: "Error getting data record" });
  }
});

//api to get month revenue
app.get("/api/month_revenue", async (req, res) => {
  try {
    const query1 = `
      WITH months AS (
          -- List all 12 months
          SELECT generate_series(1, 12) AS month_number
      ),
      revenue_data AS (
          SELECT 
              EXTRACT(MONTH FROM t.StartTime) AS month_number,  -- Extract the month number from StartTime
              SUM(t.revenue) AS total_revenue  -- Directly sum revenue from Trips table
          FROM 
              Trips t
          WHERE 
              t.TripStatus = 'Scheduled'  -- Only consider scheduled trips
              AND t.userid = $1  -- Filter by specific user ID
          GROUP BY 
              EXTRACT(MONTH FROM t.StartTime)  -- Group by month number
      )
      SELECT 
          TO_CHAR(TO_DATE(m.month_number::TEXT, 'MM'), 'FMMonth') AS month_name,  -- Converts month number to month name
          COALESCE(r.total_revenue, 0) AS total_revenue  -- If no revenue, show 0
      FROM 
          months m
      LEFT JOIN 
          revenue_data r ON m.month_number = r.month_number  -- Left join to include all months, even with 0 revenue
      ORDER BY 
          m.month_number;  -- Sort by month number
    `;

    const result = await con.query(query1, [userid]);
    res.json(result.rows);
  } catch (error) {
    console.error({ error: "Error in getting record", details: error.message });
    res.status(500).json({ error: "Error in getting record" });
  }
});
//api to get month cost
app.get("/api/month_cost", async (req, res) => {
  try {
    const petrolprice = 102;
    const dieselprice = 75;

    const query1 = `
    WITH months AS (
        -- List all 12 months
        SELECT generate_series(1, 12) AS month_number
    ),
    maintenance_data AS (
        SELECT 
            EXTRACT(MONTH FROM m.maintenancedate) AS month_number,
            CAST(SUM(m.cost) AS INTEGER) AS total_maintenance_cost  
        FROM 
            MaintenanceRecords m
        WHERE 
            m.userid = $1  -- Use $1 for user ID
        GROUP BY 
            EXTRACT(MONTH FROM m.maintenancedate)  
    ),
    trip_fuel_cost AS (
        SELECT
            EXTRACT(MONTH FROM t.starttime) AS month_number,
            CAST(SUM(
                (t.distancetravelled / NULLIF(v.idealmileage, 1)) * 
                CASE 
                    WHEN v.fueltype = 'Petrol' THEN $2  -- Use $2 for petrol price
                    WHEN v.fueltype = 'Diesel' THEN $3  -- Use $3 for diesel price
                    ELSE 0
                END
            ) AS INTEGER) AS total_fuel_cost  
        FROM 
            Trips t
        JOIN 
            Vehicles v ON t.vehicleid = v.vehicleid
        WHERE 
            t.userid = $1  -- Use $1 for user ID
        GROUP BY 
            EXTRACT(MONTH FROM t.starttime)  
    ),
    driver_earnings AS (
        SELECT
            EXTRACT(MONTH FROM t.starttime) AS month_number,
            CAST(SUM(t.distancetravelled * d.earningperkm) AS INTEGER) AS total_driver_earnings  
        FROM 
            Trips t
        JOIN 
            Drivers d ON t.driverid = d.driverid
        WHERE 
            t.userid = $1  -- Use $1 for user ID
        GROUP BY 
            EXTRACT(MONTH FROM t.starttime)  
    )
    SELECT 
        TO_CHAR(TO_DATE(m.month_number::TEXT, 'MM'), 'FMMonth') AS month_name,  
        CAST(
            COALESCE(maintenance_data.total_maintenance_cost, 0) + 
            COALESCE(trip_fuel_cost.total_fuel_cost, 0) + 
            COALESCE(driver_earnings.total_driver_earnings, 0) 
            AS INTEGER
        ) AS total_cost  
    FROM 
        months m
    LEFT JOIN 
        maintenance_data ON m.month_number = maintenance_data.month_number  
    LEFT JOIN 
        trip_fuel_cost ON m.month_number = trip_fuel_cost.month_number  
    LEFT JOIN 
        driver_earnings ON m.month_number = driver_earnings.month_number  
    ORDER BY 
        m.month_number;  
    `;

    const result = await con.query(query1, [userid, petrolprice, dieselprice]);
    res.json(result.rows); // Return the result in the same month-wise format
  } catch (error) {
    console.error({ error: "Error in getting month-wise cost" });
    res.status(500).json({ error: "Error in getting month-wise cost" });
  }
});
//api call to get maintenance cost of vehicles
app.get("/api/vehicle_maintenance_cost", async (req, res) => {
  try {
    const query1 = `
     SELECT v.registrationnumber,SUM(m.cost)
FROM maintenancerecords m
JOIN vehicles v ON v.vehicleid=m.vehicleid
where v.userid=$1
GROUP BY v.registrationnumber
    `;

    const result = await con.query(query1, [userid]);
    res.json(result.rows); // Return the result in the same month-wise format
  } catch (error) {
    console.error({ error: "Error in getting month-wise cost" });
    res.status(500).json({ error: "Error in getting month-wise cost" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
