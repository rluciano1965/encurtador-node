const express = require("express")

const app = express()

app.listen(3000, () => {
    console.log("Server started (http://localhost:3000/) !")
});

app.set("view engine", "ejs")

const path = require("path")

const bodyParser = require('body-parser')

app.set("views", path.join(__dirname, "views"))

app.use(express.static(path.join(__dirname, "public")))

app.use(express.urlencoded({ extended: false }))

const swaggerUi = require('swagger-ui-express')

const sqlite3 = require("sqlite3").verbose()

const db_name = path.join(__dirname, "data", "urls.db")
/**
 * 
 * 
 * 
 */
const db = new sqlite3.Database(db_name, err => {
    if (err) {
        return console.error(err.message)
    }
    console.log("Conexão feita com sucesso à base 'urls.db'")
});

var shortUrl = require('node-url-shortener')

const sql_create = `CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original VARCHAR(100) NOT NULL,
    encurtada VARCHAR(100) NOT NULL,
    data_inclusao VARCHAR(11)
  );`;

db.run(sql_create, err => {
    if (err) {
        return console.error(err.message)
    }
});


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/documentacao", (req, res) => {
    res.render("documentacao");
});

app.get("/urls", (req, res) => {

    if(req.query.data_inclusao){
        var sql = "SELECT * FROM urls WHERE data_inclusao = ?"
    }else{
        var sql = "SELECT * FROM urls"
    }
    
    console.log(sql)
    
    db.all(sql, req.query.data_inclusao, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("urls", { model: rows });
    });
});

app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM urls WHERE id = ?";
    db.get(sql, id, (err, row) => {
        // if (err) ...
        res.render("edit", { model: row });
    });
});

app.post("/edit/:id", (req, res) => {

    shortUrl.short(req.body.original, function (err, url) {
        const id = req.params.id;
        const urldata = [req.body.original, url, req.body.data_inclusao, id];
        const sql = "UPDATE urls SET original = ?, encurtada = ?, data_inclusao = ? WHERE (id = ?)";
        db.run(sql, urldata, err => {
            if(err){
                console.log(err)
            }
            res.redirect("/urls");
        });
    });

});

// GET /create
app.get("/create", (req, res) => {
    res.render("create", { model: {} });
});

// POST /create
app.post("/create", (req, res) => {

    shortUrl.short(req.body.original, function (err, url) {
        
        const urldata = [req.body.original, url, req.body.data_inclusao];
        const sql = "INSERT INTO urls (original, encurtada, data_inclusao) VALUES (?, ?, ?)";
        db.run(sql, urldata, err => {
            if(err){
                console.log(err)
            }
            res.redirect("/urls");
        });
    });

});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM urls WHERE id = ?";
    db.get(sql, id, (err, row) => {
        if(err){
            console.log(err)
        }
        res.render("delete", { model: row });
    });
});

//POST /delete
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM urls WHERE id = ?";
    db.run(sql, id, err => {
        if(err){
            console.log(err)
        }
        res.redirect("/urls");
    });
});

