<?php 

class Inquiry extends Model{


public $table = "inquiry";
public $primaryKey = "id";
public $fillable = ["companyName","contactName","email","phone","country","productInterest","estimatedQuantity","message","status"];

public function getInquiries(){
    $all = $this->all();
    return !empty($all) ? $all[0] : null;
}
// create contact
public function createData($data){
    return $this->create($data);
}
}