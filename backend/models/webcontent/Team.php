<?php
class Team extends Model{
   protected $table = "team";
   protected $fillable = ["name","initials","role","phone_number","email"];
   public $primaryKey = "id";

//    create team

public function createTeam($data){
    $this->create($data);
}
public function updateTeam($id,$data){
    $this->update($id,$data);
}
public function deleteTeam($id){
    $this->delete($id);
}
// get team
public function getTeams(){
 $all = $this->all();
 return !empty($all) ? $all : null;
}

}