<?php 

class NavLink extends Model{
     public $table = "navlinks";
     public $primaryKey = "id";

     protected $fillable = ['link_name','link','link_type'];

      public function getNavlinks(){
        return $this->all();
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

    public function getNavs(){
        $sql = "SELECT * FROM `{$this->table}` WHERE `link_type` = ?";
        $stmt = $this->db->prepare($sql);
        $linkType = "nav";
        $stmt->bind_param("s", $linkType);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = $this->fetchAll($result);
        return !empty($rows) ? $rows : $this->all();
    }



}