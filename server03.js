var express = require("express")
var app = express()
const PORT = 3000;
var path = require("path")
app.use(express.static("static"));
var hbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.engine('hbs', hbs({
    extname: '.hbs',
    partialsDir: "views/partials",defaultLayout: 'main.hbs' ,
    helpers: {
        keynameIsID: function(keyname){
            return keyname == "_id";
        }
    }
}));
app.set('view engine', 'hbs'); 
let context = {};
const Datastore = require('nedb');
const e = require("express");

const coll1 = new Datastore({
    filename: 'kolekcja2.db',
    autoload: true
});



var carAttributes = [
    {"name":"ubezpieczony", "label": "Ubezpieczony"},
    {"name":"benzyna", "label": "Benzyna"},
    {"name":"uszkodzony", "label": "Uszkodzony"},
    {"name":"naped", "label": "Napęd 4x4"}
]
context.carAttributes = carAttributes;
coll1.find({ }, function (err, docs) {
    context.db = docs
});
app.get("/", function(req, res){
    coll1.find({ }, function (err, docs) {
        context.db = docs
        res.render("index.hbs", context);
    });
});
app.get("/deleteUser", function(req, res){
    coll1.remove({ _id:req.query.id }, {}, function (err, numRemoved) {
        console.log("usunięto dokumentów: ",numRemoved)
        coll1.find({ }, function (err, docs) {
            context.db = docs
            res.render("index.hbs", context);
        });
    });
});
app.get("/addUser", function(req, res){
    var doc = {};
    carAttributes.forEach(attribute => {
        doc[attribute.name] = req.query[attribute.name] ? "TAK" : "NIE";
    });
    coll1.insert(doc, function (err, newDoc) {
        coll1.find({ }, function (err, docs) {
            context.db = docs
            res.render("index.hbs", context);
        });
    });
});
app.get("/editUser", function(req, res){
    let editID = req.query.id;
    context.db.forEach(element => {
        console.log(element["_id"] == editID)
        if(element["_id"] == editID){
            element.editID = true;
        }else{
            element.editID = false;
        }
        console.log(element)
    });
    coll1.find({ }, function (err, docs) {
        res.render("indexEdit.hbs", context);
    });
});
app.get("/handleEdit", function(req, res){
    let doc = {}
    console.log(req.query)
    carAttributes.forEach(attribute => {
        doc[attribute.name] = req.query[attribute.name];
    });
    console.log(doc)
    coll1.update({ _id: req.query.id }, { $set: doc }, {}, function (err, numUpdated) {
        console.log("zaktualizowano " + numUpdated)
        coll1.find({ }, function (err, docs) {
            context.db = docs
            res.render("indexEdit.hbs", context);
        });
     });
});

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT )
})