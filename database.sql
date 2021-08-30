CREATE DATABASE musicoterapia_db;

CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	name VARCHAR(50)
);

CREATE TABLE full_user_records(
	record_id SERIAL PRIMARY KEY,
	video VARCHAR(50),
	music VARCHAR(50),
	playtime INT
);

CREATE TABLE users_records(
    id SERIAL PRIMARY KEY,
    user_id INT,
	record_id INT
);
