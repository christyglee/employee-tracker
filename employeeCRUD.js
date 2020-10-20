//Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require("console.table");

// Connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "employee_tracker_DB"
});

// Connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
  });

  function start() {
    inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Employees By Department",
          "View All Employees By Manager",
          "Add Employee",
          "Remove Employee",
          "Update Employee Role",
          "Update Employee Manager"
        ]
      })
      .then(function(answer) {
        switch (answer.action) {
          case "View All Employees":
            viewAllEmployees();
          break;

          case "View All Employees By Department":
            viewByDepartment();
          break;

          case "View All Employees By Manager":
            viewByManager();
          break;

          case "Add Employee":
            addEmployee();
          break;

          case "Remove Employee":
            removeEmployee();
          break;

          case "Update Employee Role":
            updateEmployeeRole();
          break;

          case "Update Employee Manager":
            updateManager();
          break;
        }
      })

    }
