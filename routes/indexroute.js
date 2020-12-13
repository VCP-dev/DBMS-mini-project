const express = require('express')
const router = express.Router()
var mysqlconnection = require('../mysqlcon')

// homepage
router.get('/',(req,res)=>{
    res.render('index')
})


module.exports = router