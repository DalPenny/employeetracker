DROP DATABASE IF EXISTS empl_tracker_db;
CREATE DATABASE empl_tracker_db;

USE empl_tracker_db;

CREATE TABLE empl_dept (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department VARCHAR(30) NOT NULL
);

CREATE TABLE empl_role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary INT (10) NOT NULL,
  department_id INT,
  FOREIGN KEY (department_id)
  REFERENCES empl_dept(id)
  ON DELETE SET NULL
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT,
  FOREIGN KEY (role_id)
  REFERENCES empl_role(id)
  ON DELETE SET NULL,
  FOREIGN KEY (manager_id)
  REFERENCES employee(id)
  ON DELETE SET NULL
);