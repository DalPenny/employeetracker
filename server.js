const express = require('express');
const inquirer = require('inquirer');
const path = require('path');
// const fs = require('fs');

//import and require mysql
const mysql = require('mysql2');

//importing table formatting function to format the table data
const cTable = require('console.table');
// const { resolveCname } = require('dns');

//when promote to heroku, this env variable is used, if no env, 3001 is default 
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//connect to mysql database
const db = mysql.createConnection(
    {
        host: 'localhost',
        //MYSQL username
        user: 'root',
        password: '',
        //connecting to employee tracker db
        database: 'empl_tracker_db'
    },
    console.log(`Connected to employee tracker database`)
);

// initialize and display questions
function init() {
    displayQuestions();
}

// Create an array of questions for user input
function displayQuestions() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'actnToPerform',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department'],
            validate: actnToPerform => {
                if (actnToPerform) {
                    return true;
                } else {
                    console.log('Error: Please select a license for this application ');
                    return false;
                }
            }
        }
    ])

        .then(function ({ actnToPerform }) {
            if (actnToPerform === 'View All Employees') {
                ViewEmpl();
            } else if (actnToPerform === 'View All Roles') {
                ViewRole();
            } else if (actnToPerform === 'View All Departments') {
                    ViewDept();
            } else {
                console.log("please select only View all tables for now until rest is fixed");
                displayQuestions();
            }
                

        }) 

};

//create a function to view Employee table data

function ViewEmpl() {
    //two arguments, string and a function
    db.query("SELECT employee.id, employee.first_name, employee.last_name, empl_role.title, empl_role.salary, empl_dept.department, CONCAT(MGR.first_name, ' ', MGR.last_name) as manager FROM employee LEFT JOIN empl_role ON employee.role_id = empl_role.id LEFT JOIN empl_dept ON empl_dept.id = empl_role.department_id LEFT JOIN employee AS MGR ON MGR.id = employee.manager_id", function (err, results) {
        if (err) {
            throw err
        }
        const table = cTable.getTable(results);
        console.log(table);
        displayQuestions(); //after displaying, go back to questions
    });
};

//create a constructor function to view Role table data

function ViewRole() {
    //two arguments, string and a function
    db.query("SELECT empl_role.id, empl_role.title, empl_role.salary,empl_dept.department FROM empl_role LEFT JOIN empl_dept ON empl_dept.id = empl_role.department_id", function (err, results) {
        if (err) {
            throw err
        }
        const table = cTable.getTable(results);
        console.log(table);
        displayQuestions(); //after displaying, go back to questions
    });
};

//create a function to view Department table data

function ViewDept() {
    //two arguments, string and a function
    db.query("SELECT empl_dept.id, empl_dept.department FROM empl_dept;", function (err, results) {
        if (err) {
            throw err
        }
        const table = cTable.getTable(results);
        console.log(table);
        displayQuestions(); //after displaying, go back to questions
    });
};


//initialize
init();

//default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

//listening for port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});