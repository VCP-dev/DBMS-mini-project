const express = require('express')
const bodyparser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')


const indexrouter = require('./routes/indexroute')
const bookmasterrouter = require('./routes/bookmaster')
const authormasterrouter = require('./routes/authormaster')
const bookcategorymasterrouter = require('./routes/bookcategorymaster')
const ledgerrouter = require('./routes/ledger')
const membermasterrouter = require('./routes/membermaster')
const loginrouter = require('./routes/login')


var mysqlconnection = require('./mysqlcon')


var app = express(); 
const port = 3000


app.use(bodyparser.urlencoded({limit:'10mb', extended: false}))
// to set the views to accept ejs templates
app.set('view engine','ejs')
// for the different views
app.set('views',__dirname+'/views')
// for the layout files
app.set('layout','layouts/layout')
app.use(expressLayouts)


// routes
//app.use('/',indexrouter)
app.use('/books',bookmasterrouter)
app.use('/authors',authormasterrouter)
app.use('/bookcategories',bookcategorymasterrouter)
app.use('/ledger',ledgerrouter)
app.use('/members',membermasterrouter)
app.use('/',loginrouter)


mysqlconnection.connect((err)=>{
    if(err){
        console.log("DB connection failed \n ERROR : "+JSON.stringify(err,undefined,2))
    }else{
        console.log("DB connection was successfull")    
    }
})


app.listen(port,()=>{
    console.log(`Listening on port ${port} ...`)
})











