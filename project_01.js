const express = require('express');

const app = express()
const port = 8000;

const users = require('./MOCK_DATA.json');

app.get('/',(req,res) => {
    res.send('This Users HomePage');
})
app.get('/users',(req,res) => {
    const html = `<ul>${users.map(user => `<li>${(user.first_name)}</li>`).join("")}</ul>`;
    return res.send(html);
    });

app.get('/api/users',(req,res) => {
    console.log(req.headers)
    res.setHeader('X-myName','Sunil Parmar'); //custom header represent by X
    return res.send(users);
})

// app.get('/api/users/:id',(req,res) => {
//     const id = +(req.params.id);
//     // console.log(id)
//     const user = users.find(user => user.id === id);
//     return res.json(user);
// })

// app.post('/api/users',(req,res) => {
//     // todo Create New User
//     return res.json({status:'pending'});
// });

//post data with postman because browser only get the data
// create middleware 
app.use(express.urlencoded({extended: false}))

app.use((req,res,next)=> {
    console.log('middleware is active 1');
    // res.json({msg:'middleware is active'});
    req.result = 'sunil parmar'
    next()
});

app.use((req,res,next)=> {
    console.log('middleware is active 2');
    // res.json({msg:'middleware is active'});
    console.log(req.result);
    next()
});

app.use((req,res,next)=> {
    console.log('middleware is active 3');
    // res.json({msg:'middleware is active'});
    fs.appendFile('./test.txt',`${Date.now()} ${req.method} ${req.path} ${req.ip}\n`,(err,data) => {
        next()
    })
});
// require fs module
const fs = require('fs');

app.post('/api/users',(req,res) => {
    const body = req.body;
    console.log(body);// first body is undifined because body needs middleware
    if(!body || !body.first_name || !body.last_name|| !body.email || !body.gender || !body.job_title ){
        res.status(400).json({msg:'Required all fields'})
    }
    users.push({id:users.length+1,...body});
    fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err,data)=> {
        return res.status(201).json({status:'success',id:users.length});
    })
});

// app.patch('/api/users/:id',(req,res) => {
//     // todo edit the user with id 
//     return res.json({status:'pending'})
// });

// app.delete('/api/users/:id',(req,res) => {
//     // todo delete the user with id 
//     return res.json({status:'pending'})
// });

// Merge in one route

app.route('/api/users/:id')
.get((req,res) => {
    const id = +(req.params.id);
    const user = users.find(user => user.id === id);
    if(!user){
        res.status(404).json({msg:'User not Found   '})
    }
    return res.json(user);
})      
.patch((req,res)=>{
    // console.log(typeof(req.params.id))
    const id = +(req.params.id)
    const body = req.body;
    const userIdx = users.findIndex(user => user.id === id);
    users[userIdx] = {...users[userIdx],...body}
    fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err,result) => {
        return res.json({status:'Updated your Data'});
    });
})
.delete((req,res) => {
    const id = +req.params.id;
    console.log(id);
    const userIdx = users.findIndex(user => user.id === id);
    // users.pop(users[userIdx]) // this throw my countinusly delete my records
    if(userIdx !== -1){
        users.splice(userIdx,1);
    }
    fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err, data)=> {
        return res.json ({status: 'User has been Deleted'});
    })
})
app.listen(port,() => {
    console.log(`Server is Started!!\n localhost: ${port}`);
})