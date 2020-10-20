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
connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
  });

  //starter prompt
  function start() {
    inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Employees By Department",
          "View All Employees By Role",
          "Add Employee",
          "Add Role",
          "Add Department",
          "Update Employee Role",
          "Quit"
        ]
      })
      //switch cases
      .then((answer) => {
        switch (answer.action) {
          case "View All Employees":
            viewAllEmployees();
          break;

          case "View All Employees By Department":
            viewByDepartment();
          break;

          case "View All Employees By Role":
            viewRole();
          break;

          case "Add Employee":
            addEmployee();
          break;

          case "Add Role":
            addRole();
          break;

          case "Add Department":
            addDepartment();
          break;

          case "Update Employee Role":
            updateEmployeeRole();
          break;

          case "Quit":
            quit();
          break;


          //Bonus:

          // case "View All Employees By Manager":
          //   viewByManager();
          // break;

          // case "Remove Employee":
          //   removeEmployee();
          // break;

          // case "Update Employee Manager":
          //   updateManager();
          // break;

        }
      })
    }

  //view all employees function
  function viewAllEmployees(){

    let query = "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC";
    connection.query(query, function(err, res) {
      if (err) throw err;
      console.table(res);
      //back to start function
      start();
    });
  }

  //view all employees by department
  function viewByDepartment() {
    let query = "SELECT d.id, d.name FROM employees e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id GROUP BY d.id, d.name";
    connection.query(query, function(err, res) {
      if (err) throw err
      // console.table(res)
      // start();
    });

    connection.query(query, function (err, res) {
      if (err) throw err;
  
      let departmentChoice = res.map(data => ({
        value: data.id, name: data.name
      }));
  
      console.table(res);
      // console.log("Departments!\n");
  
      departmentPrompt(departmentChoice);
    });
  }

  function departmentPrompt(departmentChoices) {

    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          message: "Which department would you choose?",
          choices: departmentChoices
        }
      ])
      .then(function (answer) {
        console.log("answer ", answer.department);
  
        var query = "SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department FROM employees e JOIN role r ON e.role_id = r.id JOIN department d ON d.id = r.department_id WHERE d.id = ?"
        
        connection.query(query, answer.department, function (err, res) {
          if (err) throw err;
  
          console.table("response ", res);
          console.log(res.affectedRows + "Employees are viewed!\n");
  
          start();
        });
      });
  }
  

  



  