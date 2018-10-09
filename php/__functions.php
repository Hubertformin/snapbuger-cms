<?php
/**
 *
 */
class Message
{
	public $msg;
	function __construct()
	{
		$this->msg  = array('status'=>false,'msg'=>'');
	}
	public function valid($data){
		$this->msg['status'] = true;
		$this->msg['msg'] = $data;
	}
	public function error($data){
		$this->msg['status'] = false;
		$this->msg['msg'] = $data;
	}
	public function send(){
		echo(json_encode($this->msg));
	}
  public static function sendMsg($msg){
    echo(json_encode($msg));
  }
  public static function ErrorMsg($msg){
    die(json_encode(array('status'=>false,'msg'=>$msg)));
  }
}
//class to hadle db
/**
 *
 */
class SyncDatabase extends Message
{
	private $db;
	public function __construct()
	{
		parent::__construct();
		 $this->db = new mysqli("localhost","root","","snapburger");
		if($this->db->connect_error){
			die("{'status':false,'msg':'Unable to connect to Database!'}");
		}
	}
	//function to handle users
	public function users($mode,$data = ""){
    //return data
    $return_data = array();
		//adding to database
		switch ($mode) {
			case 'add':
				$add_users = $this->db->prepare("INSERT INTO users(name,password,position,startDate,status,is_mgr,salary) values (?,?,?,?,?,?,?)");
				$add_users->bind_param('ssssssi',$name,$password,$position,$startDate,$status,$is_mgr,$salary);
				$name = $data->name;
				$password = $data->password;
				$position = $data->position;
				$startDate = $data->startDate;
				$status = $data->status;
				$is_mgr = ($data->is_mgr == 1)?1:0;
				$salary = $data->salary;
				//executing and checking status
				if ($add_users->execute()) {
					$this->valid("Added");
				}else{
					$this->error("Failed!");
				}
				break;
      case 'fetchAll':
        $fetch_users = $this->db->query("SELECT * FROM users");
        while($data = $fetch_users->fetch_assoc()){
          array_push($return_data,$data);
        }
        break;
			case 'update':
				$update_users = $this->db->prepare("UPDATE users SET name = ?,password = ?, position = ?,startDate = ?,status = ?,is_mgr = ?,salary = ? WHERE name =".$data->name."");
				$update_users->bind_param('ssssssi',$name,$password,$position,$startDate,$status,$is_mgr,$salary);
				$name = $data->name;
				$password = $data->password;
				$position = $data->position;
				$startDate = $data->startDate;
				$status = $data->status;
				$is_mgr = ($data->is_mgr == 1)?1:0;
				$salary = $data->salary;
				//executing and checking status
				if ($update_users->execute()) {
					$this->valid("Updated");
				}else{
					$this->error("Failed!");
				}
			case 'delete':
			$delete = $this->db->query("DELETE FROM users WHERE id =".$data->id."");
			if($delete){
				$this->valid("Deleted!");
			}else{
				$this->error("Failed");
			}
      break;
		}
    return $return_data;
	}
	//function to handle orders
	public function orders($mode,$data = ""){
    //return Database
    $return_data = array();
		switch ($mode) {
			case 'add':
			  $items = array();
				$add_orders = $this->db->prepare("INSERT INTO orders(inv,items,totalPrice,totalQuantity,tableNum,staff,date) VALUES(?,?,?,?,?,?,?)");
				$add_orders->bind_param('ssiiiss',$inv,$items,$totalPrice,$totalQuantity,$tableNum,$staff,$date);
				$inv = $data->inv;
				$totalPrice = $data->totalPrice;
				$totalQuantity = $data->totalQuantity;
				$staff = $data->staff;
				$tableNum = $data->table;
				//removing t from date string, to appropriately put into db
				$date = date(str_replace("T"," ",$data->date));
				foreach ($data->items as $val) {
					array_push($items,$val->name);
				}
				$items = json_encode($items);
				if ($add_orders->execute()) {
					$this->valid("Updated");
				}else{
					$this->error("Failed!");
				}
				break;
      case 'fetch':
        $fetch_orders = $this->db->query("SELECT * FROM orders WHERE name = ".$data->name."");
        array_push($return_data,$fetch_orders->fetch_assoc());
        break;
      case 'fetchAll':
        $fetch_orders = $this->db->query("SELECT * FROM orders");
        while($data = $fetch_orders->fetch_assoc()){
            array_push($return_data,$data);
        }
        break;
      case 'update':
        $update_orders = $this->db->prepare("UPDATE orders SET inv = ?,items = ?,totalPrice = ?,totalQuantity = ?,tableNum = ?,staff = ?,date = ? WHERE name=".$data->name."");
        $update_orders->bind_param('ssiiiss',$inv,$items,$totalPrice,$totalQuantity,$tableNum,$staff,$date);
        $inv = $data->inv;
				$totalPrice = $data->totalPrice;
				$totalQuantity = $data->totalQuantity;
				$staff = $data->staff;
				$tableNum = $data->table;
				//removing t from date string, to appropriately put into db
				$date = date(str_replace("T"," ",$data->date));
				foreach ($data->items as $val) {
					array_push($items,$val->name);
				}
				$items = json_encode($items);
				if ($add_orders->execute()) {
					$this->valid("Updated");
				}else{
					$this->error("Failed!");
				}
        break;
      case 'delete':
        $delete_orders = $this->db->query("DELETE FROM orders WHERE name=".$data->name."");
        if($delete_orders){
          $this->valid("Deleted orders");
        }else{
          $this->error("Failed!");
        }
        break;
		}
	}
	//function to hadle categories
	public function categories($mode,$data = ""){
    //return data array
    $return_data = array();
			switch ($mode) {
				case 'add':
					$add_categories = $this->db->prepare("INSERT INTO categories(name,status,action) VALUES(?,?,?)");
					$add_categories->bind_param('sss',$data->name,$data->status,$data->action);
					if($add_categories->execute()){
						$this->valid("Successsfully added to Categories");
					}else{
						$this->error("Error adding to database");
					}
					break;
        case 'fetch':
          $fetch_categories = $this->db->query("SELECT * FROM categories WHERE name = ".$data->name."");
          array_push($return_data,$fetch_categories->fetch_assoc());
          break;
        case 'fetchAll':
          $fetch_categories = $this->db->query("SELECT * FROM categories");
          while($data = $fetch_categories->fetch_assoc()){
              array_push($return_data,$data);
          }
          break;
        case 'update':
  				$update_categories = $this->db->prepare("UPDATE categories SET name= ?,status= ?,action = ? WHERE name=".$data->name."");
  				$update_categories->bind_param('sss',$data->name,$data->status,$data->action);
  				if($update_categories->execute()){
  					$this->valid("Successsfully updated Categories");
  				}else{
  					$this->error("Error updating database");
  				}
  				break;
        case 'delete':
          $delete_categories = $this->db->query("DELETE FROM categories WHERE name=".$data->name."");
          if($delete_categories){
  					$this->valid("Deleted");
  				}else{
  					$this->error("Error deleting");
  				}
			}
      return $return_data;
	 }
	//fucnction handling items table
	public function items($mode,$data = ""){
     //return data array
     $return_data = array();
		switch ($mode) {
	 	 case 'add':
	 		$add_items = $this->db->prepare("INSERT INTO items(name,category,rate,status,action) VALUES(?,?,?,?,?)");
			$add_items->bind_param('ssiss',$data->name,$data->category,$data->rate,$data->status,$data->action);
			if($add_items->execute()){
				$this->valid("Updated");
			}else{
				$this->error("Failed!");
			}
		 	break;
      case 'fetch':
          $fetch_items = $this->db->query("SELECT * FROM items WHERE name = ".$data->name."");
          array_push($return_data,$fetch_items->fetch_assoc());
          break;
        case 'fetchAll':
          $fetch_items = $this->db->query("SELECT * FROM items");
          while($data = $fetch_items->fetch_assoc()){
              array_push($return_data,$data);
          }
          break;
          case 'update':
            $update_items = $this->db->prepare("UPDATE items SET name=?,category=?,rate=?,status=?,action=? WHERE name=".$data->name."");
            $update_items ->bind_param('ssiss',$data->name,$data->category,$data->rate,$data->status,$data->action);
            if($update_items ->execute()){
              $this->valid("Updated");
            }else{
              $this->error("Failed!");
            }
            break;
		    }
        return $return_data;
	   }
  //fucntion to fetch all Database
  public function fetchAll(){
    $users = $this->users('fetchAll');
    $orders = $this->orders('fetchAll');
    $categories = $this->categories('fetchAll');
    $items = $this->items('fetchAll');
    return array('users'=>$users,'orders'=>$orders,'categories'=>$categories,'items'=>$items);
  }
}
//Instatiating message class...


 ?>
