DROP DATABASE IF EXISTS waitlist;
DROP USER IF EXISTS waitlist_app@localhost;

-- Create Waitlist database and user. Ensure Unicode is fully supported.
CREATE DATABASE waitlist CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER waitlist_app@localhost IDENTIFIED WITH mysql_native_password BY "Hbnewport7!@Hbnewport7";
GRANT ALL PRIVILEGES ON waitlist.* TO waitlist_app@localhost;

USE waitlist;
DROP TABLE IF EXISTS waitlist;
CREATE TABLE waitlist (
	id SERIAL PRIMARY KEY,
    cust_LName varchar(255),
    cust_FName varchar(255),
    phone_num varchar(15),
    party_size int,
    position_inLine int,
    checkIn_date date,
    checkIn_time time,
    is_deleted boolean
);
