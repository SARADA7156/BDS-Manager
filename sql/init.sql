USE BDS_Manager;

CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    permission ENUM('admin', 'operator', 'member') NOT NULL
) CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS login_tokens(
    uuid CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('pending', 'verified', 'expired') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS bds_versions (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    version VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

FLUSH PRIVILEGES;

INSERT INTO users (name, email, permission) VALUES ('admin', 'tsskyepro@gmail.com', 'operator');