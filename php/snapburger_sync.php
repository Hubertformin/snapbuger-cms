<?php
require_once('__functions.php');

if($_POST) {
	try{
		$data = json_decode($_POST["db"]);
		$type = $_POST["type"];
	}
	catch(Exception $e){
		Message::ErrorMsg("Data is destroyed or corrupt!, contact admin");
	}
	//creating connection to Database
	$conn = new mysqli("localhost","root","","snapburger");

	if($conn->connect_error){
		die("{'status':false,'msg':'Unable to connect to Database'}");
	}

//synchronizing database
$sync = new SyncDatabase();

//now this how my own syn method works, it waites for changes fromm user,applies them and return changes in database
if($type == 'fetchAll'){
	Message::sendMsg($sync->fetchAll());
}



//runing ....
	for($i = 0;$i<count($data);$i++){
		switch ($data[$i]->table) {
			case 'users':
				//print_r($data[$i]->data);
				foreach ($data[$i]->data as $value) {
					//$sync->users('add',$value);
				}
				break;
			case 'orders':
				foreach ($data[$i]->data as $value) {
					$sync->orders('add',$value);
					break;
				}

				break;
			case 'categories':
				foreach ($data[$i]->data as $value) {
					//$sync->categories('add',$value);
				}

				break;
			case 'items':
				foreach ($data[$i]->data as $value) {
					//$sync->items('add',$value);
				}

				break;

			default:
				# code...
				break;
		}
	}
	//$sync->send();

}else{
	$msg->error("Access denied!");
	$msg->send();
}

 ?>
