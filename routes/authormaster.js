const express = require('express')
const router = express.Router()
var mysqlconnection = require('../mysqlcon')


// get all Authors and author codes
router.get('/',(req,res)=>{
   redirecttoindex(res)
})


// insert a new author
router.post('/',(req,res)=>{
    if(req.body.author_code=="" || req.body.author_fname=="" || req.body.author_lname==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;  
      }    
    mysqlconnection.query(`INSERT INTO author_master VALUES ("${req.body.author_code}","${req.body.author_fname}","${req.body.author_lname}")`,(err,rows,fields)=>{    
        if(!err){    
            console.log(`Inserted record for ${req.body.author_fname} ${req.body.author_lname}`)
            redirecttoindex(res)     
        }else{
            console.log(req.body)
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// delete according to author code
router.post('/delete',(req,res)=>{    
    mysqlconnection.query(`DELETE FROM author_master WHERE author_code="${req.body.author_code}"`,(err,rows,fields)=>{    
        if(!err){
            console.log(`Author of code ${req.body.authorcode} was deleted`)
            redirecttoindex(res)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
})


// update an author
router.post('/update',(req,res)=>{
    if(req.body.new_author_fname=="" || req.body.new_author_lname==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }
    mysqlconnection.query(`UPDATE author_master SET author_fname="${req.body.new_author_fname}",author_lname="${req.body.new_author_lname}" WHERE author_code="${req.body.author_code}";`,(err,rows,fields)=>{
        if(!err){
            console.log(`Author of code ${req.body.author_code} was updated`)      
            redirecttoindex(res)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        }
    })
})


// get an author according to author code
router.post('/search',(req,res)=>{
    if(req.body.author_code==""){    
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }
    let sqlquery = `SELECT * FROM author_master where author_code="${req.body.author_code}";`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){
            console.log(`Getting author of code ${req.body.author_code}`)
            const params = {
                authors:(rows.length>0)?rows:null,
                errorMessage:(rows.length>0)?null:"No Authors with that code"
            }
            res.render("author/index",params)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        } 
    })
})


// just to redirect to index after finishing
const redirecttoindex = (res) => {
    mysqlconnection.query('SELECT * FROM author_master',(err,rows,fields)=>{
        if(!err){
            console.log("Retrieved all Authors")
            console.log(rows)
            const params = {
                authors:rows    
            }
            res.render("author/index",params)    
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })   
}


// Redirect to index with error message
const redirecttoindexwitherror = (res,errorobj,errmsg) => {
    mysqlconnection.query('SELECT * FROM author_master',(err,rows,fields)=>{
        if(!err){
            console.log("Retrieved all Authors")
            console.log(rows)
            const params = {
                authors:rows,
                errorMessage:errmsg    
            }
            res.render("author/index",params)     
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