//listen for messages
self.onmessage = (e)=>{
    switch(e.data){
        case 'check-for-backup':
            syncDatabase('fetchAll')
            .then(obj=>{
                if(obj.data.orders.length == 0 
                 && obj.data.categories.length == 0 
                 && obj.data.items.length == 0 
                 && obj.data.users.length == 0)
                 {
                     postMessage('no-data');
                 }else{
                    implementUpdates(obj)
                    .then(data=>{
                        postMessage(data);
                    })  
                 }
            })
            .catch(err=>{
                postMessage('err-connect');
            })
        break;
        case 'check-file-backup':
            readDBFile()
            .then((data)=>{
                updateDBFromFile(data)
                .then(msg=>{
                    postMessage('data-restored');
                }).catch(err=>{
                    console.error(err);
                })
            })
            .catch((err)=>{
                postMessage('err-file-backup');
            })
            break;
            case 'update-db-file':
                fetchDatabase()
                .then(data=>{
                    saveToDBFile(data).then(data=>{
                        //console.log(data)
                    }).catch(err=> console.log(err));
                })
                .catch((err)=>{
                    console.err(err);
                })
            break;
            case 'get-daily-reports':
                getDailyData().then((data)=>{
                    postMessage(JSON.stringify({type:'daily-reports',reports:data}));
                })
            break;
            case 'get-reports':
            var v = {
                products: {
                    items: [],
                    category: []
                },
                sales: [],
                users: [],
                withdrawals: []
            }
            fetchDatabase().then((res)=>{
                v.users = res[0].data;
                v.products.category = res[1].data;
                v.products.items = res[2].data;
                v.sales = res[3].data;
                v.withdrawals = res[5].data;
                postMessage(JSON.stringify({type:'overall-reports',reports:v}));
            })
            break;
    }
}
const Dexie = require('dexie');
    var db,
    orders = [],
    users = [],
    products = {
        categories: [],
        items: [],
        orderCategory:[]
    },
    settings = [],
    withdrawals =  [];
    settings = {};
//run in catch should in case databse dose not exits
try {
    db = new Dexie("snapBurgerDb");
    db.version(1).stores({
        users: "++id,&name,password,position,startDate,salary,status,is_mgr,img_url",
        categories: "++id,&name,status,action",
        items: "++id,&name,rate,category,status,action",
        orders: "++id,inv,date,*items,totalPrice,tableNum,totalQuantity,staff",
        settings: "&id,tableNumber,time_range,auto_update,back_up,performance_report,os_name",
        withdrawals:"++id,inv,reason,amount,date",
        tracker:"++id,type,tableName,data,date,status"
    })
    db.version(2).stores({
        items: "++id,&name,rate,category,status,action,orderCategory",
        orders: "++id,&inv,date,*items,totalPrice,tableNum,totalQuantity,staff,completed",
        orderCategory:"++id,&name",
        reportsDate:"&id,startDate, endDate",
        settings: "&id,tableNumber,time_range,auto_update,back_up,performance_report,app_id, host_url,host, print_extra,language",
        itemSync:"state",
    })
} catch (e) {
    //
}

//fetching database
function fetchDatabase() {
    return new Promise((resolve,reject)=>{
        db.transaction('r', db.users, db.orders, db.categories, db.items, db.settings,db.withdrawals,db.settings,db.orderCategory, () => {
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
            db.withdrawals.toArray()
                .then((data)=>{
                    withdrawals = data;
                });
            db.orderCategory.toArray()
                .then((data) => {
                    products.orderCategory = data;
                })
        })
        .then(() => {
            //DO NOT CHANGE ORDER OF THIS ARRAY, OTHER FUNCTIONS DEPEND ON IT!!!!!!!!!!!!
            var data = [
                {table: "users",data:users},
                {table: "categories",data: products.categories},
                {table: "items",data: products.items},
                {table: "orders",data: orders},
                {table: "settings",data: settings},
                {table: "withdrawals",data: withdrawals},
                {table:"orderCategory", data: products.orderCategory}
            ]
            //code to write when fetching of database succedeed!
            resolve(data);
        })
        .catch(err => {
            reject(err);
        })
    })
}

//function get pos data

function checkTimeRange() {
    try {
        db.settings.get(1)
            .then((data) => {
                try {
                    from_time = data.time_range.from.split(":"),
                        to_time = data.time_range.to.split(":"),
                        d = new Date();
                    //send notifications in intervals of 5,10,15 mins
                    var end_time = new Date(`${d.toDateString()} ${data.time_range.to}`),
                    diff = Math.ceil((end_time.getTime() - d.getTime())/60000);
                    if(diff <= 15){
                        if(diff> 0 && (diff)%5 == 0){
                            postMessage(JSON.stringify({type:"end-orders-alert",min:diff}))
                        }
                    }
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
        req.timeout = 60000;
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
function syncDatabase(type = null) {
    return new Promise((resolve,reject)=>{
        fetchDatabase()
        .then((data)=>{
            var url = 'http://localhost/snapburger_sync.php';
            var dbSend = data
            if(type== 'fetchAll'){
                dbSend = [{type:"fetchAll",db:""}]
            }else{
                dbSend = [{type:"push",db:JSON.stringify(dbSend)}];
            }
            //ajax
            ajax({url:url,dataType:'json',data:dbSend,type:"POST"})
            .then(data=>{
                resolve(data);
            })
            .catch(err=>{
                reject(err);
            })
        })
    })
}
//call sync fucntion


function implementUpdates({method,data}){
    return new Promise((resolve,reject)=>{
        switch(method){
            case 'addAll':
            db.transaction('rw',db.orders,db.categories,db.items,db.users,db.withdrawals,()=>{
                //adding orders if length is greater than 0 ,and doing the same for the rest
                if(data.orders.length > 0){
                    data.orders.forEach(el=>{
                        el.totalQuantity = Number(el.totalQuantity);
                        el.totalPrice = Number(el.totalPrice);
                        el.date = new Date(el.date);
                        el.items.forEach(it=>{
                            delete it.$$hashKey;
                            it.quantity = Number(it.quantity);
                        })
                    })
                    db.orders.bulkAdd(data.orders);
                }
                if(data.categories.length>0){
                    db.categories.bulkAdd(data.categories);
                }
                if(data.items.length>0){
                    data.items.forEach(el=>{
                        el.rate = Number(el.rate);
                    })
                    db.items.bulkAdd(data.items);
                }
                if(data.users.length>0){
                    data.users.forEach(el=>{
                        el.is_mgr = (Number(el.is_mgr) == 1)?true:false;
                        el.salary = Number(el.salary);
                    })
                    db.users.bulkAdd(data.users);
                }
                if(data.withdrawals.length>0){
                    data.withdrawals.forEach(el=>{
                        el.date = new Date(el.date);
                        el.amount = Number(el.amount);
                    })
                    db.withdrawals.bulkAdd(data.withdrawals);
                }
            })
            .then(()=>{
                resolve('data-restored');
            })
            .catch(err=>{
                reject(err);
            })
            
            break;
        }
    })
}

/*setTimeout(()=>{
    fetchDatabase()
    .then(data=>{
        saveToDBFile(data).then(data=>console.log(data)).catch(err=> console.log(err));
    })
},5000)*/
//functions update file and read file...
function saveToDBFile(data){
    return new Promise((resolve,reject)=>{
        var fs = require('fs');
        const file = JSON.stringify(data);
    fs.writeFile('config.sb.json', file, function (err) {
        if (err){
            reject(err);
        }else{
            resolve('saved');
        }
    });
    })
    
}
function readDBFile(){
    return new Promise((resolve,reject)=>{
        var fs = require('fs');
    fs.readFile('config.sb.json', function(err, data) {
        if(err){
            reject(err);
        }else{
            if(data.length == 0){
                reject('no-data')
            }else{
                var file = JSON.parse(data);
               resolve(file);
            }
        }
      });
    })
}

//update DB from file 
function updateDBFromFile(data){
    return new Promise((resolve,reject)=>{
        db.transaction('rw',db.orders,db.users,db.categories,db.items,db.withdrawals,db.settings,db.orderCategory,()=>{
            data.forEach(el=>{
                switch(el.table){
                    case 'users':
                        db.users.bulkAdd(el.data);
                    break;
                    case 'orders':
                        el.data.forEach(dt=>{
                            dt.date = new Date(dt.date);
                        })
                        db.orders.bulkAdd(el.data);
                    break;
                    case 'categories':
                        db.categories.bulkAdd(el.data);
                    break;
                    case 'items':
                        db.items.bulkAdd(el.data);
                    break;
                    case 'withdrawals':
                        el.data.forEach(dt=>{
                            dt.date = new Date(dt.date);
                        })
                        db.withdrawals.bulkAdd(el.data);
                    break;
                    case 'settings':
                        db.settings.put(el.data);
                    break;
                    case 'oderCategory':
                        db.orderCategory.put(el.data);
                        break;
                }
            })
        })
        .then(()=>{
            resolve('Succesfully added!');
        })
        .catch((err)=>{
            reject(err);
        })
    })

}

//get current data 
function getDailyData() {
    return new Promise((resolve,reject)=>{
        var d = new Date();
        var v = {
            sales: [],
            users: [],
            withdrawals: []
        }
        fetchDatabase()
            .then(resp=>{
                v.users = resp[0].data;
                //getting orders of only today
                resp[3].data.forEach(el=>{
                    if(el.date.toDateString() === d.toDateString()) {
                        v.sales.push(el);
                    }
                })
                //withdrawals
                resp[5].data.forEach(el=>{
                    if(el.date.toDateString() === d.toDateString()) {
                        v.withdrawals.push(el);
                    }
                })
                resolve(v);        
        }).catch(()=>reject());
    })
}
