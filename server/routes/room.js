require('dotenv').config({
    path: __dirname + '/../../.env'
})
const multer = require('multer');
const upload = multer();
const router = require('express').Router();
const db = require('../db');
const inProduction = process.env.NODE_ENV === "production";



module.exports = router;