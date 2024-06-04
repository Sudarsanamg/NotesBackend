
const jwt=require('jsonwebtoken')

function authenticate(req,res,next){
        const authHeader=req.headers['authorization']
        const token=authHeader && authHeader.split(' ')[1]
        if(token==null){
            return res.sendStatus(401)
        }
        jwt.verify(token,'gubbasir54kag64u5b4ba4s3i3kaG3u3pa3si',(err,user)=>{
            if(err){
                return res.sendStatus(403)
            }
            req.user=user
            next()
        })
}

module.exports=authenticate