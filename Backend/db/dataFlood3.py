import psycopg2
import pandas as pd
from dotenv import load_dotenv
import os

# Database connection
conn = psycopg2.connect(
    host="localhost",  # Change to your database host if needed
    user="postgres",   # Change to your database user if needed
    password=os.getenv("POSTGRES_PASS"),  # Load password from .env
    database="fleet",  # Change to your database name if needed
    port=os.getenv("POSTGRES_PORT", 5432)
)
cursor = conn.cursor()

# Load the CSV file into a DataFrame
csv_file = '/Users/aryansinha/Fleet Management/Fleet-Management/Backend/db/cities_r2.csv'
data = pd.read_csv(csv_file)

# Split 'location' into 'latitude' and 'longitude' (if combined in one column)
if 'location' in data.columns:
    data[['latitude', 'longitude']] = data['location'].str.split(',', expand=True)
    data['latitude'] = data['latitude'].astype(float)
    data['longitude'] = data['longitude'].astype(float)

# Debug: Print the first few rows of the DataFrame
print(data.head())

# Fetch vehicle IDs where latitude and longitude are NULL
cursor.execute("""
    SELECT vehicleid FROM vehicles
    WHERE latitude IS NULL OR longitude IS NULL
    ORDER BY vehicleid
""")
vehicle_ids = cursor.fetchall()

# Ensure the number of rows in CSV matches the number of NULL rows in the database
if len(vehicle_ids) != len(data):
    raise ValueError("Mismatch between number of NULL rows in database and rows in CSV!")

# Iterate through the vehicle IDs and update them with latitude and longitude from the CSV
for i, (vehicle_id,) in enumerate(vehicle_ids):
    cursor.execute("""
        UPDATE vehicles
        SET latitude = %s, longitude = %s
        WHERE vehicleid = %s
    """, (data.loc[i, 'latitude'], data.loc[i, 'longitude'], vehicle_id))

# Commit changes and close the connection
conn.commit()
cursor.close()
conn.close()

print("Database successfully updated!")
