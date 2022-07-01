

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// const listInputs = ["Buy Food","Cook Food", "eat Food"];
// const workItems = [];

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://sainiutkarsh01:Utkarsh2020@cluster0.ofulu7w.mongodb.net/todolistDB");

const listInputSchema = {
  name: String
}

const ListInput = mongoose.model("ListInput", listInputSchema);

const listInput1 = new ListInput({
  name: "Welcome to today's to do list"
});

const listInput2 = new ListInput({
  name: "Hit the + button to add a new item."
});

const listInput3 = new ListInput({
  name: "Hit the checkbox to delete an item"
});

const defaultListInputs = [listInput1, listInput2, listInput3];

const listSchema = {
  name: String,
  items: [listInputSchema]
}

const List = mongoose.model("List", listSchema);



app.get("/",function(req, res){

  ListInput.find({}, function(err, foundInputs){

    if(foundInputs.length === 0){
      ListInput.insertMany(defaultListInputs, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Data Inserted");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundInputs});
    }

  });

});

app.post("/",function(req,res){
  const listInputName = req.body.newItem;
  const listName = req.body.list;

  const listInput = new ListInput({
    name: listInputName
  });

  if(listName === "Today"){
    listInput.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(listInput);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});


app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    ListInput.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


});

app.get("/:customListName", (req,res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultListInputs
        });


        list.save();
        res.redirect("/" + customListName);
      } else {

        // Show An existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });

});







// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.post("/work", function(req, res){
//   let item = req.body.newItem;
//   workItems.push(item);
// });
//
//
// app.get("/about", function(req,res){
//   res.render("about");
// });


app.listen(process.env.PORT || 3000, function(){
  console.log("Server is listening at port 3000");
});
