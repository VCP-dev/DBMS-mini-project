const express = require('express')
const router = express.Router()
var mysqlconnection = require('../mysqlcon')


// get all Book categories and book category codes
router.get('/',(req,res)=>{
    redirecttoindex(res)
})


// insert new book category
router.post('/',(req,res)=>{
    if(req.body.cat_code=="" || req.body.cat_type==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank") 
        return;
    }    
    mysqlconnection.query(`INSERT INTO book_category_master VALUES("${req.body.cat_code}","${req.body.cat_type}")`,(err,rows,fields)=>{   
        if(!err){
            console.log(`Inserted new category ${req.body.cat_type}`)    
            redirecttoindex(res)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
    
})


// delete book category according to category code
router.post('/deletecategory',(req,res)=>{    
    mysqlconnection.query(`DELETE FROM book_category_master WHERE cat_code="${req.body.cat_code}"`,(err,rows,fields)=>{        
        if(!err){
            console.log(`Deleted category with code ${req.body.cat_code}`)
            redirecttoindex(res)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// update a book category
router.post('/update',(req,res)=>{
    if(req.body.new_cat_type==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }
    mysqlconnection.query(`UPDATE book_category_master SET cat_type="${req.body.new_cat_type}" WHERE cat_code="${req.body.cat_code}";`,(err,rows,fields)=>{
        if(!err){
            console.log(`Book of code ${req.body.cat_code} was updated`)      
            redirecttoindex(res)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        }
    })
})


// get a book category
router.post('/search',(req,res)=>{
    if(req.body.cat_code==""){    
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }
    let sqlquery = `SELECT * FROM book_category_master where cat_code="${req.body.cat_code}";`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){    
            const params = {
                bookcategories:(rows.length>0)?rows:null,
                errorMessage:(rows.length>0)?null:"No book categories with that code"
            }
            res.render("bookcategory/index",params)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        } 
    })
})


// redirect to index page
const redirecttoindex = (res) => {
    mysqlconnection.query('SELECT * FROM book_category_master',(err,rows,fields)=>{
        if(!err){
            console.log("Retrieved all Book categories")
            const params = {
                bookcategories:rows
            }    
            res.render("bookcategory/index",params)
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
}


// Redirect to index with error message
const redirecttoindexwitherror = (res,errorobj,errmsg) => {
    mysqlconnection.query('SELECT * FROM book_category_master',(err,rows,fields)=>{
        if(!err){
            console.log("Retrieved all Book categories")
            console.log(rows)
            const params = {
                bookcategories:rows,
                errorMessage:errmsg   
            }
            res.render("bookcategory/index",params)     
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })   
}


// error message type
const errmsgtype = (errorobject) => {
    switch(errorobject.code){
        case "ER_ROW_IS_REFERENCED_2":
            return "Could not delete category as it is assigned to a book"
            break;
        case "ER_DUP_ENTRY":
            return "Category with similiar code already exists"
            break; 
        default:
            return "Error in operation"       
    }
}


module.exports = router