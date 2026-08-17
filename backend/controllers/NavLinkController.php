<?php

class NavLinkController extends BaseController {

    private $nav_link_model;
    private $user_model;

    public function __construct() {
        $this->nav_link_model = new NavLink();
        $this->user_model = new User();
    }
    public function index() {
        $data = $this->nav_link_model->getNavLinks();
        $this->jsonResponse(['navlinks'=>$data]);
    }
    // function to create new nav link
    public function store(){
        $userId = $this->getAuthenticatedUserId();
        if(!$userId){
            $this->jsonResponse(['message'=> 'You must login'],400);
        }
        $user = $this->user_model->findByUserId($userId);
        if($user['role'] !== 'admin'){
            $this->jsonResponse(['message'=> 'Unauthorized access!'],401);
        }

        $data = $this->getRequestData();
        $validation = $this->validateRequired($data,['link','link_type','link_name']);
        if ($validation) {
            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);
        }
        $linkdata = $this->nav_link_model->createNavLink($data);
        if($linkdata){
            $this->jsonResponse(['success'=> true,'navlinks'=>$linkdata]);
        }
        else{
            $this->jsonResponse(['message'=> 'Something went wrong!'],500);
        }

    }
    // update navlink
    public function update($id){
        $userId = $this->getAuthenticatedUserId();
        if(!$userId){
            $this->jsonResponse(['message'=> 'You must Login'],400);
        }
        $user = $this->user_model->findByUserId($userId);
        if($user['role'] !== 'admin'){
            $this->jsonResponse([
                'success'=> false,
                'message' => 'Unauthorized access'
                ],400);
        }
        $data = $this->getRequestData();
        $updated = $this->nav_link_model->updateNavLink($id,$data);
        if($updated){
            $this->jsonResponse(['success'=> true,'data'=>$updated],201);
        }
        else{
            $this->jsonResponse(['message'=> 'Something went wrong'],500);
        }
    }
    // function to delete link
    public function delete($id){
        $userId = $this->getAuthenticatedUserId();
        if(!$userId){
            $this->jsonResponse(['message'=> 'You must Login'],400);
        }
        $user = $this->user_model->findByUserId($userId);
        if($user['role'] !== 'admin'){
            $this->jsonResponse([
                'success'=> false,
                'message'=> 'Unauthorized access'
                ],400);
        }
        $deleted =$this->nav_link_model->deleteNavLink($id);
        if($deleted){
            $this->jsonResponse([
                'success'=> true,
                'message'=> 'Link removed!'
                ],200);
        }
        else{
            $this->jsonResponse([
                'success'=>false,
                'message'=> 'Something went wrong'
                ],500);
        }
    }
}