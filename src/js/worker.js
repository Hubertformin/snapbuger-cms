var Dexie = require('dexie'),
    db,
    orders = [],
    users = [],
    products = {
        categories: [],
        items: []
    },
    settings = [];
//run in catch should in case databse dose not exits
try {
    db = new Dexie("snapBurgerDb");
    db.version(1).stores({
        users: "++id,name,password,position,startDate,salary,status,is_mgr,img_url",
        categories: "++id,name,status,action",
        items: "++id,name,rate,category,status,action",
        orders: "++id,name,date,*items,totalPrice,totalQuantity,staff",
        settings: "&id,tableNumber,time_range,auto_update,back_up,performance_report"
    })
} catch (e) {
    //
}

//fetching database
function fetchDatabase() {
    return new Promise((resolve,reject)=>{
        db.transaction('r', db.users, db.orders, db.categories, db.items, db.settings, () => {
            db.settings.get(1)
                .then((res) => {
                    settings = res;
                })
            db.users.toArray()
                .then((data) => {
                    users = data;
                });
            //fetched users and now fetching categories
            db.categories.toArray()
                .then((data) => {
                    products.categories = data;
                })
            //fetcing items
            db.items.toArray()
                .then((data) => {
                    products.items = data;
                })
            //fetching orders
            db.orders.toArray()
                .then((data) => {
                    orders = data;
                })
        })
        .then((data) => {
            //code to write when fetching of database succedeed!
            resolve();
        })
        .catch(err => {
            reject(err);
        })
    })
}

function checkTimeRange() {
    try {
        db.settings.get(1)
            .then((data) => {
                try {
                    from_time = data.time_range.from.split(":"),
                        to_time = data.time_range.to.split(":"),
                        d = new Date();
                    //send notifications in intervals of 5,10,15 mins
                    //var to_mins = new Date(`jQuery{d.toDateString()} jQuery{data.time_range.to}`);
                    //disable orders if time is less than time_range from time
                    if (d.getHours() > Number(to_time[0]) || d.getHours() == Number(to_time[0]) && d.getMinutes() >= Number(to_time[1])) {
                        postMessage("end-orders");
                    } else if (d.getHours() < Number(from_time[0]) || d.getHours() == Number(from_time[0]) && d.getMinutes() <= Number(from_time[1])) {
                        postMessage("end-orders");
                    } else {
                        postMessage("resume-orders");
                    }
                } catch (e) {
                    //console.log("empty!");
                }
            })
            .catch(e => {
                //
            })
    } catch (err) {
        console.log("Failed:" + err)
    } finally {
        return false;
    }
}
var checkTime = setInterval(checkTimeRange, 2500);

if (navigator.onLine) {
    console.log("Online");

} else {
    console.log("False");
}
//creating ajax functions,data must be an array
var ajax = ({url,data,dataType,type})=>{
    return new Promise((resolve,reject)=>{
        var status = false,data_array = [],data_string = "",req;
        if(type == null){
            type = 'GET';
        }
        if(dataType == null){
            dataType = 'text';
        }
        //data must be array, my method to serialize data
        for(x in data){
            for(i in Object.keys(data[x])){
                data_array.push(`${Object.keys(data[x])[i]}=${Object.values(data[x])[i]}`);
            }
            
        }
        data_string = data_array.join("&");
        //now rqueating
        req = new XMLHttpRequest();
        req.open(type,url,false);
        req.timeout = 20000;
        req.responseType = dataType;
        req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        req.onreadystatechange = ()=>{
            if(req.readyState === 4 && req.status === 200){
                resolve(req.response)
            }else{
                reject("Connection to server failed!");
            }
        }
        req.onerror = (err)=>{
            reject(err);
        }
        req.send(data_string);
        

    })

}

function syncDatabase() {
    fetchDatabase()
    .then(()=>{
        var url = 'http://localhost/snapburger_sync.php';
        var dbSend = [
            {table: "users",data: users},
            {table: "categories",data: products.categories},
            {table: "items",data: products.items},
            {table: "orders",data: orders},
            {table: "settings",data: settings}
        ]
        if(users.length == 0 && products.categories.length == 0 && products.items.length == 0 && orders.length == 0){
            dbSend = [{type:"fetchAll",db:""}]
        }else{
            dbSend = [{type:"push",db:JSON.stringify(dbSend)}];
        }
        //ajax
        ajax({url:url,dataType:'json',data:dbSend,type:"POST"})
        .then(data=>{
            console.log(data);
        })
        .catch(err=>{
            console.log(err);
        })
    })

     
}
//call sync fucntion
syncDatabase();
