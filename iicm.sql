-- USE inter_iit_cult;

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
    rollNo VARCHAR(50),
    image VARCHAR(255)
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
    day_27 INT DEFAULT 0,
    day_28 INT DEFAULT 0,
    day_29 INT DEFAULT 0,
    day_30 INT DEFAULT 0
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