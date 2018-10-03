function checkTimeRange() {
    try {
        var Dexie = require('dexie'),
            db = new Dexie("snapBurgerDb");
            db.version(1).stores({
                users:"++id,name,password,position,startDate,salary,status,is_mgr,img_url",
                categories:"++id,name,status,action",
                items:"++id,name,rate,category,status,action",
                orders:"++id,name,date,*items,totalPrice,totalQuantity,staff",
                settings:"&id,tableNumber,time_range,auto_update,back_up,performance_report"
            })
            db.settings.get(1)
            .then((data) => {
                from_time = data.time_range.from.split(":"),
                    to_time = data.time_range.to.split(":"),
                    d = new Date();
                //send notifications in intervals of 5,10,15 mins
                //var to_mins = new Date(`${d.toDateString()} ${data.time_range.to}`);
                //disable orders if time is less than time_range from time
                if (d.getHours() > Number(to_time[0]) || d.getHours() == Number(to_time[0]) && d.getMinutes() >= Number(to_time[1])) {
                    postMessage("end-orders");
                } else if (d.getHours() < Number(from_time[0]) || d.getHours() == Number(from_time[0]) && d.getMinutes() <= Number(from_time[1])) {
                    postMessage("end-orders");
                } else {
                    postMessage("resume-orders");
                }
            })
    } catch (err) {
        console.log("Failed:" + err)
    } finally {
        return false;
    }
}
var checkTime = setInterval(checkTimeRange,2500);
