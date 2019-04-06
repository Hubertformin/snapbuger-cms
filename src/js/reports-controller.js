app.controller('reportsCtr',($scope, $filter)=>{
    //first thing, setting the sidenav link to active
    jQuery('.sideNavLink').removeClass('active');
    jQuery('#reportsLink').addClass('active');
    //loader...
    //intit
    angular.element("body").ready(()=>{
        $('.tabs').tabs();
        $('.datepicker').datepicker();
        $('.modal').modal();
    })
    /*jQuery('#reports-body').waitMe({
        effect:'rotateplane',
        bg:'#fff',
        color:"#444",
        text:"loading..."
    })*/

    //principal object and vars
    $scope.REPORTS =  {
        categorical:[],
        filter:{
            all:{number:0, amount:0},
            completed:{number:0, amount:0},
            unCompleted:{number:0, amount:0}
        },
        orders:[],
        date_range:"today",
        users_activity:[]
    };
    //the current filter date
    $scope.FILTER_DATE = "today";

    //in page functions
    $scope.toDate = (dt) => {
        return `${dt.toDateString()} at ${dt.getHours()}:${dt.getMinutes()}`
    };

    /**
     * 
     * @param {Object} startDate Start date 
     * @param {Object} endDate End date 
     */

    function generateReport(startDate, endDate) {
        return new Promise((resolve, reject)=>{
            //refixing dates
            startDate.setHours(0,0);
            endDate.setHours(23,59);
            //global data
            const report_data = {
                categorical:[],
                filter:{
                    all:{number:0, amount:0},
                    completed:{number:0, amount:0},
                    unCompleted:{number:0, amount:0}
                },
                orders:[],
                date_range:"",
                startDate:new Date().setHours(0,0),
                endDate:new Date().setHours(23,59),
                users_activity: $scope.users.map((el) => {
                    return {name: el.name,quantity:0, amount:0, orders:0}
                })
            };

            $scope.db.transaction('rw',$scope.db.categories, $scope.db.items,$scope.db.orders,()=>{
                //checking if they're orders in the selected date range
                $scope.db.orders.where("date").between(startDate, endDate,true,true).count().then(count => {
                    if (count === 0) {
                        jQuery("#no_records").fadeIn("fast");
                        return;
                    }
                    report_data.totalOrders = count;
                    jQuery("#no_records").fadeOut("fast");
                    //if not empty
                    report_data.startDate = startDate;
                    report_data.endDate = endDate;

                    jQuery('#orders_table_body').html('');
                    //setting the date range label
                    if (startDate.toDateString() !== endDate.toDateString())
                    {
                        report_data.date_range = `${startDate.toDateString()} - ${endDate.toDateString()}`;
                    }
                    else if ($scope.FILTER_DATE === "today")
                    {
                        //checking and setting to today
                        report_data.date_range = "Today";
                    }
                    else if ($scope.FILTER_DATE === "yesterday")
                    {
                        //checking for yesterday
                        report_data.date_range = "Yesterday";
                    } else {
                        report_data.date_range = startDate.toDateString();
                    }


                    $scope.db.categories.each((category)=>{

                        report_data.categorical.push({name:category.name,amount:0,quantity:0,items:[],date:(startDate.toDateString() !== endDate.toDateString())?`${startDate.toDateString()} - ${endDate.toDateString()}`:startDate.toDateString()});

                    }).then(()=>{
                        //After getting all categories, loop through orders to get sales

                        //iterating through orders
                        $scope.db.orders.where("date").between(startDate, endDate,true,true).each(order => {
                            //1.1 count total orders and get total Amount
                            report_data.filter.all.number += 1;
                            report_data.filter.all.amount += Number(order.totalPrice);
                            //filters
                            if (order.completed) {
                                report_data.filter.completed.number += 1;
                                report_data.filter.completed.amount += Number(order.totalPrice);
                            } else {
                                report_data.filter.unCompleted.number += 1;
                                report_data.filter.unCompleted.amount += Number(order.totalPrice);
                            }
                            //report_data.totalQuantity += Number(order.totalQuantity);

                            report_data.categorical.map((el) => {
                                order.items.forEach(item => {
                                    if (el.name === item.category) {
                                        //trying to reduce thesame items to one
                                        let e_index = -1;
                                        for (let i =0; i < el.items.length;i++) {
                                            if (el.items[i].name === item.name) {
                                                e_index = i;
                                            }
                                        }
                                        if (e_index > -1) {
                                            el.items[e_index].quantity += Number(item.quantity);
                                            el.items[e_index].price += Number(item.price);
                                        } else {
                                            el.items.push(item);
                                        }

                                        //doing common category summations
                                        el.amount += Number(item.price);
                                        el.quantity += Number(item.quantity);
                                    }
                                });
                            });

                            //interating through users to get data
                            report_data.users_activity.forEach((el) => {
                                if (el.name === order.waiter) {
                                    el.quantity += Number(order.totalQuantity);
                                    el.amount += Number(order.totalPrice);
                                    el.orders += 1;
                                }
                            });

                            //other orders iterable methods...
                            report_data.orders.push(order);

                        }).then(() => {
                            //console.log(report_data);
                        })
                    })
                })
            }).then(()=>{
                resolve(report_data);
            })
        })
    }

    generateReport(new Date(), new Date())
        .then((data) => {
            $scope.REPORTS = data;
            $scope.$apply();
            //console.log($scope.REPORTS)
        });

    //change custom dates
    $scope.openDateModal = ()=> {
        dateModal().open();
    };
    //its modal
    function dateModal() {
        return M.Modal.getInstance(jQuery("#date_modal"));
    }

    $scope.filterResult = (advanced = false, range = false) => {
        if (!advanced) {
            switch ($scope.FILTER_DATE) {
                case "today":
                    generateReport(new Date(), new Date())
                        .then((data) => {
                            $scope.REPORTS = data;
                            $scope.$apply();
                        });
                    break;
                case "yesterday":

                    const e_yesterday = new Date(), l_yesterday = new Date();
                    e_yesterday.setDate(e_yesterday.getDate() - 1);
                    l_yesterday.setDate(l_yesterday.getDate() - 1);
                    e_yesterday.setHours(0,0);

                    generateReport(e_yesterday, l_yesterday)
                        .then((data) => {
                            $scope.REPORTS = data;
                            $scope.$apply();
                        });
                    break;
                case "custom":
                    dateModal().open();
                    break;
            }
        } else {
            //section containing methods for modal filter
            $scope.FILTER_DATE = "custom";
            //if for single date
            if (!range) {
                //select date instance
                const single_date_instance = M.Datepicker.getInstance(jQuery('#single_date_instance'));
                //if single date selected is today
                if (single_date_instance.date.toDateString() === new Date().toDateString()) {
                    $scope.FILTER_DATE = "today";
                    $scope.filterResult(false, false);

                } else {
                    //if not today
                    const start = new Date(single_date_instance.date), end = single_date_instance.date;
                    generateReport(start, end)
                        .then((data) => {
                            $scope.REPORTS = data;
                            $scope.$apply();
                        });
                }
                dateModal().close();
            } else {
                //for multiple dates
                const start = M.Datepicker.getInstance(jQuery('#multiple_date_start')),
                end = M.Datepicker.getInstance(jQuery('#multiple_date_end'));
                generateReport(start.date, end.date)
                    .then((data) => {
                        $scope.REPORTS = data;
                        $scope.$apply();
                    });
                dateModal().close();
            }
        }
    };

    //delete order
    $scope.deleteOrder = (id) => {
        if(confirm("Are you sure you want to delete?")) {
            $scope.db.orders.delete(Number(id))
                .then(() => {
                    generateReport($scope.REPORTS.startDate, $scope.REPORTS.endDate).then((data) => {
                        $scope.REPORTS = data;
                        $scope.$apply();
                    })
                }).catch((err)=>{
                console.error(err);
                notifications.notify({msg:`Unable to delete order`,title:"Unknown error",type:"error"});
            })
        }
    };

    //show preview of items
    $scope.showPreviewItems = (index, master = false) => {
        if (!master) {
            $scope.showCurrentOrderPane = false;
            $scope.currentCategoryReport = $scope.REPORTS.categorical[index];
            jQuery('#preview-items').fadeIn('fast');
            //console.log($scope.currentCategoryReport)
        }  else {
            jQuery('#preview-items').fadeOut('fast');
        }
    };

    //show current order
    $scope.currentOrder = {};
    $scope.showCurrentOrderPane = false;

    //show specific orders
    $scope.showCurrentOrder = (e,id) => {
        if (jQuery(e.target).is('i.deleteOrderIcon') || jQuery(e.target).is('input') || jQuery(e.target).is('span.checkbox')) return;
        //getting order
        $scope.db.orders.get(id, (order) => {
            if (typeof order === undefined) {
                notifications.notify({title:"Record not found!", msg:"The order doesn't exist in database.",type:"error"});
                return;
            }
            $scope.showCurrentOrderPane = true;
            $scope.currentOrder = order;
            $scope.currentOrder.date = order.date.toDateString();
            $scope.$apply();
        })
    };

    //complete orders
    $scope.onCompleteOrders = (obj) => {
        if (obj.completed) {
            obj.completed = true;
            $scope.db.orders.put(obj).then(()=>{
                generateReport($scope.REPORTS.startDate, $scope.REPORTS.endDate).then((data) => {
                    $scope.REPORTS = data;
                    $scope.$apply();
                })
            });
        } else {
            if (confirm("Are you sure you want to uncheck? this can cause computation errors.")) {
                if (!$scope.currentUser.is_mgr) {
                    obj.completed = true;
                    notifications.notify({type:"error",title:"Operation failed!", msg:"You're not authorized to perform this operation"});
                    return;
                }
                //unchecking orders
                obj.completed = false;
                $scope.db.orders.put(obj).then(()=>{
                    generateReport($scope.REPORTS.startDate, $scope.REPORTS.endDate).then((data) => {
                        $scope.REPORTS = data;
                        $scope.$apply();
                    })
                });
            } else {
                obj.completed = true;
            }
        }
    }

});

function deleteOrder(event,index) {
    angular.element(jQuery("#reports")).scope().deleteOrder(event,index);
}

function showCurrentOrder(event,id) {
    angular.element(jQuery("#reports")).scope().showCurrentOrder(event,id);
}