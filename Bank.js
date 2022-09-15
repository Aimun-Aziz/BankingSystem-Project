const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { connection } = require('./connection/connection');
const { CLIENT_IGNORE_SPACE } = require('mysql/lib/protocol/constants/client');
router.use(express.json());

const token_secret = 'alpha21';

function Authnetication(req, res, next) {
    if (!req.headers.token) return res.send('Token is not Provided')

    jwt.verify(req.headers.token, token_secret, function (err, decoded) {
        if (!decoded) return ('Invalid Token');
        res.locals.cnic = decoded.cnic;

        next();
    });
};


///Register
router.post('/Register', (req, res) => {
    connection.query(`SELECT * FROM regaccount WHERE cnic= '${req.body.cnic}' LIMIT 1`, async function (err, result) {
        if (err) return res.send('Error selecting cnic');
        if (result.length > 0) return res.send('Account already Exist')

        const salt = await bcrypt.genSalt(10);
        const Phash = await bcrypt.hash(req.body.password, salt);
        console.log(Phash);

        connection.query(`INSERT INTO regaccount (name, cnic, contactNo, password, balance) VALUES ('${req.body.name}', '${req.body.cnic}', '${req.body.contactNo}', '${Phash}', '${req.body.balance}')`, function (err, result) {
            if (err) return res.send('Error Inserting Data');
            console.log(result);
            return res.send('Registered Succcessfully');

        })

    });
});


////Login
router.post('/Login', (req, res) => {
    connection.query(`INSERT INTO loginaccount (cnic, password) Values ('${req.body.cnic}', '${req.body.password}')`, function (err, result) {
        if (err) return res.send('Error while inserting data');
        const tkn = {
            cnic: req.body.cnic,
            id: result.insertId
        }

        jwt.sign(tkn, token_secret, (err, token) => {
            console.log(token);
            res.send(token);
        })
    })
});


///AccInfo
router.get('/accountInfo', Authnetication, (req, res) => {
    connection.query(`SELECT balance from regaccount WHERE cnic= '${res.locals.cnic}'`, function (err, result) {
        if (err) return res.send('ERROR');
        // console.log("accountInfo");
        res.send(result);
    })
});


///Deposit
router.patch('/Deposit', Authnetication, (req, res) => {

    
    if(req.body.balance < 0 )
    return res.send('Enter a positive value')

    connection.query(`SELECT balance from regaccount Where cnic='${res.locals.cnic}'`, function (err, result) {
        if (err) return res.send('ERROR');
         //console.log(result[0]); 
        // res.send(result);
        
        let balance = (parseFloat(result[0].balance) + parseFloat(req.body.balance));

        connection.query(`UPDATE regaccount SET balance = '${balance}' WHERE cnic='${res.locals.cnic}' `, function (err1, result1) {
            if (err1) return res.send('Error occured while depositing money!');

            //console.log(result);

            return res.send(`Deposit successful! ${balance} `);

        })
    })
});


///Withdraw
router.patch('/withdraw', Authnetication, (req, res) => {
    connection.query(`SELECT balance FROM regaccount WHERE cnic= '${res.locals.cnic}'`, function (error, result) {
        if (error) return res.send("ERROR");

        if((req.body.balance) > (result[0].balance))
        return res.send(`You can only withdraw from ${result[0].balance} amount `);

        let blnc = ((result[0].balance) - (req.body.balance));

      // return console.log((result[0].balance) );
        connection.query(`UPDATE regaccount SET balance = '${blnc}' WHERE cnic = '${res.locals.cnic}'`, function (err, result1) {
            if (err) return res.send('Error occured!');
            return res.send(`Withdraw Successful!  ${blnc} `);
        })
    })
});

module.exports = router;