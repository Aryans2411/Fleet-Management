import random
from faker import Faker
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Connect to PostgreSQL database
def connect_to_database():
    return psycopg2.connect(
        host="localhost",  # Change to your database host if needed
        user="postgres",   # Change to your database user if needed
        password=os.getenv("POSTGRES_PASS"),  # Load password from .env
        database="fleet",  # Change to your database name if needed
        port=os.getenv("POSTGRES_PORT", 5432)  # Load port from .env, default to 5432
    )

# Generate and insert data into the Users table
def populate_users_table():
    fake = Faker('en_IN')  # Generate Indian-specific data
    connection = connect_to_database()
    cursor = connection.cursor()

    try:
        # Insert dummy data into Users table
        users = []
        for _ in range(100):  # Adjust the number of users as needed
            name = fake.name()
            email = fake.unique.email()
            password_hash = fake.sha256()
            phone_number = fake.phone_number()  # Indian-specific phone numbers

            users.append((name, email, password_hash, phone_number))

        cursor.executemany(
            """
            INSERT INTO Users (Name, Email, PasswordHash, PhoneNumber)
            VALUES (%s, %s, %s, %s)
            """,
            users
        )

        connection.commit()
        print(f"{len(users)} users successfully inserted into the Users table.")

    except Exception as e:
        print(f"Error: {e}")
        connection.rollback()

    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    populate_users_table()
