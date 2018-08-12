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
    console.log(`${divider}\t\tBAMAZON SUPER${divider}`);
}

const showProducts = () => {
    let query = "SELECT item_id, product_name, price FROM products";
    connection.query(query, (err, data) => {
        if (err) throw err;
        console.table(data);
        showMenu();
    });
}

const showMenu = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Product ID: ",
            name: "id",
            validate: (ui) => {
                return isNaN(ui) ? "Error: ID must be a number" : true;
            }
        },
        {
            type: "input",
            message: "Quantity: ",
            name: "quantity",
            validate: (ui) => {
                return isNaN(ui) ? "Error: Quantity must be a number" : true;
            }
        }
    ]).then(input => {
        processOrder(input);
    });
}

const processOrder = (input) => {

    let query = `SELECT stock_quantity, price FROM products WHERE item_id = ?`;
    connection.query(query, [input.id], (err, data) => {
        // connection.query(query, (err, data) => {
        if (err) throw err;
        let stock = parseInt(data[0].stock_quantity);
        let quantity = parseInt(input.quantity);
        let success = stock >= quantity;
        if (success) {
            console.log("Order Approved");
            query = "UPDATE products SET ? WHERE ?";
            connection.query(query,
                [
                    {
                        stock_quantity: stock - quantity
                    },
                    {
                        item_id: input.id
                    }
                ], (err, newData) => {
                    if (err) throw err;
                    // console.log(`${newData.affectedRows} product updated!`);
                    let totalCost = parseFloat(data[0].price) * quantity;
                    totalCost = totalCost.toFixed(2);
                    console.log(`Total Order Cost: \$${totalCost}`);
                });
        }
        else {
            console.log("Insufficient stock!");
        }
        connection.end();
    });
}

connection.connect(error => {
    if (error) throw error;

    // console.log(`connected as id: ${connection.threadId}`);
    showWelcome();
    showProducts();

    // connection.end();
});
