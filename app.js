//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {

await mongoose.connect('mongodb://localhost:27017/todos');

const itemsSchema = new mongoose.Schema({
  item: String
});

const customScama = new mongoose.Schema({
  listName:String,
  list:[]
});

const CustomItem = mongoose.model("CustomItem",customScama);

const Item = mongoose.model("Item",itemsSchema);

const i1 = new Item({ item: 'Enter New Item' });
const i2 = new Item({ item: 'Then Press + icon' });

let todoItems = await Item.find();

if (todoItems.length === 0){
  Item.insertMany([i1,i2],function(err){
    if(err){
      console.log(err);
    }else{
      console.log("successfully added two item");
    }
  });
}





const day = date.getDate();

app.get("/", async function(req, res) {


  todoItems = await Item.find();
  // let todoItemList = [];
  // todoItems.forEach(function(item){
  //
  // })
  res.render("list", {listTitle: day, newListItems: todoItems});

});

app.post("/", async function(req, res){

  const item = req.body.newItem;
  const title = req.body.list;

  if (req.body.list !== day) {
    let listData =  await CustomItem.findOne({listName:title});
    let oldList = listData.list;
    console.log(oldList);
    let updatedList = oldList.push(item);
    console.log(updatedList);
    await CustomItem.deleteOne({ listName: title } );
    let updatedData = new CustomItem({listName: title, list: updatedList });
    await updatedData.save();
    res.redirect("/"+title);
  } else {
    const newItem = new Item({ item: item });
    newItem.save();
    res.redirect("/");
  }
});

app.get("/:newList", async function(req,res){
  let listName = req.params.newList;
  let listData =  await CustomItem.findOne({listName:listName});

  if (listData.length === 0) {
    const newEntry = new CustomItem({ listName: listName, list:[] });
    await newEntry.save();
    listData =  await CustomItem.find({listName:listName});
  }

  let workItems = listData.list;
  res.render("list", {listTitle: req.params.newList, newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", async function (req, res){
  const pressedItem = req.body.checkedItem;
  console.log(pressedItem);
  await Item.deleteOne({ _id: pressedItem });
  res.redirect("/");
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
}
