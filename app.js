const express = require("express");
const path = require("path");
const mysql = require("mysql");

const app = express();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'root',
    port: 8889,
    database: 'users_db'
});

const viewsPath = path.join(__dirname, '/views');

app.set('view engine', 'hbs');
app.set('views', viewsPath);

app.use(express.urlencoded());
app.use(express.json());

db.connect((error) => {
    if(error){
        console.log(error);
    } else {
        console.log('MySQL connected')
    }
});

app.get("/", (req, res) => {
    db.query('SELECT * FROM users', (error, results) => {
        console.log(results);
        res.render("index", {
            users: results
        });
    });
});

app.get('/register', (req, res) => {
    res.render('register');
})

app.post("/registerUser", (req, res) => {

    let username = req.body.user_name;
    let email = req.body.email;
    let password = req.body.password;
    let password2 = req.body.password2;

    db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
        if(results.length > 0){
            res.render('register', {
                message: 'Email is taken'
            })
        } else if (password !== password2){
            res.render('register', {
                message: 'Passwords do not match'
            })
        } else {
            db.query('INSERT INTO users SET ?',
            {user_name: username, email: email, password: password}, (error, results) => {
                if(error) {
                    res.render("register",{
                        message: "Sorry there was an error"
                    })
                } else{
                    res.render("register",{
                        message: "User registered"
                    })
                }
            });
        }
    })
});

app.get('/update', (req, res) => {
    res.render('update');
})

app.get("/update/:id", (req, res) => {

    let id = req.params.id;

    let sql = "SELECT * FROM users WHERE id = ?";
    let user = [id];

    db.query(sql, user, (error, results) => {
        console.log(results);
        res.render("update", {
            updateUsers: results
        });
    });
});

app.post("/update/:id", (req, res) => {
    console.log(req.params.id);
    console.log(req.body.username);

    let name  = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    // let newPassword = req.body.newPassword;
    // let confPassword = req.body.confirmPassword;
    let id = req.params.id;

    let user = [name, email, id];

    db.query( 'UPDATE users SET user_name = ?, email = ? WHERE id = ?', user, (error, results) => {
        if(error) {
            console.log(error);
            res.render("update", {
                umessage: "There was an error updating your user"
            })
        } else {
            res.render("update", {
                umessage: "User updated"
            })
        }
    })
});

app.post("/update/password/:id", (req, res) => {

    let password = req.body.password;
    let newPassword = req.body.newPassword;
    let confPassword = req.body.confirmPassword;
    let id = req.params.id;

    let user = [confPassword, id];

    db.query( 'UPDATE users SET password = ? WHERE id = ?', user, (error, results) => {
        if(error) {
            console.log(error);
            res.render("update", {
                umessage: "There was an error updating your user"
            })
        } else if (password == password && newPassword == confPassword){
            res.render("update", {
                umessage: "Password updated"
            })
        } else if (password !== password){
            res.render("update", {
                umessage: "Password is incorrect"
            })
        } else if (newPassword !== confPassword){
            res.render("update", {
                umessage: "Passwords do not match"
            })
        }
    })
});

app.post("/:id", (req, res) => {
    let id = req.params.id;

    let sql = 'DELETE FROM users WHERE id = ?';
    let user = [id];

    db.query( sql, user, (error, results) => {
        if(error) {
            console.log(error);
            res.render("index", {
                dmessage: "There was an error deleting"
            })
        } else {
            res.render("index", {
                dmessage: "User deleted"
            })
        }
    })
});

app.listen(3000, () => {
    console.log("Server is running on Port 3000");
})