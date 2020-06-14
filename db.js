const dotenv=require('dotenv')
dotenv.config()
const mongodb=require('mongodb');
mongodb.connect(process.env.connectionstring , {useNewUrlParser: true, useUnifiedTopology: true}, function(error,client){

   module.exports=client
   const app=require('./app');
   app.listen(process.env.port)


})