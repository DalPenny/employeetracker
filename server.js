const express = require('express');
const inquirer = require('inquirer');

//import and require mysql
const mysql = require('mysql2');

//importing table formatting function to format the table data
const cTable = require('console.table');

//when promote to heroku, this env variable is used, if no env, 3001 is default 
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//connect to mysql database
const db = mysql.createConnection(
    {
        host: 'localhost', //MYSQL username
        user: 'root',
        password: '',
        database: 'empl_tracker_db'//connecting to employee tracker db
    },
    console.log(`Connected to employee tracker database`)
);

//define global variables
let newDept = '';
let addRoleTitle = '';
let addRoleSalary;
let addRoleDept = '';
let deptID;
let deptArr = [];
let titleArr = [];
let mgrArr = [];
let titleID;
let emplArr = [];


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
            } else if (actnToPerform === 'Add Department') {
                getDeptName();
            } else if (actnToPerform === 'Add Role') {
                getRoleInfo();
            } else if (actnToPerform === 'Add Employee') {
                getEmployeeInfo();


            } else {
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

//function to view Role table data

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

//function to view Department table data

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

//display questions to get dept name
function getDeptName() {
    inquirer.prompt([{
        type: 'input',
        name: 'deptName',       // To get Department Name
        message: 'Please enter a department name: ',
        validate: deptInput => {
            // console.log(deptInput);
            newDept = deptInput;
            if (deptInput) {
                console.log(`  newDept : ${newDept}`);
                AddDept();
                return true;
            } else {
                console.log("Error: Please enter a department name:");
                return false;
            }
        }

    }
    ])

}

//add a new dept
function AddDept() {

    db.query(`INSERT INTO empl_dept (department) VALUES ("${newDept}")`, function (err, results) {
        if (err) {
            throw err
        }
        const table = cTable.getTable(results);
        console.log(table);
        console.log(`Department "${newDept}" is Successfully added!`);
        displayQuestions(); //after displaying, go back to questions
    });
};

// Display Questions to Get Role Info to Add
function getRoleInfo() {
    inquirer.prompt([{
        type: 'input',
        name: 'Role_Title',       // To get Department Name
        message: 'Please enter a Role Title : ',
        validate: roleInput => {

            if (roleInput) {

                return true;
            } else {
                console.log("Error: Please enter a department name:");
                return false;
            }
        }
    },
    {
        // type: 'number',
        type: 'input',
        name: 'Salary',       // To get Salary
        message: 'Please enter the Salary : ',
        validate: roleInput => {

            if (roleInput) {

                return true;
            } else {
                console.log("Error: Please enter a salary:");
                return false;
            }
        }
    },
    {
        type: 'list',
        name: 'Role_Dept',       // To get Department Name
        message: 'Please enter the Department Name: ',
        choices: selectDept(),
        validate: roleInput => {
            if (roleInput) {
                return true;
            } else {
                console.log("Error: Please enter a department name:");
                return false;
            }
        }
    },
    ])
        .then((answer) => {

            addRoleTitle = answer.Role_Title;
            addRoleSalary = answer.Salary;
            addRoleDept = answer.Role_Dept;

            console.log("Role Title: " + `${addRoleTitle}`, "Salary: " + `${addRoleSalary}`, "Role Department: " + `${addRoleDept}`);
            selectDeptID(function (result) {
                deptID = result;
                console.log(`"- Gets retuned value for deptID -- " ${deptID}`);
                AddRole();
            });
        })
}

//select Department
function selectDept() {
    db.query("SELECT * FROM empl_dept", function (err, results) {
        if (err) throw err
        for (var i = 0; i < results.length; i++) {
            deptArr.push(results[i].department);
        }
    })
    return deptArr;
};

//get DepartmentID

function selectDeptID(callback) {
    let SdeptID;
    db.query(`SELECT ID FROM empl_dept WHERE department = "${addRoleDept}"`, function (err, results) {
        if (err) {
            throw err
        }
        console.log("display DEPT results id ", results[0].ID);
        SdeptID = results[0].ID;

        console.log(`"display department id in 'SdeptID'  -- "  ${SdeptID}`)
        return callback(SdeptID);
    })
};

//add role to empl_role table
function AddRole() {

    db.query(`INSERT INTO empl_role (title, salary, department_id) VALUES ("${addRoleTitle}", ${addRoleSalary}, ${deptID})`, function (err, results) {
        if (err) {
            throw err
        }
        console.log(`New Role  "${addRoleTitle}" is Successfully added!`);
        displayQuestions(); //after displaying, go back to questions
    });
};

//display questions to get employee info
function getEmployeeInfo() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',       // To get Employee first Name
            message: 'Please enter the Employee First Name : ',
            validate: roleInput => {
                if (roleInput) {
                    return true;
                } else {
                    console.log("Error: Please enter a first name:");
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'last_name',       // To get Employee first Name
            message: 'Please enter the Employee Last Name : ',
            validate: roleInput => {
                if (roleInput) {
                    return true;
                } else {
                    console.log("Error: Please enter a Last name:");
                    return false;
                }
            }
        },
        {
            type: 'list',
            name: 'empl_role',       // To get Department Name
            message: 'Please enter the Role of the employee: ',
            choices: selectTitles(),
            validate: roleInput => {
                if (roleInput) {
                    return true;
                } else {
                    console.log("Error: Please enter the Role of the employee:");
                    return false;
                }
            }
        },
        {
            type: 'list',
            name: 'mgr_name',       // To get Manager Name
            message: 'Please select the Manager Name : ',
            choices: managerNames(),
            validate: roleInput => {
                if (roleInput) {
                    return true;
                } else {
                    console.log("Error: Please select the Manager name:");
                    return false;
                }
            }
        },
    ])
        .then((answer) => {
            addEmplFirstNm = answer.first_name;
            addEmplLastNm = answer.last_name;
            addEmplRole = answer.empl_role;
            addEmplMgr = answer.mgr_name;

            console.log(`New Empl First NM:  + ${addEmplFirstNm}, Last NM:  + ${addEmplLastNm}, Empl Role :  + ${addEmplRole} + Empl Mgr Name:  ${addEmplMgr}`);

            selectRoleID(function (result) {
                titleID = result;
                let mgrNmString = addEmplMgr.split(' ');
                mgrID = mgrNmString[0]; // get Manager id for the selected Manager
                console.log(`checking the values returned on titleID :, ${titleID},  Manager ID: ${mgrID}`);
                AddEmployee();
            });
        })
};

//create a Title List for the questions
function selectTitles() {
    db.query("SELECT title FROM empl_role", function (err, results) {
        if (err) throw err
        for (var i = 0; i < results.length; i++) {
            titleArr.push(results[i].title);
        }
    })
    return titleArr;
};

//create a Manager List for the questions
function managerNames() {
    console.log(" get Mgr NM list")
    db.query("SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL", function (err, results) {
        if (err) throw err
        let mgrFullNM = '';
        for (var i = 0; i < results.length; i++) {
            mgrFullNM = results[i].id + ' ' + results[i].first_name + ' ' + results[i].last_name;
            mgrArr.push(mgrFullNM);
        }
    })
    return mgrArr;
};

//get Role (Title) ID
function selectRoleID(callback) {
    let FntitleID;
    db.query(`SELECT ID FROM empl_role WHERE title = "${addEmplRole}"`, function (err, results) {
        if (err) {
            throw err
        }
        FntitleID = results[0].ID;
        console.log(`"display department id in 'FntitleID'  -- "  ${FntitleID}`)
        return callback(FntitleID);
    })
};

//add a new Employee to the table
function AddEmployee() {

    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${addEmplFirstNm}", "${addEmplLastNm}", ${titleID}, ${mgrID})`, function (err, results) {
        if (err) {
            throw err
        }
        console.log(`New Employee  "${addEmplFirstNm}  ${addEmplLastNm}" is Successfully added!`);
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