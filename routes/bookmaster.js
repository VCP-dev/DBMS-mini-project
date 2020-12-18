const express = require('express')
const router = express.Router()
var mysqlconnection = require('../mysqlcon')



// get all books from bookmaster table
router.get('/',(req,res)=>{
    redirecttoindexpage(res)
})


// get a book by its' code
router.get('/',(req,res)=>{    
    mysqlconnection.query('SELECT * FROM book_master WHERE book_code=?',[req.body.book_code],(err,rows,fields)=>{    
        if(!err){
            console.log("Searched for a book by it's code")
            console.log(rows)    
        }else{    
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// get a book by its' name
router.get('/',(req,res)=>{   
    mysqlconnection.query('SELECT * FROM book_master WHERE book_name=?',[req.body.book_name],(err,rows,fields)=>{    
        if(!err){
            console.log("Searched for a book by it's name")
            console.log(rows)    
        }else{
            redirecttoindexwitherror(res,err,"There was error in getting all the books")
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// delete a book by its' book code
router.post('/delete',(req,res)=>{   
    mysqlconnection.query('DELETE FROM book_master WHERE book_code=?',[req.body.book_code],(err,rows,fields)=>{    
        if(!err){
            console.log(`Deleted a book of code ${req.body.book_code}`)
            redirecttoindexpage(res)
            //console.log(rows)    
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));    
        }
    })
})


// insert a new book
router.post('/',(req,res)=>{    
    if(req.body.cat_code=="" || req.body.book_code=="" || req.body.author_code=="" || req.body.book_name=="" || req.body.publisher=="" || req.body.language_used==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }    
    let sqlquery = `INSERT INTO book_master VALUES ("${req.body.cat_code}","${req.body.book_code}","${req.body.author_code}","${req.body.book_name}","${req.body.publisher}","${req.body.language_used}");`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){
            console.log(`Inserted data for ${req.body.book_name}`)
            redirecttoindexpage(res)
            //console.log(rows)    
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// Update a book by its' book code
router.post('/update',(req,res)=>{    
    if(req.body.new_book_name=="" || req.body.new_publisher=="" || req.body.new_language_used==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }
    let sqlquery = `UPDATE book_master SET book_name="${req.body.new_book_name}",publisher="${req.body.new_publisher}",language_used="${req.body.new_language_used}" WHERE book_code="${req.body.book_code}"`
    mysqlconnection.query(sqlquery,[req.body.book_name],(err,rows,fields)=>{
        if(!err){
            console.log(`Updated book with code : ${req.body.book_code}`)
            redirecttoindexpage(res)        
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// get books by book id
router.post('/searchbybookid',(req,res)=>{
    if(req.body.book_code==""){    
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }    
    let sqlquery = `SELECT * FROM book_master where book_code="${req.body.book_code}";`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){    
            const params = {
                books:(rows.length>0)?rows:null,
                errorMessage:(rows.length>0)?null:"No books with that id"
            }    
            res.render("book/index",params)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        } 
    })
})


// get books by book category
router.post('/searchbycategory',(req,res)=>{
    if(req.body.cat_code==""){    
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }    
    let sqlquery = `SELECT * FROM book_master where cat_code="${req.body.cat_code}";`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){    
            const params = {
                books:(rows.length>0)?rows:null,
                errorMessage:(rows.length>0)?null:"No books with that Category"
            }    
            res.render("book/index",params)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        } 
    })
})


// get books by Author
router.post('/searchbyauthor',(req,res)=>{
    if(req.body.author_code==""){    
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }    
    let sqlquery = `SELECT * FROM book_master where author_code="${req.body.author_code}";`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){    
            const params = {
                books:(rows.length>0)?rows:null,
                errorMessage:(rows.length>0)?null:"No books written by that Author"
            }    
            res.render("book/index",params)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        } 
    })
})


// redirect to index page
const redirecttoindexpage = (res) => {
    mysqlconnection.query('SELECT * FROM book_master',(err,rows,fields)=>{
        if(!err){
            console.log("Retrieved all books")
            const params = {
                books:rows
            }
            res.render("book/index",params)
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
}


// Redirect to index with error message
const redirecttoindexwitherror = (res,errorobj,errmsg) => {
    mysqlconnection.query('SELECT * FROM book_master',(err,rows,fields)=>{
        if(!err){
            console.log("Retrieved all books")
            console.log(rows)
            const params = {
                books:rows,
                errorMessage:errmsg   
            }
            res.render("book/index",params)     
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })   
}


// error message type
const errmsgtype = (errorobject) => {
    switch(errorobject.code){
        case "ER_ROW_IS_REFERENCED_2":
            return "Could not delete Author as there are books in their name"
            break;
        case "ER_DUP_ENTRY":
            return "Author with similiar code already exists"
            break;   
        default:        
            return "Error in operation"     
    }
}


module.exports = router

