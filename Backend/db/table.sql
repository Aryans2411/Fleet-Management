-- 1. Users Table
CREATE TABLE Users (
    userid VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordhash VARCHAR(255) NOT NULL,
    phonenumber VARCHAR(15) NOT NULL
);

-- 2. Vehicles Table
CREATE TABLE Vehicles (
    vehicleid SERIAL PRIMARY KEY,
    userid VARCHAR(100) NOT NULL, -- Foreign key to Users table
    registrationnumber VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL, -- e.g., Toyota
    latitude NUMERIC(10, 6), -- Assuming precision for latitude
    longitude NUMERIC(10, 6), -- Assuming precision for longitude
    fueltype VARCHAR(10) CHECK (fueltype IN ('Petrol', 'Diesel', 'Electric', 'Hybrid')) NOT NULL,
    idealmileage NUMERIC(15,2),
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'Under Maintenance')) DEFAULT 'Active',
    FOREIGN KEY (userid) REFERENCES Users(userid)
);

-- 3. Drivers Table
CREATE TABLE Drivers (
    driverid SERIAL PRIMARY KEY,
    userid INT NOT NULL, -- Foreign key to Users table
    name VARCHAR(100) NOT NULL,
    earningperkm NUMERIC(15,2),
    LicenseNumber VARCHAR(50) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    AssignedVehicleID INT DEFAULT NULL, -- Nullable foreign key to Vehicles table
    FOREIGN KEY (userid) REFERENCES Users(userid),
    FOREIGN KEY (AssignedVehicleID) REFERENCES Vehicles(vehicleid)
);

-- 4. Trips Table
CREATE TABLE Trips (
    TripID SERIAL PRIMARY KEY,
    userid VARCHAR NOT NULL,
    VehicleID INT NOT NULL, -- Foreign key to Vehicles table
    driverid INT NOT NULL, -- Foreign key to Drivers table
    StartLocation VARCHAR(255) NOT NULL,
    EndLocation VARCHAR(255) NOT NULL,
    StartTime TIMESTAMP NOT NULL,
    EndTime TIMESTAMP,
    DistanceTravelled INT DEFAULT 0,
    TripStatus VARCHAR(20) CHECK (TripStatus IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID),
    FOREIGN KEY (driverid) REFERENCES Drivers(driverid),
    FOREIGN KEY (userid) REFERENCES Users(userid)
);

-- 5. MaintenanceRecords Table
CREATE TABLE MaintenanceRecords (
    RecordID SERIAL PRIMARY KEY,
    VehicleID INT NOT NULL, -- Foreign key to Vehicles table
    MaintenanceType VARCHAR(100) NOT NULL, -- e.g., Oil Change, Tire Replacement
    Cost NUMERIC(10,2) NOT NULL,
    MaintenanceDate DATE NOT NULL,
    NextDueDate DATE,
    Remarks TEXT,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID)
);

-- 6. Alerts/Notifications Table
CREATE TABLE Alerts (
    AlertID SERIAL PRIMARY KEY,
    userid INT NOT NULL, -- Foreign key to Users table
    Message TEXT NOT NULL,
    AlertType VARCHAR(20) CHECK (AlertType IN ('Maintenance', 'Trip', 'General')) NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES Users(userid)
);

-- 7. Fuel Records Table
CREATE TABLE FuelRecords (
    FuelID SERIAL PRIMARY KEY,
    VehicleID INT NOT NULL, -- Foreign key to Vehicles table
    FuelAdded NUMERIC(10,2) NOT NULL, -- Fuel in liters/gallons
    Cost NUMERIC(10,2) NOT NULL,
    DateAdded DATE NOT NULL,
    Remarks TEXT,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID)
);