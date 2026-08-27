<?php 

class Setting extends Model {
    public $table = "settings";
    public $primaryKey = "id";

    protected $fillable = ['site_title','site_logo','primary_email','secondary_email','other_email','facebook','instagram','tiktok','linkedin','youtube','address','primary_number','secondary_number','other_numbers'];

    // function to get all records
    // function to get the first (global) settings record
    public function getSettings(){
        $all = $this->all();
        return !empty($all) ? $all[0] : null;
    }
    public function createSettings($data){
        return $this->create($data);
    }
    public function updateSettings($id,$data){
        return $this->update($id,$data);
    }

   

}