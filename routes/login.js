const express = require('express')
const router = express.Router()
var mysqlconnection = require('../mysqlcon')


// get all books from bookmaster table
// login system is kind of in-efficient
router.get('/',(req,res)=>{
    const params = {
        loggedin:false
    }
    res.render("login/index",params)
})


// for logging in
router.post('/',(req,res)=>{
    if(req.body.librarian_username=="" || req.body.librarian_password==""){
        res.render("login/index",{
            errorMessage:"Please do not leave fields blank",
            loggedin:false
        })
        return;
    }
    let mysqlquery = `SELECT * FROM admins WHERE username="${req.body.librarian_username}" and password="${req.body.librarian_password}"`
    mysqlconnection.query(mysqlquery,(err,rows,fields)=>{
        if(rows.length>0){
            let mysqlquery = "SELECT * FROM ledger"
    mysqlconnection.query(mysqlquery,(ledgererr,ledgerrows,fields)=>{
            if(!ledgererr){    
            let bookquery = 'SELECT * from book_master where book_master.book_code NOT IN (select book_code from ledger);'
            let memberquery = 'SELECT * FROM member_master'
            let booklist = null
            let memberlist = null
            mysqlconnection.query(bookquery,(err,rows,fields)=>{
                if(!err){
                    booklist = rows
                    mysqlconnection.query(memberquery,(err,rows,fields)=>{
                        if(!err){
                            memberlist = rows    
                            console.log("ledgercontent:"+JSON.stringify(ledgerrows,undefined,2))
                            ledgerrows = bookformat(ledgerrows)
                            const params = {
                                ledgercontent:ledgerrows,
                                books:booklist,
                                members:memberlist,
                                errorMessage:checkbookavailability(booklist)                                
                            }
                            res.render("ledger/index",params)
                        }else{
                            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
                        }
                    })
                }else{
                    console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
                }
            })    
            
            }else{
            console.log("ERROR : \n"+JSON.stringify(ledgererr,undefined,2));
            }
         })
        }
        else{
            res.render("login/index",{
                errorMessage:"No admin exists with those credentials",
                loggedin:false
            })  
        }
    })
    
})



// ------------------------------- for loading ledger page -------------------------------
// check book availability
const checkbookavailability = (booklist) => {
    return(booklist.length==0?"No books available to borrow":null)
}


// format dates for book
const bookformat = (booklist) => {    
    booklist.forEach((book) => {        
        book.issue_date = formatDate(book.issue_date)
        book.due_date = formatDate(book.due_date)    
    })
    return booklist
}


// for an individual date
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
// ------------------------------- for loading ledger page -------------------------------


module.exports = router