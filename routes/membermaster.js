const express = require('express')
const router = express.Router()
var mysqlconnection = require('../mysqlcon')


// get all Members and member codes
router.get('/',(req,res)=>{
    redirecttoindexpage(res)
})


// insert new member
router.post('/'/*/:member_code&:member_fname&:member_lname'*/,(req,res)=>{
    if(req.body.member_code=="" || req.body.member_fname=="" || req.body.member_lname==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;  
      }
    //let sqlquery = `INSERT INTO member_master VALUES("${req.params.member_code}","${req.params.member_fname}","${req.params.member_lname}");`;
    let sqlquery = `INSERT INTO member_master VALUES("${req.body.member_code}","${req.body.member_fname}","${req.body.member_lname}");`;
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){    
            console.log(`Inserted data for ${req.body.member_fname}`)
            redirecttoindexpage(res)
            //console.log(rows)    
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })    
})


// delete a member
router.post('/deletemember'/*/:member_code'*/,(req,res)=>{
    //let sqlquery = `DELETE FROM member_master WHERE member_code="${req.params.member_code}";`
    let sqlquery = `DELETE FROM member_master WHERE member_code="${req.body.member_code}";`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){
            console.log(`Deleted data for member with id ${req.body.member_code}`)
            redirecttoindexpage(res)
            //console.log(rows)    
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    }) 
})


// update a member's first and last name
router.post('/update',(req,res)=>{
    if(req.body.new_member_fname=="" || req.body.new_member_lname==""){
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }
    let sqlquery = `UPDATE member_master SET member_fname="${req.body.new_member_fname}",member_lname="${req.body.new_member_lname}" WHERE member_code="${req.body.member_code}";`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){
            console.log(`Updated data for member with id ${req.body.member_code}`)
            redirecttoindexpage(res)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        }
    })
})


// get a member
router.post('/search',(req,res)=>{
    if(req.body.member_code==""){    
        redirecttoindexwitherror(res,new Error(),"Do not leave fields blank")
        return;
    }
    let sqlquery = `SELECT * FROM member_master where member_code="${req.body.member_code}";`
    mysqlconnection.query(sqlquery,(err,rows,fields)=>{
        if(!err){    
            const params = {
                members:(rows.length>0)?rows:null,
                errorMessage:(rows.length>0)?null:"No members with that code"
            }
            res.render("member/index",params)
        }else{
            redirecttoindexwitherror(res,err,errmsgtype(err))
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2)); 
        } 
    })
})


// redirect to index
const redirecttoindexpage = (res) => {
    mysqlconnection.query('SELECT * FROM member_master',(err,rows,fields)=>{
        if(!err){
            console.log("Retrieved all Members")
            const params = {
                members:rows
            } 
            res.render("member/index",params)    
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })
}


// Redirect to index with error message
const redirecttoindexwitherror = (res,errorobj,errmsg) => {
    mysqlconnection.query('SELECT * FROM member_master',(err,rows,fields)=>{
        if(!err){
            console.log("Retrieved all Members")
            console.log(rows)
            const params = {
                members:rows,
                errorMessage:errmsg//JSON.stringify(errorobj,undefined,2)    
            }
            res.render("member/index",params)    
        }else{
            console.log("ERROR : \n"+JSON.stringify(err,undefined,2));
        }
    })   
}


// error message type
const errmsgtype = (errorobject) => {
    switch(errorobject.code){
        case "ER_ROW_IS_REFERENCED_2":
            return "Could not delete member as there are books in their name"
            break;
        case "ER_DUP_ENTRY":
            return "Member with similiar code already exists"
            break;   
        default:
            return "Error in operation"     
    }
}


module.exports = router