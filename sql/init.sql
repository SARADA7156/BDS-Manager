USE BDS_Manager;

CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    permission ENUM('operator', 'member') NOT NULL
) CHARSET = utf8mb4;

FLUSH PRIVILEGES;

INSERT INTO users (name, email, permission) VALUES ('shou', 'tsskyepro@gmail.com', 'operator');