<?php 

class Partner extends Model{
    public $table = "partners";
    public $primaryKey = "id";

    protected $fillable = [
        'partner_name',
        'partner_logo',
        'partner_link',
    ] ;
    public function getPartners(){
        $all = $this->all() ;
        return !empty($all) ? $all[0] : null ;
    }

    public function addPartner($data){
        return $this->create($data) ;
    }

    // update partner
    public function updatePartner($data,$id){
        return $this->update($data,$id) ;
    }
    // delete partner
    public function deletePartner($id){
        return $this->delete($id) ;
    }
}