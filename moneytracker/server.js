const http=require('http');
const app=require('./index');
require('dotenv').config();
const server=http.createServer(app);
server.listen(process.env.PORT,(error)=>{
    if(!error)
    {
        console.log(`Server is running on Host ${process.env.HOST} and  Port No. ${process.env.PORT}`)
    }
    else
        console.log("Server initialing in failed");
})