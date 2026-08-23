<?php

class TeamController extends BaseController {
    private $team_model;
   private $userModel;
    public function __construct() {
        $this->team_model = new Team();
        $this->userModel = new User();
    }
    // get team
    public function index() {
        $data = $this->team_model->getTeams();
        if ($data) {
            $this->jsonResponse(['status'=>true,'data'=>$data]);
        } else {
            $this->jsonResponse(['status'=>false,'message'=>'failed to load team']);
        }
    }
    // create team
    public function create() {
        $data = $this->getRequestData();

    $validation = $this->validateRequired($data,['name','role'
    ,'initials','phone_number','email']);

    if ($validation) {
            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);
        }
    $team = $this->team_model->create($data);
    if($team) {
        $this->jsonResponse([
            'success'=> true,
            'message'=> $team
            ],200);
    } else {
        $this->jsonResponse([
            'success'=> false,
            'message'=> 'something went wrong'],201);
    }
    }
}