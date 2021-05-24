const router = require('express').Router();
const{MongoClient} = require('mongodb');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const nodeMailer = require('nodemailer');

const URL = process.env.dbURL || 'mongodb://localhost:27017';
const DB = 'usercreadentials';

const transporter = nodeMailer.createTransport({
    service:'gmail',
    auth: {
        user: 'amarparihar1359@gmail.com',
        pass: '7218867376'
    }
});

const mailOptions = {
    from: 'amarparihar1359@gmail.com', // sender address
    to: 'amarrajput1359@gmail.com', // list of receivers
    subject: 'Forgot password', // Subject line
    html: '<p>update ur password here</p>'// plain text body
  };

router.post('/login', async(req,res)=>{
    try {
        let client = await MongoClient.connect(URL);
        let db = client.db(DB);
        let data = await db.collection('users').findOne({email:req.body.email});
        console.log(data)
        if(data){
            let isValid = await bcrypt.compare(req.body.password,data.password)
            if(isValid){
               res.status(200).json({message:'Login Sucessfull'});
            }else{
                res.status(401).json({message:'Invalid Creadentials'});
            }

        }else{
            res.status(404).json({message:'user not registered'});
        }
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})

router.post('/register', async (req,res)=>{
    try {
        let client = await MongoClient.connect(URL);
        let db = client.db(DB);
        let data = await db.collection('users').findOne({email:req.body.email});
        if(!data){
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password,salt);
            req.body.password = hash;
            await db.collection('users').insertOne(req.body);
            res.status(200).json({message:'user registered sucessfully'});
            client.close();
        }else{
            res.status(404).json({message:'user already registered'});
        }
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post('/forgot-password', async(req,res)=>{
    try {
        let client = await MongoClient.connect(URL);
        let db = client.db(DB);
        let data = await db.collection('users').findOne({email:req.body.email});
        if(data){
            let randomString = randomstring.generate({length:10,charset:'alphabetic'});
            console.log(randomString);
            res.status(200).json({message:'string genrated' , randomString});
            const mailOptions = {
                from: 'amarparihar1359@gmail.com', // sender address
                to: data.email, // list of receivers
                subject: 'Forgot password', // Subject line
                html: (`<p>update ur password here <a href="https://resetpasswordserver.herokuapp.com">${randomString}</a> </p>`)// plain text body
              };

            transporter.sendMail(mailOptions , (err,info)=>{
                if(err) throw err;
                console.log(info);
            })

            
        }else{
            res.status(404).json({message:'Insert valid email address'});
        }
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/update-password', async(req,res)=>{
    try {
        let client = await MongoClient.connect(URL);
        let db = client.db(DB);
        let data = await db.collection('users').findOne({email:req.body.email});
      
        if(data.email){
            if(req.body.password == req.body.confirmPassword){
                let salt = await bcrypt.genSalt(10);
                let hash = await bcrypt.hash(req.body.password,salt);
                req.body.password = hash;
                
                await db.collection('users').findOneAndUpdate({email:req.body.email},{$set:{password:req.body.password}});
            res.status(200).json({message:'Password Updated'});
            }else{
                res.status(401).json({message:'Enter valid password'})
            }

        }else{
            res.status(404).json({message:'Enter valid email'})
        }
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


module.exports = router;