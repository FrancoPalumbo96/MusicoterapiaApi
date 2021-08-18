class User {
    constructor(id, name){
        this._id = id;
        this._name = name;
        this._history = [];
        this._fullUserRecords = {};
    }

    set newData(record){
    
        this._history.push(record);

        const keys = [record.video, record.music];
        const value = this._fullUserRecords[keys];

        if(value == undefined){
            this._fullUserRecords[keys] = record.time;        
        } else {

            this._fullUserRecords[keys] = record.time + value;
        }
    }
}

class Record {
    constructor(video, music, time){
        this.video = video;
        this.music = music;
        this.time = time;
    }
}




const express = require('express');
const cors = require('cors');
const port = 3000;
const app = express();
app.use(express.json());
app.use(cors());


let users = [];

//TODO calls from unity

const idGenerator = () => {
    return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
}


app.get('/createUser/:name', (req, res) => {
    const userName = req.params.name;
    if(userName == undefined){
        res.send(400);
        return;
    }

    const userId = idGenerator();
    let user = new User(userId, userName);
    users.push(user);
    
    res.send({
        user: userName,
        id: userId
    });
});

app.post('/updateUserData', (req, res) =>{
    const userId = req.body.id;
    const data = req.body.data;

    const user = users.find(x => x._id == userId);

    if(user == undefined || data == undefined || data.video == undefined || data.music == undefined || data.time == undefined){
        res.sendStatus(404);
        return;
    }


    user.newData = new Record(data.video, data.music, data.time);
    res.json({response: "ok"});
});


app.get('/userData/:id', (req, res) => {
    const userId = req.params.id;

    if(userId == undefined){
        res.send(400);
        return;
    }

    const user = users.find(x => x._id == userId);

    if(user == undefined){
        res.sendStatus(404);
        return;
    }

    let data = {
        "history": user._history,
        "record": user._fullUserRecords
    };
    res.send(data);
});

app.get('/allUsersData', (req, res) => {
    res.send(users);
})



app.listen(process.env.PORT || port, (req, res) =>{
   console.log('Express API is running at port ' + port);
});



