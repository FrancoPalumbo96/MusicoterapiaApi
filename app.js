const pool = require('./db')
const express = require('express');
const cors = require('cors');
const port = process.env.PG_PORT /*|| 3000*/;
const app = express();
app.use(express.json());
app.use(cors());


//TODO check that is not taken
const idGenerator = () => {
//    return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    return Math.floor(100000 + Math.random() * 900000);
}


app.get('/createUser/:name', async (req, res) => {
    const userName = req.params.name;
    if(userName === undefined){
        res.send(400);
        return;
    }

    const userId = idGenerator();

    try {
        const text = 'INSERT INTO users (user_id, name) VALUES($1, $2)';
        const values = [userId, userName];

        await pool.query(text, values)

        res.send({
            user: userName,
            id: userId
        });
    } catch (err){
        console.error(err.message);
        res.sendStatus(400);
    }
});


app.post('/updateUserData', async (req, res) =>{
    try {
        const userId = req.body.id;
        const data = req.body.data;

        if(data === undefined || data.video === undefined || data.music === undefined || data.time === undefined){
            res.sendStatus(404);
            return;
        }

        //https://github.com/brianc/node-postgres/issues/1269
        let text = 'INSERT INTO full_user_records (video, music, playtime) VALUES($1, $2, $3) RETURNING record_id';
        let values = [data.video, data.music, data.time];

        const {rows} = await pool.query(text, values)
        const recordId = rows[0].record_id;

        text = 'INSERT INTO users_records (user_id, record_id) VALUES($1, $2) ';
        values = [userId, recordId];

        await pool.query(text, values)

        res.json({response: "ok"});
    } catch (err){
        console.error(err.message);
        res.sendStatus(400);
    }

});


app.get('/userData/:id', async (req, res) => {
    const userId = req.params.id;

    try{
        let text = 'SELECT full_user_records.video, full_user_records.music, full_user_records.playtime ' +
            'FROM full_user_records ' +
            'INNER JOIN users_records ON full_user_records.record_id = users_records.record_id ' +
            'INNER JOIN users ON users_records.user_id = users.user_id ' +
            'WHERE users.user_id = ' + userId + '';

        const {rows} = await pool.query(text)

        res.send(rows);
    } catch (err){
        console.error(err.message);
        res.sendStatus(400);
    }
});

app.get('/allUsersData', async (req, res) => {
    try{
        let text = 'SELECT users.name, users.user_id, full_user_records.music, full_user_records.video, full_user_records.playtime ' +
            'FROM full_user_records ' +
            'INNER JOIN users_records ON full_user_records.record_id = users_records.record_id ' +
            'INNER JOIN users ON users_records.user_id = users.user_id ';

        const {rows} = await pool.query(text);

        let rowsGroupByUser = []

        rows.forEach(r => {
            const rowId = r.user_id;
            const rowName = r.name;
            const user = rowsGroupByUser.find(x => x.user_id === rowId);
            const record = {
                "video": r.video,
                "music": r.music,
                "time": r.playtime
            }
            if (user !== undefined){
                user.records.push(record)
            } else {
                rowsGroupByUser.push({
                    "user_id": rowId,
                    "name": rowName,
                    "records": [
                        record
                    ]
                })
            }
        })


        res.send(rowsGroupByUser);
    } catch (err){
        console.error(err.message);
        res.sendStatus(400);
    }
});

app.get('/allUsers', async (req, res) => {
    try{
        const text = 'SELECT user_id, name ' +
            'FROM users ';
        const {rows} = await pool.query(text);
        res.send(rows);
    } catch (err){
        console.log(err.message);
        res.sendStatus(400);
    }
});

app.post('/deleteRecords', async (req, res) => {
    try {
        let text = 'DELETE FROM full_user_records';
        await pool.query(text)
        text = 'DELETE FROM users_records';
        await pool.query(text)
        res.sendStatus(200);
    } catch (err){
        console.error(err.message);
        res.sendStatus(400);
    }
});

app.post('/reset4', async (req, res) => {
    try {
        let text = 'DELETE FROM full_user_records';
        await pool.query(text);
        text = 'DELETE FROM users_records';
        await pool.query(text);
        text = 'DELETE FROM users';
        await pool.query(text);
        res.sendStatus(200);
    } catch (err){
        console.error(err.message);
        res.sendStatus(400);
    }
});



app.listen(process.env.PORT || port, () =>{
   console.log('Express API is running at port ' + port);
});



