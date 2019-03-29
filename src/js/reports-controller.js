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
        totalOrders:0,
        totalPrice:0,
        orders:[],
        date_range:"today",
    };
    //the current filter date
    $scope.FILTER_DATE = "today";

    //in page functions
    $scope.toDate = (dt) => {
        return `${dt.toDateString()} at ${dt.getHours()}:${dt.getMinutes()}`
    };
    //search
    $scope.searchOrders = (e)=>{
        let val = jQuery(e.target).val().toLowerCase();
        let tr = jQuery('#orders_table_body tr');
        tr.each((i,el)=>{
            el.style.display = "none";
            let name = el.getElementsByTagName('td')[0].innerHTML.toLowerCase(),
                staff = el.getElementsByTagName('td')[4].innerHTML.toLowerCase(),
                items = el.getElementsByTagName('td')[1].innerText.toLowerCase(),
                price = el.getElementsByTagName('td')[2].innerHTML.toLowerCase(),
                qty = el.getElementsByTagName('td')[3].innerHTML.toLowerCase(),
                time = el.getElementsByTagName('td')[5].innerHTML.toLowerCase(),
                inv = el.getElementsByTagName('td')[6].innerHTML.toLowerCase();
            if(name.indexOf(val)>-1){
                el.style.display = "table-row";
            }else if(staff.indexOf(val)>-1){
                el.style.display = "table-row";
            }else if(items.indexOf(val)>-1){
                el.style.display = "table-row";
            }
            else if(price.indexOf(val)>-1){
                el.style.display = "table-row";
            }else if(qty.indexOf(val)>-1){
                el.style.display = "table-row";
            }else if(time.indexOf(val)>-1){
                el.style.display = "table-row";
            }else if(inv.indexOf(val)>-1){
                el.style.display = "table-row";
            } else {
                console.log("not found!")
            }
        })
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
                totalOrders:0,
                totalAmount:0,
                totalQuantity:0,
                orders:[],
                date_range:"",
            };

            $scope.db.transaction('rw',$scope.db.categories, $scope.db.items,$scope.db.orders,()=>{
                //checking if they're orders in the selected date range
                $scope.db.orders.where("date").between(startDate, endDate,true,true).count().then(count => {
                    if (count === 0) {
                        jQuery("#no_records").fadeIn("fast");
                        return;
                    }
                    jQuery("#no_records").fadeOut("fast");
                    //if not empty
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

                        report_data.categorical.push({name:category.name,amount:0,quantity:0,date:(startDate.toDateString() !== endDate.toDateString())?`${startDate.toDateString()} - ${endDate.toDateString()}`:startDate.toDateString()});

                    }).then(()=>{
                        //After getting all categories, loop through orders to get sales

                        //iterating through orders
                        $scope.db.orders.where("date").between(startDate, endDate,true,true).each(order => {

                            //1.1 count total orders and get total Amount
                            report_data.totalOrders += 1;
                            report_data.totalAmount += Number(order.totalPrice);
                            report_data.totalQuantity += Number(order.totalQuantity);

                            report_data.categorical.map((el) => {
                                order.items.forEach(item => {
                                    if (el.name === item.category) {
                                        el.amount += Number(item.price);
                                        el.quantity += Number(item.quantity);
                                    }
                                });
                            })

                            //other orders iterable methods...
                            report_data.orders.push(order);
                            //generating static template
                            let template = `
                            <tr>
                                <td>${order.date.toDateString()} <br /> <small>At ${order.date.getHours()}:${order.date.getMinutes()}</small></td>
                                <td>${$filter('currency')(order.totalPrice,"FCFA ",0)}</td>
                                <td style="width:5%">${order.totalQuantity}</td>
                                <td>${(order.waiter !== undefined)?order.waiter:"(no recipient)"}</td>
                                <td>${order.staff}</td>
                                <td><ul>
                        `;
                            order.items.forEach(item => {
                                template += `<li>${item.name} (${item.quantity})</li>`
                            });
                            template += `<td>${order.inv}</td>${($scope.currentUser.is_mgr)?`<td style="width:4%"><i onclick="deleteOrder(event,${order.id})" class="deleteOrderIcon material-icons">delete</i></td>`:''}</ul></td></tr>`;
                            jQuery('#orders_table_body').prepend(jQuery(template));
                            //destroy template var
                            template = null;


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
    $scope.deleteOrder = (e,index) => {
        $scope.db.orders.delete(Number(index))
            .then(() => {
                jQuery(e.target).parents("tr").remove();
            }).catch((err)=>{
                console.error(err);
                notifications.notify({msg:`Unable to delete sale`,title:"Unknown error",type:"error"});
        })
    };

});

function deleteOrder(event,index) {
    angular.element(jQuery("#reports")).scope().deleteOrder(event,index);
}