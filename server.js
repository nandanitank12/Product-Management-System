const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const path = require('path');
// const cookieParser = require('cookie-parser');
const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "admin",
    database: "PMS_db",
    max: 50,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0
});

const PMS = express();

dotenv.config({ path: 'config.env' });
const PORT = process.env.PORT || 8000;

//log requests
PMS.use(morgan('tiny'));
// PMS.use(cookieParser());

//mongodb connection
try {
    client.connect();
    console.log('Database connected.');
}
catch (err) {
    console.log(err);
}

//parse request to body-parser
PMS.use(express.json());
PMS.use(bodyparser.urlencoded({ extended: true }));

//set view engine
PMS.set('view engine', 'ejs');
// PMS.set('view',path.resolve(__dirname,"views/ejs"));

//load asserts
PMS.use('/css', express.static(path.resolve(__dirname, "asserts/css")))
//css/style.css

PMS.use('/img', express.static(path.resolve(__dirname, "asserts/img")))
// PMS.use('/js',express.static(path.resolve(__dirname,"asserts/js")))


PMS.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`) });

PMS.get('/', (req, res) => {
    res.render('start');
});

PMS.get('/landingpage', async (req, res) => {
    res.render('login');
});

PMS.get('/home', async (req, res) => {
    res.render('home');
});

PMS.get('/tab/:tab', async (req, res) => {
    res.render(`${req.params.tab}`);
});

PMS.post('/Department_insert', async (req, res) => {
    const query = `INSERT INTO "PMS"."Department" VALUES(NULL,'${req.body.Name}','${req.body.Address}','${req.body.Employee_Capacity}','${req.body.Machine_Capacity}')`;
    await client.query(`${query}`, (err, result) => {
        if (!err) {
            res.redirect('/home');
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post('/Employee_insert', async (req, res) => {
    const query = `INSERT INTO "PMS"."Employees" VALUES(NULL,'${req.body.PID}','${req.body.Password}','${req.body.Fname}','${req.body.Lname}','${req.body.Salary}','${req.body.Hours}','${req.body.Shift}','${req.body.Joining_Date}','${req.body.Address}','${req.body.Email}','${req.body.Role}')`;
    await client.query(`${query}`, (err, result) => {
        if (!err) {
            res.redirect('/home');
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post('/Product_insert', async (req, res) => {
    const query = `INSERT INTO "PMS"."Product" VALUES(NULL,'${req.body.ID}','${req.body.Name}','${req.body.Weight}','${req.body.Stock}','${req.body.Price}','${req.body.Production_limit}','${req.body.Production_flag}')`;
    await client.query(`${query}`, (err, result) => {
        if (!err) {
            res.redirect('/home');
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post('/Raw_Material_insert', async (req, res) => {
    const query = `INSERT INTO "PMS"."Raw_Material" VALUES(NULL,'${req.body.Name}','${req.body.Stock}','${req.body.Price}')`;
    await client.query(`${query}`, (err, result) => {
        if (!err) {
            res.redirect('/home');
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post('/Production_Detail_insert', async (req, res) => {
    const query = `INSERT INTO "PMS"."Production_Detail" VALUES('${req.body.ID}','${req.body.Date}','${req.body.Quantity}','${req.body.Cost}')`;
    await client.query(`${query}`, (err, result) => {
        if (!err) {
            res.redirect('/home');
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post('/Order_insert', async (req, res) => {
    const query = `INSERT INTO "PMS"."Order" VALUES('${req.body.RID}','${req.body.SID}','${req.body.Date}','${req.body.Time}','${req.body.Price}','${res.body.Quantity}')`;
    await client.query(`${query}`, (err, result) => {
        if (!err) {
            res.redirect('/home');
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post('/Sell_insert', async (req, res) => {
    const query = `INSERT INTO "PMS"."Sell" VALUES('${req.body.PID}','${req.body.BID}','${req.body.Date}','${req.body.Time}','${req.body.Price}','${res.body.Quantity}')`;
    await client.query(`${query}`, (err, result) => {
        if (!err) {
            res.redirect('/home');
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post('/login', async (req, res) => {
    const user_id = req.body.user_id;
    const password = req.body.password;
    await client.query(`Select * from "PMS"."Employees" where "Employee_ID" = '${user_id}' and "Employee_password" = '${password}'`, (err, result) => {
        if (!err) {
            // res.send(result.rows);
            // console.log(result.rows);
            if(result.rows.length == 0)
            {
                res.redirect('/landingpage');
                return;
            }
            if (result.rows[0].Employee_Role == "Employee") {
                res.render('show', { user: result.rows,tb: "Employees",but:""});
            }
            else {
                res.redirect('/home');
            }
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post('/signup', async (req, res) => {
    const Fname = req.body.Fname;
    const Lname = req.body.Lname;
    const password = req.body.password;
    await client.query(`Insert into "PMS"."Employees" ("Employee_ID","Employee_password", "Employee_Fname", "Employee_Lname","Employee_Role") VALUES (100031,'${password}', '${Fname}', '${Lname}','Admin')`, (err, result) => {
        if (!err) {
            // res.send(result.rows);
            // console.log(result.rows);
            res.redirect('/home');
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });

})

PMS.get("/user/show/:table", async (req, res) => {
    // console.log(table);
    const table = req.params.table;
    await client.query(`Select * from "PMS"."${table}"`, (err, result) => {
        if (!err) {
            // res.send(result.rows);
            // console.log(result.rows)
            res.render('show', { user: result.rows, tb: table,but:"YES" });
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
});

PMS.post("/user/add", async (req, res) => {
    await client.query(`${req.body.insert_query}`, (err, result) => {
        if (!err) {
            // res.send(result.rows);
            if (result.rows.length > 0) {
                res.render('show', { user: result.rows,tb:"",but:"YES" });
            }
            else {
                res.redirect('/home');
            }
        }
        else {
            res.status(500).send({
                message: err.message || "Some error occured while fetch data."
            });
        }
    });
})