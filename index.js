const express = require("express")
require('dotenv').config();
const app= express();
const port =3001;

app.get('/',(req,res)=>{
    res.send('hello world')
})
app.get('/twitter',(req,res)=>{
    res.send("hiteshdotcom")
})
app.get('/login',(req,res)=>{
    res.send('<h1>Login in main website</h1>')
})
app.listen(process.env.PORT ,()=>{
    console.log(`App is running on the port ${port}`)
})