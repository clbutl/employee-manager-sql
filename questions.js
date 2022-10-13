
const questions = [
  starterQ = [
    {
      type: 'list',
      name: 'main',
      message: 'Please select an option presented below.',
      choices: [
        'View all departments',
        'Add a departments',
        'View all roles',
        'Add a role',
        'View all employees',
        'Add an employee',
        'Update an employee',
        "Update an employee's manager",
        "View employees by manager",
        "View employees by department",
        'Exit Tool'
      ]
    }
  ],

  addDepartmentQ = [
    {
      type: 'text',
      name: 'newDepartment',
      message: 'Please type the name of the new department that you would like to add.'
    }
  ],

  addRoleQ = [
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
      type: 'text',
      name: 'newRoleDepartment',
      message: "Please enter the new role's department (id or name)"
    },
  ],

  addEmployeeQ = [
    {
      type: 'text',
      name: 'newEmployeeRole',
      message: "Please enter the employee's role"
    },
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
      type: 'text',
      name: 'newEmployeeManager',
      message: "Please enter the employee's Manager"
    },
  ]
]

module.export = questions




