const validator = require('validator');
//data is nothing but req.body
const validate =(data)=>{
    //firstname should be in data => emailid showuld be in data=>password should be in data  
    const Mandatoryfield = ['firstName','emailId','password'];
    const IsAllowed =Mandatoryfield.every((k)=>Object.keys(data).includes(k));
    if(!IsAllowed)
        throw new Error("kuch field missing hai");
    if(!validator.isEmail(data.emailId))
        throw new Error("invalid email please re enter")
    if(!validator.isStrongPassword(data.password))
        throw new Error("password is too weak")

}
module.exports =validate