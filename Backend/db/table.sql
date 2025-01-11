-- 1. Users Table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL
);

-- 2. Vehicles Table
CREATE TABLE Vehicles (
    VehicleID SERIAL PRIMARY KEY,
    UserID INT NOT NULL, -- Foreign key to Users table
    RegistrationNumber VARCHAR(20) UNIQUE NOT NULL,
    Make VARCHAR(50) NOT NULL, -- e.g., Toyota
    Model VARCHAR(50) NOT NULL, -- e.g., Camry
    Year INT NOT NULL, -- Vehicle's manufacturing year
    gps_location POINT,
    FuelType VARCHAR(10) CHECK (FuelType IN ('Petrol', 'Diesel', 'Electric', 'Hybrid')) NOT NULL,
    OdometerReading INT DEFAULT 0,
    Status VARCHAR(20) CHECK (Status IN ('Active', 'Inactive', 'Under Maintenance')) DEFAULT 'Active',
    Mileage INT DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- 3. Drivers Table
CREATE TABLE Drivers (
    DriverID SERIAL PRIMARY KEY,
    UserID INT NOT NULL, -- Foreign key to Users table
    Name VARCHAR(100) NOT NULL,
    LicenseNumber VARCHAR(50) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    AssignedVehicleID INT DEFAULT NULL, -- Nullable foreign key to Vehicles table
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (AssignedVehicleID) REFERENCES Vehicles(VehicleID)
);

-- 4. Trips Table
CREATE TABLE Trips (
    TripID SERIAL PRIMARY KEY,
    VehicleID INT NOT NULL, -- Foreign key to Vehicles table
    DriverID INT NOT NULL, -- Foreign key to Drivers table
    StartLocation VARCHAR(255) NOT NULL,
    EndLocation VARCHAR(255) NOT NULL,
    StartTime TIMESTAMP NOT NULL,
    EndTime TIMESTAMP,
    DistanceTravelled INT DEFAULT 0,
    TripStatus VARCHAR(20) CHECK (TripStatus IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID),
    FOREIGN KEY (DriverID) REFERENCES Drivers(DriverID)
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
    UserID INT NOT NULL, -- Foreign key to Users table
    Message TEXT NOT NULL,
    AlertType VARCHAR(20) CHECK (AlertType IN ('Maintenance', 'Trip', 'General')) NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
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