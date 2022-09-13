const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');

const { connection } = require('./connection/connection')
router.use(express.json());

const token_secret = 'alpha21';

function Authnetication(req, res, next){
    if(!req.headers.token) return res.send('Token is not Provided')

    jwt.verify(req.headers.token, token_secret, function(err, decoded){
        if(!decoded) return ('Invalid Token');
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
router.post('/Login', (req, res)=>{
    connection.query(`INSERT INTO loginaccount (cnic, password) Values ('${req.body.cnic}', '${req.body.password}')`, function(err, result){
        if(err) return res.send('Error while inserting data');
        const tkn= {
            cnic: req.body.cnic,
            id: result.insertId 
        }

        jwt.sign(tkn, token_secret, (err, token)=>{
            console.log(token);
            res.send(token);
        })
    })
});


///AccInfo
router.get('/accountInfo',Authnetication, (req, res)=>{
    connection.query(`SELECT balance from regaccount cnic= '${res.locals.cnic }'`, function(err, result){
        if(err) return res.send('ERROR');
        console.log("accountInfo");
        res.send(result);
    })
});


///Deposit
router.patch('/Deposit',Authnetication, (req, res)=>{
    connection.query(`UPDATE regaccount SET balance = '${req.body.balance}' WHERE cnic='${res.locals.cnic}' `, function(err, result ){
        if(err) return res.send('Error occured while depositing money!');
       if(result) return res.send('Deposit successful!');
    })
});


///Withdraw
router.patch('/withdraw',Authnetication, (req, res)=>{
    connection.query(`UPDATE regaccount SET balance = '${req.body.balance}' WHERE cnic = '${res.locals.cnic}'`, function(err, result){
        if(err) return res.send('Error occured!');
        if(result) return res.send('Withdraw Successful');
    })
});

module.exports = router;