const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const port = 5000;
// const { urlencoded } = require("body-parser");
const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://admin-sagayaraj:Raja%408939@cluster0.dwtonqe.mongodb.net/todolistDB", {useNewUrlParser : true});
const itemsSchema = {
    name : String,
}
const listSchema = {
    name : String,
    item : [itemsSchema]
}
const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
    name : "Welcome to your todolist"
});
const item2 = new Item({
    name : "Hit + button to add new item"
})
const item3 = new Item({
    name : "<-- click here to delete an item"
})

const defaultArray = [item1, item2, item3];



app.get('/', function(req,res){
    Item.find({}, function(err,foundItems){
        if(foundItems.length === 0){
            Item.insertMany([item1,item2,item3],function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Default items added");
                }
            })
            res.redirect('/'); 
        }else{
            res.render("list", {listItem : "Today", newItem : foundItems});
        }
    })
});

app.get('/:customListName',function(req,res){
    const customList = _.capitalize(req.params.customListName);
    List.findOne({name : customList}, function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name : customList,
                    item : defaultArray,
                })
                list.save();
                res.redirect('/'+customList);
            }else{
                res.render("list", {listItem : foundList.name, newItem : foundList.item});
            }
        }
 })

})
app.post('/', function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.button;

    const newItem = new Item({
        name : itemName
    })
    if (listName === "Today"){

        newItem.save();
        res.redirect('/');
    }else{
        List.findOne({name : listName},function(err,foundList){
            foundList.item.push(newItem);
            foundList.save();
            res.redirect('/'+listName);
        })
    }
})
app.post('/delete',function(req,res){
    const deleteID = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === 'Today'){
    // Item.deleteOne({_id : deleteID},function(err){           
        Item.findByIdAndRemove(deleteID, function(err){
            if(err){
                console.log(err)
            }else{
                console.log("Item with ID : "+deleteID+" is deleted")
            }
        });
        res.redirect('/');
    }else{
        List.findOneAndUpdate({name : listName},{$pull :{item : {_id : deleteID}}}, function(err, foundList){
            if(!err){
                res.redirect('/'+listName);
            }
        })
    }
})

app.get('/work', function(req,res){
    res.render("list", {listItem : "work list", newItem : workItem});
})

app.get('/about', function(req,res){
    res.render("about");
})

// app.listen(3000, function(){
//     console.log("app is started working on port 3000");
// }); 

app.listen(process.env.PORT || port, () => console.log("App is listening on port $(port)"));
