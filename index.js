const { name } = require('ejs');
const express = require('express');

const mongoose = require('mongoose');

require('dotenv').config();


const _ = require('lodash');

const app = express();
mongoose.set('strictQuery', false);

const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://selenagomez21:99887711@todo.cbpcojh.mongodb.net/todolistDB');



// const bulid-in keyword work for array (push) ex: items.push(item); 
// const items = ["Ratheesh","Ruthvik","Rakesh"];

// workItem = ["shiva"] (const) it will not work;
// const workItem = [];
// instend using mongoose database to store items in the backend;

const itemTable = new mongoose.Schema({
    name : String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemTable]
})

const Item = mongoose.model("Item",itemTable);

const List = mongoose.model("List",listSchema);

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

const item1 = new Item ({
    name: "Ratheesh"
});

const item2 = new Item ({
    name: "Rakesh"
});

const item3 = new Item ({
    name: "Selena"
});

const defaultItem  = [item1, item2, item3];

app.get('/',(req,res)=>{
    
    Item.find()
    .then(itemsFound => {
        if(itemsFound.length === 0){
            Item.insertMany(defaultItem)
        }else{
            res.render("list", { listTitle: "TODAY", newListItems: itemsFound });
        }
    })
    .catch(err => {
        console.error(err);
        // handle the error
    }); 
})

app.get('/:topic', (req, res) => {
    const url = _.capitalize(req.params.topic);
    List.findOne({ name: url }).then(list => {
      if (!list) {
        const newList = new List({
            name: url,
            items: defaultItem
        });
        newList.save();
        res.redirect('/'+ url);
      } else {
        res.render('list', {listTitle: url, newListItems: list.items});
      }
    }).catch(err => {
      console.error(err);
      res.status(500).send("Error finding list");
    });
  });
  

app.post("/",(req,res)=>{

    let itemName = req.body.users;
    let listName = req.body.list;

    const item4 = new Item({
        name: itemName,
    });
    if(listName === "TODAY"){
        
        item4.save();
        res.redirect('/');
    }else{
        List.findOne({name : listName}).then(foundList => {
            foundList.items.push(item4);
            foundList.save();
            res.redirect('/' + listName);
        }).catch(err => {
            console.log(err);
        });   
    }    
});

app.post('/delete',(req,res)=>{
    const toDelete = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "TODAY"){
        Item.findByIdAndRemove(toDelete).then(foundList => {
            res.redirect('/');
        }).catch(err => {
            console.log(err);
        });
        
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: toDelete}}}).then(foundList => {
            res.redirect('/' + listName);
        }).catch(err => {
            console.log(err);
        })
    }
    
});



// app.get("/work",(req,res)=>{
//     res.render("list",{listTitle:"Work List",newListItems:workItem});
// });


app.listen(PORT,()=>{
    console.log('listening on port 3000');
});