const express = require('express')
const router = express.Router()
var mysqlconnection = require('../mysqlcon')


// get all Books present in ledger
router.get('/',(req,res)=>{
    redirecttoindexpage(res)
})


// the " issue date " is passed as the " return date "

// insert book into a ledger
router.post('/'/*/:book_code&:member_code&:issue_date&:due_date&:ret_date'*/,(req,res)=>{
    //let mysqlquery = `INSERT INTO ledger VALUES("${req.params.book_code}","${req.params.member_code}","${req.params.issue_date}","${req.params.due_date}","${req.params.ret_date}")`
    if(req.body.issue_date=="" || req.body.due_date==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;  
      }
    let mysqlquery = `INSERT INTO ledger VALUES("${req.body.book_code}","${req.body.member_code}","${req.body.issue_date}","${req.body.due_date}","${req.body.issue_date}")`
    mysqlconnection.query(mysqlquery,(err,rows,fields)=>{
        if(!err){
            console.log(`Inserted book with code ${req.body.book_code} into ledger`)
            redirecttoindexpage(res)
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
            redirecttoindexwitherror(res,err,errmsgtype(err))            
        }
    })
})


// delete book from ledger
router.post('/delete'/*/:book_code'*/,(req,res)=>{
    //let mysqlquery = `DELETE FROM ledger WHERE book_code="${req.params.book_code}"`
    let mysqlquery = `DELETE FROM ledger WHERE book_code="${req.body.book_code}"`
    mysqlconnection.query(mysqlquery,(err,rows,fields)=>{
        if(!err){
            console.log(`Book with code ${req.body.book_code} has been deleted from the ledger`)
            redirecttoindexpage(res)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// update return date
router.put('/retdate'/*/:book_code&:ret_date'*/,(req,res)=>{
    //let mysqlquery = `UPDATE ledger SET ret_date="${req.params.ret_date}" WHERE book_code="${req.params.book_code}"`
    let mysqlquery = `UPDATE ledger SET ret_date="${req.body.ret_date}" WHERE book_code="${req.body.book_code}"`
    mysqlconnection.query(mysqlquery,(err,rows,fields)=>{
        if(!err){
            console.log(`Return date of book with code ${req.body.book_code} has been updated to ${req.body.ret_date}`)
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// get books issued in a member's name
router.post('/search',(req,res)=>{
    if(req.body.member_code==""){    
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }
    //let bookquery = 'SELECT * from book_master where book_master.book_code NOT IN (select book_code from ledger);'
    let memberquery = 'SELECT * FROM member_master'
    let booklist = null
    let memberlist = null
    let sqlquery = `SELECT * FROM ledger where member_code="${req.body.member_code}";`
   // mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        /*if(!err){    
            const params = {
                books:(rows.length>0)?rows:null,
                errorMessage:(rows.length>0)?null:"No books issued in that member's name"
            }
            res.render("ledger/index",params)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        }*/
        mysqlconnection.query(sqlquery,(ledgererr,ledgerrows,fields)=>{
            if(!ledgererr){
                //booklist = ledgerrows   
                booklist = bookformat(ledgerrows) 
                mysqlconnection.query(memberquery,(err,rows,fields)=>{
                    if(!err){
                        memberlist = rows    
                        console.log("ledgercontent:"+JSON.stringify(ledgerrows,undefined,2))
                        ledgerrows = bookformat(ledgerrows)
                        const params = {
                            ledgercontent:ledgerrows,
                            books:booklist,
                            members:memberlist,
                            errorMessage:checknumberofbooksissued(booklist)                                
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
    //})
})


// just to check if any books have been issued in a member's name
const checknumberofbooksissued = (booklist) => {
    if(booklist.length>0){
        return null
    }else{
        return "No books have been issued to this member"
    }
}


// redirect to index page
const redirecttoindexpage = (res) => {   
    let mysqlquery = "SELECT * FROM ledger"
    mysqlconnection.query(mysqlquery,(ledgererr,ledgerrows/*err,rows*/,fields)=>{
        if(!ledgererr/*!err*/){
            /*console.log("Retrieved all Books in ledger")
            const params = {
                ledgercontent:rows
            }    
            res.render("ledger/index",params)*/
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


const checkbookavailability = (booklist) => {
    return(booklist.length==0?"No books available to borrow":null)
}


// Redirect to index with error message
const redirecttoindexwitherror = (res,errorobj,errmsg) => {
    mysqlconnection.query('SELECT * FROM ledger',(ledgererr,ledgerrows,fields)=>{
        if(!ledgererr/*!err*/){
            /*console.log("Retrieved all Books in ledger")
            const params = {
                ledgercontent:rows
            }    
            res.render("ledger/index",params)*/
            let bookquery = 'SELECT * from book_master where book_master.book_code NOT IN (select book_code from ledger);'
            let memberquery = 'SELECT * FROM member_master'
            let booklist = null
            let memberlist = null
            mysqlconnection.query(bookquery,(err,rows,fields)=>{
                if(!err){
                    //booklist = rows 
                    booklist = bookformat(rows)   
                    mysqlconnection.query(memberquery,(err,rows,fields)=>{
                        if(!err){
                            memberlist = rows    
                            console.log("ledgercontent:"+ledgerrows)
                            ledgerrows = bookformat(ledgerrows)
                            const params = {
                                ledgercontent:ledgerrows,
                                books:booklist,
                                members:memberlist,
                                errorMessage:errmsg
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
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })   
}


// error message type
const errmsgtype = (errorobject) => {
    switch(errorobject.code){    
        case "ER_DUP_ENTRY":
            return "That Book has already been checked out"
            break;
        case "ER_NO_REFERENCED_ROW_2":
            return "No Book or member with that code exists"
            break;       
        default:
            return "Error in operation"     
    }
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


module.exports = router