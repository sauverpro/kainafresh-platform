<?php 

class NavLink extends Model{
     public $table = "navlinks";
     public $primaryKey = "id";

     protected $fillable = ['link_name','link','link_type'];

      public function getNavlinks(){
        $all = $this->all();
        return !empty($all) ? $all[0] : null;
    }

    public function createNavLink($data){
     return $this->create($data);
    }
//     update nav links
    public function updateNavLink($id,$data){
     return $this->update($id,$data);
    }
//     delete link from nav links
    public function deleteNavLink($id){
     return $this->delete($id);
    }



}