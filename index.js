 const express = require('express')
const app = express()
const cors=require('cors')
require('dotenv').config()
const port = 3000
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken');
const authenticate=require('./utils')
const User=require('./models/user.model')
const Note=require('./models/note.model')


//  ! backend completed

app.use(express.json())
app.use(cors({
    origin :'*'
}));

app.get('/',(req,res)=>{
    res.json({message:'Hello'})
})


app.post('/create-account',async (req,res)=>{
    const {name,mail,password}=req.body;
    if(!name || !mail || !password){
        return res.status(400).json({error:true,message:'Missing fields'})
    }
    
    const isUser=await User.findOne({mail:mail})


    if(isUser){
        return res.status(400).json({message:'user already exists'});
    
    }
    else{
    const user=new User({
        name:req.body.name,
        mail,
        password
    })

    await user.save();

    const accessToken=jwt.sign({user},'gubbasir54kag64u5b4ba4s3i3kaG3u3pa3si',{
        expiresIn:'3600s'
    })

    return res.json({
        error:false,
        user,accessToken,
        message:"registration successfull"
    })
    }
})

app.post('/login',async(req,res)=>{
    const {mail,password}=req.body;
    if( !mail || !password){
        return res.status(400).json({error:true,message:'Missing fields'})
    }

    const isUser=await User.findOne({mail:mail});
   

    if(isUser && isUser.password==password)
    {
        const user={
            name:isUser.name,
            mail,
            password
        }
        const accessToken = jwt.sign(user,'gubbasir54kag64u5b4ba4s3i3kaG3u3pa3si',{
            expiresIn:'3600s'
        })

        return res.status(200).json({
            error:false,
            mail,
            message:'Login successfull',
            accessToken
        })
    }
    else{
       
        return res.json({ error:true,message:'Invalid credentials'})
    }
})

app.post('/add-note',authenticate,async(req,res)=>{
    const {title,content,isPinned}=req.body;
    
    let user=req.user;

     user= await User.findOne({mail:user.mail})

    


    if(!title || !content){
        return res.status(400).json({message:'Missing fields'})
    }
    
    const note= new Note({
        title,
        content,
        userId:user._id,
        isPinned
    })

    await note.save();

    return res.status(200).json({message:'Note added successfully',note});

})

app.get('/get-user',authenticate,async(req,res)=>{
    let user=req.user;

    console.log(user)

    user=await User.findOne({mail:user.mail});

    if(!user){
        return res.json({message:'NO user found'})
    }

    return res.json(user);

    
})

app.put('/edit-note/:noteId',authenticate,async(req,res)=>{
    const noteId=req.params.noteId;
    console.log(noteId)
    const {title,content,isPinned}=req.body;

    let user=req.user;

    user=await User.findOne({mail:user.mail});

    if(!title || !content || !noteId){
        return res.json({Message:'Invalid credentials'});
    }
    
    const note=await Note.updateOne({_id:noteId,userId:user._id},{$set:{title:title,content:content}});
    
    if(!note){
        return res.json({message:'No notes found'});
    }

    return res.json({
        error:false,
        note,
        message:"Updated successfully"
    })

})

app.get('/get-all-notes',authenticate,async(req,res)=>{
    let user=req.user;

     user= await User.findOne({mail:user.mail})

     if(!user){
        return res.json({message:'No user found'})
     }

     const userId=user._id;

     const notes= await Note.find({userId:userId}).sort({isPinned:-1});

     return res.status(200).json({message:'Success',notes})



     
})

app.delete('/delete-note/:noteId',authenticate,async(req,res)=>{
    const noteId=req.params.noteId;

    const note= await Note.findById(noteId);
    if(!note){
        return res.json({message:'Note doesnt exist'});
    }

    await Note.findByIdAndDelete(noteId);

    return res.json({message:'deleted successfully'})


})

app.put('/edit-note-pinned/:noteId',authenticate,async(req,res)=>{
    const noteId=req.params.noteId;
    let note= await Note.findById(noteId);

    note= await Note.updateOne({_id:noteId},{$set:{isPinned:!note.isPinned}});
    if(!note){
        return res.json({message:'Note doesnt exist'});
    }

    return res.json({message:'Updated',note})


})

app.post('/search-note',authenticate,async(req,res)=>{
    let user=req.user;
    const queryString = req.query.query;
console.log(queryString)

user = await User.findOne({mail: user.mail})
console.log(user)

if (!queryString) {
    return res.status(400).json({message: 'No query found'})
}

try {
   const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: queryString, $options: "i" } },
        { content: { $regex: queryString, $options: "i" } },
      ]
    });

    console.log(matchingNotes)
    return res.status(200).json({error: false, matchingNotes})
} catch (error) {
    return res.status(500).json({error})
}})




app.listen(port, () => {
    mongoose.connect(process.env.MONGO_DB)
    console.log(`listening on port ${port}...`)
})