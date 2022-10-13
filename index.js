const inquirer = require('inquirer');
const mysql = require('mysql2');
const logo = require("asciiart-logo");
const cTable = require('console.table');
const fs = require('fs');
const questions = require('./questions');
const { baremetalsolution } = require('googleapis/build/src/apis/baremetalsolution');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee_tracker'
  },
  console.log(`Connected to the employee_tracker database.`)
);

function init() {
  const logoText = logo({ name: "Employee Manager" }).render();
  console.log(logoText)
  mainQuestions()
}

const mainQuestions = async () => {
  const answers = await inquirer.prompt(starterQ)
  const userDecisions = async (answers) => {
    switch (answers.main){
      case 'View all departments':
        viewDepartments()
        break;
      case 'View all roles':
        viewRoles()
        break;
      case 'View all employees':
        viewEmployees()
        break;
      case 'Add a departments':
        addDepartments()
        break;
      case 'Add a role':
        addRoles()
        break;
      case 'Add an employee': 
        addEmployees()
        break;
      case 'Update an employee':
        updateEmployees()
        break;
      case "Update an employee's manager":
        updateManager()
        break;
      case "View employees by manager":
        viewByManager()
        break;
      case "View employees by department":
        viewByDepartment()
        break;
      default:
        console.log('Thank you for using our app!')
        break;
    }
  }

  userDecisions(answers)
}

// Views all Departments
const viewDepartments = () => {
  db.query('SELECT department.id, department.name FROM department', (err, result) => {
    if (err) {
      console.log(err)
      mainQuestions()
    }
    console.table(result)
    mainQuestions()
  });
};

// Views all Roles
const viewRoles = () => {
  const sql = "SELECT roles.title AS job_title, roles.id AS role_id, department.name AS department_name, roles.salary FROM roles JOIN department ON department.id = roles.department_id;"
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err)
      mainQuestions()
    }
    console.table(result)
    mainQuestions()
  });
};

// Views all Employees
const viewEmployees = () => {
  const sql = "SELECT employees.id AS employee_id, employees.first_name, employees.last_name, roles.title, department.name AS department, roles.salary, employees.manager_id FROM employees JOIN roles ON roles.id = employees.role_id JOIN department ON department.id = roles.department_id;"
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err)
      mainQuestions()
    }
    const employees = result.map(({ employee_id, first_name, last_name, title, department, salary, manager_id }) => ({
      employee_id: employee_id, employee_name: `${first_name} ${last_name}`, role_title: title, department: department, salary: salary, manager_id: manager_id
    }))
    console.table(employees)
    mainQuestions()
  });
};

// Adds a New Department
const addDepartments = async () => {
  const answers = await inquirer.prompt(addDepartmentQ)
  const insertDep = async (answers) => {
    console.log('Added new department ' + answers.newDepartment + '!')
    const sql = `INSERT INTO department (name) VALUES (?)`

    db.query(sql, answers.newDepartment, (err, result) => {
      if (err) {
        console.log(err)
        mainQuestions();
      }
    });
  }
  await insertDep(answers)
  viewDepartments()
};

// Adds a New Role
function addRoles() {
  const sql = 'SELECT department.id, department.name FROM department'

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err)
      return;
    }
    runAddRoles(result)
  });

const runAddRoles = async (departments) => {
  const answers = await inquirer.prompt([
    {
      type: 'text',
      name: 'newRoleName',
      message: "Please enter the new role's name"
    },
    {
      type: 'text',
      name: 'newRoleSalary',
      message: "Please enter the new role's salary"
    },
    {
      message: "Which department is this role under?",
      name: 'newRoleDepartment',
      type: 'list',
      choices: departments
    },
  ])
  const organizeAnswers = (answers) => {
    const answerDep = answers.newRoleDepartment
    const sqlDep = 'SELECT department.id, department.name FROM department'

    db.query(sqlDep, (err, result) => {
      if (err) {
        console.log(err)
        return;
      }
      for (let i = 0; i < result.length; i++) {
        if (result[i].name === answerDep) {
          const departmentId = result[i].id
          createRole(String(answers.newRoleName), Number(answers.newRoleSalary), Number(departmentId))
            return;
        }
      }
      console.log('Incorrect department name or id: ' + answerDep)
      mainQuestions()
    });
  }
  organizeAnswers(answers)
}

  function createRole(name, salary, dep) {
    console.log('Added new role: ' + name + '!')
    const params = {
      "title": name,
      "salary": salary,
      "department_id": dep
    }
    const sql = `INSERT INTO roles SET ?`

    db.query(sql, params, (err) => {
      if (err) {
        console.log(err)
      }
      viewRoles()
    })
  }
};


// Adds a New Employee
function addEmployees() {
  db.query('SELECT roles.title, roles.id FROM roles', (err, result) => {
    if (err) {
      console.log(err)
      return;
    }
    const roleChoice = result.map(({ id, title }) => ({
      name: `${title}`, value: id
    }));
    showsEmployees(roleChoice)
  });

  const showsEmployees = (roleChoice) => {
    const sql = 'SELECT employees.first_name, employees.last_name, employees.id FROM employees'

    db.query(sql, (err, result) => {
      if (err) {
        console.log(err)
        return;
      }
      const addResult = { first_name: 'None', last_name: '', id: 0 }
      result.push(addResult)
      const managerChoice = result.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`, value: id
      }));
      runAddEmployees(roleChoice, managerChoice)
    });
  };

const runAddEmployees = async (roleChoice, managerChoice) => {
  const answers = await inquirer.prompt([
    {
      type: 'text',
      name: 'newEmployeeFirst',
      message: "Please enter the new employee's first name"
    },
    {
      type: 'text',
      name: 'newEmployeeLast',
      message: "Please enter the new employee's last name"
    },
    {
      type: 'list',
      name: 'newEmployeeRole',
      message: "Please enter the employee's role",
      choices: roleChoice
    },
    {
      type: 'list',
      name: 'newEmployeeManager',
      message: "Please enter the employee's Manager",
      choices: managerChoice
    }
  ])
  const organizeAnswers = (answers) => {
    const fName = answers.newEmployeeFirst
    const lName = answers.newEmployeeLast
    const role = answers.newEmployeeRole
    const manager = answers.newEmployeeManager

    console.log('Added new employee ' + fName + ' ' + lName + '!')
    const params = {
      "first_name": fName,
      "last_name": lName,
      "role_id": role,
      "manager_id": manager
    }
    const sql = `INSERT INTO employees SET ?`

    db.query(sql, params, (err, result) => {
      if (err) {
        console.log(err)
      }
      viewEmployees()
    })
  }
organizeAnswers(answers)
}
};


// Updates an Employee's Data
function updateEmployees() {
  db.query('SELECT employees.id, employees.first_name, employees.last_name, roles.title FROM employees JOIN roles ON roles.id = employees.role_id', (err, result) => {
    if (err) {console.log(err)};

    const employeeChoice = result.map(({ id, first_name, last_name, title }) => ({
      name: `${first_name} ${last_name} - ${title}`, value: id
    }));

    runUpdateEmployees(employeeChoice)
  })


  const runUpdateEmployees = async (employeeChoice) => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'updateEmployeeId',
        message: "Please select an employee that you want to update.",
        choices: employeeChoice
      },
      {
        type: 'list',
        name: 'updateSelect',
        message: "What would you like to update?",
        choices: [
          "First Name",
          "Last Name",
          "Job Title"
        ]
      },  
    ])
    const organizeAnswers = (answers) => {
      const updateChoice = answers.updateSelect
      const updatedNameQuestion = "Please type in the employee's new " + updateChoice.toLowerCase() + "."
      const updatedChoiceQuestion = "Please select a new " + updateChoice.toLowerCase() + " for the employee."
      const updatedEmpId = answers.updateEmployeeId

      switch (updateChoice){
        case 'First Name':
          secondPromptName(updatedEmpId, updatedNameQuestion, `UPDATE employees SET first_name = ? WHERE id = ${updatedEmpId}`)
          break;
        case 'Last Name':
          secondPromptName(updatedEmpId, updatedNameQuestion, `UPDATE employees SET last_name = ? WHERE id = ${updatedEmpId}`)
          break;
        case 'Job Title':
          rolesPromptQuery(updatedEmpId, updatedChoiceQuestion, 'SELECT * FROM roles;')
          break;
        default:
          console.log(err)
          break;
      }
    }
    organizeAnswers(answers)
  }

    const secondPromptName = async (updatedEmpId, updatedNameQuestion, SQLQuery) => {
      const answers2 = await inquirer.prompt([
        {
          type: 'text',
          name: 'employeeNewName',
          message: updatedNameQuestion
        },
        {
          type: 'list',
          name: 'continueQ',
          message: 'Do you want to update another employee?',
          choices: [
            'Yes',
            'No'
          ]
        }
      ])
      const organizeUpdate = (answers) => {
        db.query(SQLQuery, answers.employeeNewName, (err, result) => {
          if (err) {console.log(err)}
          console.log("Successfully updated employee")
        })
        if (answers.continueQ === 'Yes') {
          updateEmployees()
        } else {
          mainQuestions()
        }
      }
      organizeUpdate(answers2)
    }
    
    const rolesPromptQuery = (updatedEmpId, updatedChoiceQuestion, SQLQuery) => {
      db.query(SQLQuery, (err, result) => {
        if (err) {console.log(err)}
        const resultMap = result.map(({ id, title }) => ({
          name: `${title}`, value: id}));
          secondPromptChoices(updatedEmpId, updatedChoiceQuestion, resultMap, `UPDATE employees SET role_id = ? WHERE id = ${updatedEmpId}`)
      })
    }

    const secondPromptChoices = async (updatedEmpId, updatedChoiceQuestion, resultMap, SQLQuery) => {
      const answers3 = await inquirer.prompt([
        {
          type: 'list',
          name: 'newUpdate',
          message: updatedChoiceQuestion,
          choices: resultMap
        },
        {
          type: 'list',
          name: 'continueQ',
          message: 'Do you want to update another employee?',
          choices: [
            'Yes',
            'No'
          ]
        }
      ])
      const organizeUpdate = (answers) => {
        db.query(SQLQuery, answers.newUpdate, (err) => {
          if (err) {console.log(err)}
          console.log('Successfully updated employee')
        })
        
        if (answers.continueQ === 'Yes') {
          updateEmployees()
        } else {
          mainQuestions()
        }

      }
      organizeUpdate(answers3)
    }
};

// Updates an employee's manager
const updateManager = async () => {
db.query('SELECT employees.id, employees.first_name, employees.last_name FROM employees', (err, result) => {
  if (err) {console.log(err)};
  const employeeList = result.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`, value: id
  }));
  getInputsEmployees(employeeList)
})

const getInputsEmployees = async (employeeList) => {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'employeeChoice',
      message: 'Please select the employee that you want to change the manager for',
      choices: employeeList
    }
  ])
  const organizeAnswers = (answers) => {
    getInputsManagers(employeeList, answers.employeeChoice)
  }
  organizeAnswers(answers)
}

const getInputsManagers = async (employeeList, employeeId) => {
  let managerList = []
  for (let i = 0; i < employeeList.length; i++) {
    if (employeeList[i].value !== employeeId) {
      managerList.push(employeeList[i])
    }};
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'managerChoice',
      message: "Please select the employee's new manager",
      choices: managerList
    }
  ])
  const organizeAnswers = (answers) => {
    updateManager(employeeId, answers.managerChoice)
  }
  organizeAnswers(answers)
}

const updateManager = (employeeId, managerId) => {
  db.query(`UPDATE employees SET manager_id = ? WHERE id = ${employeeId}`, managerId, (err, result) => {
    if (err) {console.log(err)};
    viewEmployees()
  })
}
}

// View employees by their manager
const viewByManager = async () => {
  db.query('SELECT id, first_name, last_name FROM employees', (err, result) => {
    if (err) {console.log(err)}
    const managerList = result.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`, value: id
    }))
    managerChoose(managerList)
  })

  const managerChoose = async (managerList) => {
    const answers = await inquirer.prompt(
      {
        type: 'list',
        name: 'managerChoice',
        message: "Please select a manager/employee",
        choices: managerList
      }
    )
    const organizeAnswers = (answers) => {
      db.query(`SELECT id, first_name, last_name, manager_id FROM employees WHERE manager_id = ?`, answers.managerChoice, (err, result) => {
        if (err) {console.log(err)}
        console.log('EMPLOYEES UNDER SELECTED MANAGER')
        console.log('--------------------------------')
        const employees = result.map(({ id, first_name, last_name }) => ({
          employees: `${first_name} ${last_name}`, employee_id: id
        }))
        console.table(employees)
        mainQuestions()
      })
    }
    organizeAnswers(answers)
  }
}

// View employees by department
const viewByDepartment = () => {
  db.query(`SELECT name, id FROM department`, (err, result) => {
    if (err) {console.log(err)}
    const departments = result.map(({ id, name }) => ({
      name: name, value: id
    }))
    departmentInput(departments)
  })

  const departmentInput = async (departments) => {
    const answers = await inquirer.prompt(
      {
        type: 'list',
        name: 'departmentChoice',
        message: "Please select a department",
        choices: departments
      }
    )
    const organizeAnswers = async (answers) => {
      const departmentValue = answers.departmentChoice
      db.query(`SELECT department_id, id FROM roles`, (err, result) => {
        if (err) {console.log(err)}
        let depRole = []
        for (let i = 0; i < result.length; i++) {
          if (departmentValue === result[i].department_id) {
            depRole.push(result[i].id)
          }}
        db.query(`SELECT role_id, first_name, last_name, id FROM employees`, (err, result) => {
          if (err) {console.log(err)}
          let employees = []
          for (let j = 0; j < result.length; j++) {
            for (let k = 0; k < depRole.length; k++) {
              if (result[j].role_id === depRole[k]) {
                employees.push({name: result[j].first_name + ' ' + result[j].last_name, employee_id: result[j].id, department: departments[departmentValue - 1].name})
              }
            }
          }
          console.log('EMPLOYEES UNDER SELECTED DEPARTMENT')
          console.log('-----------------------------------')
          console.table(employees)
          mainQuestions()
        })
      })
    }
    organizeAnswers(answers)
  }
}

    
init()