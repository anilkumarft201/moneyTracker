const express = require('express');
const router = express.Router();
const user = require('../usermodel');
const transaction = require('../transactionmodel');
const { setUser, getUser, clearUser } = require("../service/auth");
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

async function userConstraints(req, resp, next) {
    const userUid = req.cookies?.uid;
    if (!userUid) {
        return resp.redirect('/');
    }
    const user = getUser(userUid);
    console.log(user);

    if (!user) {
        return resp.redirect("/");
    }
    req.user = user;
    next();
}

router.get('/', async (req, resp) => {
    //console.log(req);
    try {
        const userUid = req.cookies?.uid;
        if (!userUid) {
            return resp.render('login');
        }
        const User = getUser(userUid);
        if (!User) {
            return resp.render('login');
        }
        let record = await transaction.find({ userid: User._id });
        let sum = 0;
        for (let i = 0; i < record.length; i++) {
            sum = sum + record[i].Amount;
        }
        return resp.render('index', { user: User.fname, email: User.email, lname: User.lname, id: User._id, record, sum });
    }
    catch(e)
    {
        console.log(e);
    }
    
})

router.post('/register', (req, resp) => {
    return resp.render('singnup');
})

router.post('/login', async (req, resp) => {
    // console.log(req.body);
    const Email = req.body.email;
    const Password = req.body.password;
    let exist = await user.find({ email: Email });
    if (Array.isArray(exist) && exist.length > 0) {
        let id = { userid: exist[0]._id };
        if (exist[0].password == Password) {
            let User = new user(exist[0]);
            let record = await transaction.find(id);
            let sum = 0;
            for (let i = 0; i < record.length; i++) {
                sum = sum + record[i].Amount;
            }
            const sessionID = uuidv4();
            setUser(sessionID, User);
            resp.cookie("uid", sessionID);
            return resp.render('index', { user: exist[0].fname, email: exist[0].email, lname: exist[0].lname, id: exist[0]._id, record, sum });
        }
        else {
            return resp.render('login', { error_pwd: "Incorrect password" });
        }
    }
    else {
        return resp.render('login', { error_email: "Email is not exist" });
    }
});

router.post('/addTrans', userConstraints, async (req, resp) => {

    if (req.body.trans == 'debit') {
        req.body.amount = "-" + req.body.amount;
    }
    let amount = '0', InData = "Incorrect Data Amount";
    let pattern = /[0-9]+/;
    if (pattern.test(req.body.amount)) {
        amount = req.body.amount;
        InData = req.body.info;
    }
    let data = {
        userid: req.body.id,
        tran_type: req.body.trans,
        info: InData,
        Amount: Number(amount),
        trans_date: new Date()
    };
    let tran = new transaction(data);
    let exist = await user.find({ _id: req.body.id });
    let result = await tran.save();
    console.log(exist);
    let record = await transaction.find({ userid: exist[0]._id });
    let sum = 0;
    for (let i = 0; i < record.length; i++) {
        sum = sum + record[i].Amount;
    }
    //resp.render('index', { user: exist[0].fname, email: exist[0].email, lname: exist[0].lname, id: exist[0]._id, record, sum });
    return resp.redirect('/');
})


router.post('/signup', async (req, resp) => {
    const { fname, lname, email, password } = req.body;
    let exist1 = await user.find({ email: email, password: password })
    if (Array.isArray(exist1) && exist1.length > 0) {
        return resp.render('singnup', { email_exist: "Email already exist: " })
    }
    else {
        await user.create({
            fname, lname, email, password
        })
        let exist = await user.find({ email: email, password: password })
        if (Array.isArray(exist) && exist.length > 0) {
            let record = await transaction.find({ userid: exist[0]._id });
            let sum = 0;
            for (let i = 0; i < record.length; i++) {
                sum = sum + record[i].Amount;
            }
            let User = new user(exist[0]);
            const sessionID = uuidv4();
            setUser(sessionID, User);
            resp.cookie("uid", sessionID);
            return resp.render('index', { user: exist[0].fname, email: exist[0].email, lname: exist[0].lname, id: exist[0]._id, record, sum });
        }
    }
})

router.post('/logout', async (req, resp) => {
    const userUid = req.cookies?.uid;
    if (!userUid) {
        return resp.redirect('/');
    }
    const user = getUser(userUid);

    if (!user) {
        return resp.redirect("/");
    }
    clearUser(user);
    return resp.redirect("/");
})

router.get('/delete/:id', async (req, resp) => {
    console.log(req.params);
    let id = req.params.id;
    console.log(id);
    let del = await transaction.findByIdAndDelete(id);
    console.log(del);
    return resp.redirect("/");
})


module.exports = router;