//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")



mongoose.connect("mongodb+srv://admin-nevin:j0hncenation@cluster0.4rokdi6.mongodb.net/todolistDB")


const app = express();


const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Hello Welcome to your todolist"
})



const allItems = [item1]

const listSchema = {
  name: String,
  items : [itemSchema]
}

const List = mongoose.model("List", listSchema);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//HOMEPAGE
app.get("/", function(req, res) {
  Item.find({}, (err, items)=>{
    if(items.length === 0){
      Item.insertMany(allItems, (err) => {
        if(err){
          console.log(err);
        }else{
          console.log('Successfully added to Database');
        }
      });
        res.redirect("/")
    }else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }  
  })
 
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save()
    res.redirect("/")
  }else {
    List.findOne({name: listName}, (err, result) => {
      result.items.push(item);
      result.save();
      res.redirect("/" + listName)
    })
  }

  
});


app.post("/delete", function(req, res){
  const checkedBox = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedBox, (err) => {
      if(err){
        console.log(err);
      }else {
        res.redirect("/")
      }
    })
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedBox}}}, (err, result) => {
      if (!err){
        res.redirect("/" + listName)
      }
    })
  }

  
})

//CUSTOM ROUTE 
app.get("/:custListName", (req, res)=>{
  const customListName = _.capitalize(req.params.custListName);

  List.findOne({name: customListName}, (err, result)=> {
    if(result){
      res.render("list", {listTitle: result.name, newListItems: result.items});
    }else {
      const list = new List({
        name: customListName,
        items: allItems
      })
      list.save();
      res.redirect(customListName)
    }
  })


  
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// PORT NAME
app.listen(port, function() {
  console.log("Server started Successfully");
});
