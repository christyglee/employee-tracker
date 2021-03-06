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
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Employees By Department",
          "View All Employee Roles",
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

          case "View All Employee Roles":
            viewAllRoles();
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
            connection.end();
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
  
        let query = "SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department FROM employees e JOIN role r ON e.role_id = r.id JOIN department d ON d.id = r.department_id WHERE d.id = ?"
        
        connection.query(query, answer.department, function (err, res) {
          if (err) throw err;
  
          console.table("response ", res);
          // console.log(res.affectedRows + "Employees are viewed!\n");
  
          start();
        });
      });
  }
 
   //view all roles
   function viewAllRoles() {
     let query = "SELECT employees.first_name, employees.last_name, role.title AS Role FROM employees JOIN role ON employees.role_id = role.id"
    connection.query(query, function(err, res) {
    if (err) throw err
    console.table(res)
    start();
    });
  }

  function addEmployee() {
    let query = "SELECT role.id, role.title, role.salary FROM role"

  connection.query(query, function (err, res) {
    if (err) throw err;

    let roleChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`
    }));

    console.table(res);
    // console.log("Insert!");

    addEmployeePrompt(roleChoices);
  });
  }

  function addEmployeePrompt(roleChoices) {

    inquirer
      .prompt([
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?"
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?"
        },
        {
          type: "list",
          name: "roleId",
          message: "What is the employee's role?",
          choices: roleChoices
        }
      ])
      .then(function (answer) {
      console.log(answer);
      // addRolePrompt();

      let query = "INSERT INTO employees SET ?"
      // insert a new item into the db
      connection.query(query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Successfully added new employee!\n");

          start();
        });
    });
}

  function addRole() {

    let query = "SELECT d.id, d.name, r.salary AS budget FROM employees e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id GROUP BY d.id, d.name";

    connection.query(query, function (err, res) {
      if (err) throw err;
      // (callbackfn: (value: T, index: number, array: readonly T[]) => U, thisArg?: any)
    let departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));

    console.table(res);
    // console.log("Role array!");

    addRolePrompt(departmentChoices);
  });
    
  }

  function addRolePrompt(departmentChoices) {

    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "What is the title of the role?"
        },
        {
          type: "input",
          name: "roleSalary",
          message: "Enter the salary for the role."
        },
        {
          type: "list",
          name: "departmentId",
          message: "Enter the department of the role.",
          choices: departmentChoices
        }
      ])
      .then(function (answer) {
  
        let query = "INSERT INTO role SET ?"
  
        connection.query(query, {
          title: answer.roleTitle,
          salary: answer.roleSalary,
          department_id: answer.departmentId
        },
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log("Successfully added new Role!\n");
  
            start();
          });
  
      });
  }

  function addDepartment() {
    
    inquirer
        .prompt({
            type: "input",
            name: "newDepartment",
            message: "What Department would you like to add?"
        })
        .then(function (answer) {

            let query = "INSERT INTO department SET ?"

            connection.query(query, [{ name: answer.newDepartment }], function (err) {
                if (err) throw err;
                console.table("Successfully created a Department!");
                // answer.newDepartment.push(departmentList);
                start();
            });

        });
        // departmentList();
  }

  // function departmentList() {
  //   let query = "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC"
  
  //   connection.query(query, function (err, res) {
  //     if (err) throw err;
  
  //     let departments = res.map(({ id, first_name, last_name }) => ({
  //       value: id, name: `${first_name} ${last_name}`      
  //     }));
  
  //     console.table(res);
  //     console.log("Department List To Updated!\n")
  
  //     departmentList.push(departments);

  //   });
  // }

  // Update employee role

  function updateEmployeeRole() {
    employeeRoster();
  }
      
  function employeeRoster() {
    console.log("Updating Employee");
  
    let query = "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC"
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      let employeeList = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${first_name} ${last_name}`      
      }));
  
      console.table(res);
      console.log("Employee List To Update!\n")
  
      roleList(employeeList);
    });
  }

  function roleList(employeeList) {
    console.log("Updating role");

    let query = "SELECT r.id, r.title, r.salary FROM role r";
    
    let roleList;
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
      roleList = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`      
      }));
  
      console.table(res);
      // console.log("Role list to Update!\n")
  
      employeeRolePrompt(employeeList, roleList);
    });
  }

  function employeeRolePrompt(employeeList, roleList) {

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee would you like to update?",
          choices: employeeList
        },
        {
          type: "list",
          name: "roleId",
          message: "Which role would you like to update?",
          choices: roleList
        },
      ])
      .then(function (answer) {
  
        let query = "UPDATE employees SET role_id = ? WHERE id = ?"

        connection.query(query,[answer.roleId, answer.employeeId],
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log("Successfully updated Employee Role!");
  
            start();
          });

      });
  }
  
  



  

  



  