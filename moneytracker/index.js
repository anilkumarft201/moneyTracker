const express=require('express');
const app=express();
const path=require('path');
const userRoutes=require('./router/user');
const cors=require('cors');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
require('./connection');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use(express.json());
app.set('view engine','ejs');
app.use('/',userRoutes);
app.set('views',path.resolve(__dirname,'./views'));
app.use(express.static('views'));
app.use(function (req, resp, next) {
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
});
module.exports = app;