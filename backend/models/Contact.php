<?php 

class Contact extends Model {
    public $table = "contacts";
    public $primaryKey = "id";
    protected $fillable = ["name","email","phone","subject","message","status"];

    public function getContacts(){

    $all = $this->all();
    return !empty($all) ? $all[0] : [];
    }

    public function create($data){
        return $this->create($data);
    }
}