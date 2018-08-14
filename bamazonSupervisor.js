/* 
***********************************************
*Author: Baruch Flores                        *
*Homework 12: Bamazon                         *
*UCB Extension - Full-Stack Bootcamp          *
*August 2018                                  *
*********************************************** 
*/


const mysql = require("mysql");
const cTable = require('console.table');
const inquirer = require(`inquirer`);
const divider = `\n------------------------------------------------------------\n`;


let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon",
});


const showWelcome = () => {
    console.log(`${divider}\t\tBAMAZON SUPER - Supervisor View${divider}`);
}

const showSalesDpt = () => {
    let query = `SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.product_sales, products.product_sales - departments.over_head_costs AS 'total_profit'
                FROM departments
                LEFT JOIN products ON departments.department_name = products.department_name`;
    connection.query(query, (err, data) => {
        if (err) throw err;
        console.table(data);
        console.log(divider);
        showMenu();
    });
}

const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Department Name: ",
            name: "name",
        },
        {
            type: "input",
            message: "Overhead Costs: \$",
            name: "costs",
            validate: (ui) => {
                return isNaN(ui) ? "Error: Overhead costs must be a number" : true;
            }
        }
    ]).then(input => {
        createDepartment(input);
    });
}


const createDepartment = (input) => {
    let query = `INSERT INTO departments (department_name, over_head_costs)
    VALUES (?,?)`;
    connection.query(query, [
        input.name,
        input.costs,
    ], (err, data) => {
        if (err) throw err;
        console.log(`\t Department Added!`);
        console.log(divider);
        showMenu();
    });
}


const showMenu = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "Select an option: ",
            name: "option",
            choices: ["View Product Sales by Department", "Create New Department", "Exit"]
        }
    ]).then(input => {

        switch (input.option) {
            case "View Product Sales by Department":
                showSalesDpt();
                break;
            case "Create New Department":
                addDepartment();
                break;
            case "Exit":
                connection.end();
                console.log("Good Bye!\n");
                break;
        }
    });
}




connection.connect(error => {
    if (error) throw error;
    showWelcome();
    showMenu();
});

