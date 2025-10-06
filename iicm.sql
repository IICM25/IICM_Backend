USE inter_iit_cult;

CREATE TABLE participants (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    eventN VARCHAR(100),
    team VARCHAR(100),
    hall_name INT,
    last_meal DATETIME,
    uniqueCode VARCHAR(8),
    rollNo VARCHAR(50)
);

CREATE TABLE mess_users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    hall INT NOT NULL
);

CREATE TABLE admins (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE hall3 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_6 INT DEFAULT 0,
    day_7 INT DEFAULT 0,
    day_8 INT DEFAULT 0,
    day_9 INT DEFAULT 0,
    day_10 INT DEFAULT 0,
    day_11 INT DEFAULT 0,
    day_12 INT DEFAULT 0,
    day_13 INT DEFAULT 0,
    day_14 INT DEFAULT 0,
    day_15 INT DEFAULT 0,
    day_16 INT DEFAULT 0,
    day_17 INT DEFAULT 0,
    day_18 INT DEFAULT 0,
    day_19 INT DEFAULT 0,
    day_20 INT DEFAULT 0,
    day_21 INT DEFAULT 0,
    day_22 INT DEFAULT 0,
    day_23 INT DEFAULT 0,
    day_24 INT DEFAULT 0,
    day_25 INT DEFAULT 0
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  venue VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
