import random
from faker import Faker
import psycopg2
from dotenv import load_dotenv
import os

# Connect to PostgreSQL database
def connect_to_database():
    return psycopg2.connect(
        host="localhost",  # Change to your database host if needed
        user="postgres",   # Change to your database user if needed
        password=os.getenv("POSTGRES_PASS"),  # Load password from .env
        database="fleet",  # Change to your database name if needed
        port=os.getenv("POSTGRES_PORT", 5432)  # Load port from .env, default to 5432
    )

# Generate and insert data into the Vehicles table
def populate_vehicles_table():
    fake = Faker('en_IN')  # Generate Indian-specific data
    connection = connect_to_database()
    cursor = connection.cursor()

    try:
        # Retrieve valid UserIDs from the Users table
        cursor.execute("SELECT UserID FROM Users")
        valid_user_ids = [row[0] for row in cursor.fetchall()]
        
        if not valid_user_ids:
            print("No users found in the Users table. Cannot populate Vehicles table.")
            return

        # Define sample vehicle makes and models
        vehicle_data = [
            ("Maruti Suzuki", ["Swift", "Baleno", "Dzire", "Alto"]),
            ("Hyundai", ["i20", "Creta", "Venue", "Verna"]),
            ("Tata", ["Nexon", "Punch", "Altroz", "Harrier"]),
            ("Toyota", ["Innova", "Fortuner", "Glanza", "Yaris"]),
            ("Mahindra", ["Thar", "Scorpio", "XUV700", "Bolero"]),
        ]
        
        fuel_types = ["Petrol", "Diesel", "Electric", "Hybrid"]
        statuses = ["Active", "Inactive", "Under Maintenance"]

        # List of state abbreviations in India
        state_abbreviations = [
            "AP", "AR", "AS", "BR", "CH", "CT", "DL", "GA", "GJ", "HR",
            "HP", "JH", "KA", "KL", "MP", "MH", "MN", "ML", "MZ", "NL",
            "OD", "PB", "RJ", "SK", "TN", "TS", "TR", "UP", "UK", "WB"
        ]
        
        # Insert dummy data into Vehicles table
        vehicles = []
        for _ in range(494):  # Adjusted to insert exactly 494 vehicles
            user_id = random.choice(valid_user_ids)
            make, models = random.choice(vehicle_data)
            model = random.choice(models)
            year = random.randint(2005, 2023)  # Random manufacturing year
            state_code = random.choice(state_abbreviations)
            registration_number = f"{state_code}-{random.randint(10, 99)}-{random.randint(1000, 9999)}"
            fuel_type = random.choice(fuel_types)
            odometer_reading = random.randint(1000, 200000)  # Random odometer reading
            status = random.choice(statuses)
            mileage = random.randint(10, 30)  # Random mileage in kmpl

            # Exclude gps_location and don't generate it
            vehicles.append((user_id, registration_number, make, model, year, fuel_type, odometer_reading, status, mileage))

        cursor.executemany(
            """
            INSERT INTO Vehicles (UserID, RegistrationNumber, Make, Model, Year, FuelType, OdometerReading, Status, Mileage)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            vehicles
        )

        connection.commit()
        print(f"{len(vehicles)} vehicles successfully inserted into the Vehicles table.")

    except Exception as e:
        print(f"Error: {e}")
        connection.rollback()

    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    populate_vehicles_table()
