<?php

class SettingController extends BaseController{

private $settingModel;
private $userModel;
public function __construct(){

    $this->settingModel = new Setting();
    $this->userModel = new User();
    
}

public function index(){
    $data = $this->settingModel->getSettings();
    $this->jsonResponse(["settings", $data]);
}
// function to create global settings for the site

public function store(){
    // we check if the user is authenticated and has valid access to resources
    $userId = $this->getAuthenticatedUserId();

    if(!$userId){
        $this->jsonResponse(['message'=>"You must login!"],400);
    }
    $user = $this->userModel->findByUserId($userId);
    // check user access privileges
    if($user['role'] !=='admin'){
        $this->jsonResponse(['message'=> 'Unauthorized access!'],401);
    }
    // we validate inputs
    $data = $this->getRequestData();

    $validation = $this->validateRequired($data,['site_title','primary_email'
    ,'address','primary_number']);

    if ($validation) {
            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);
        }
        // we check if there is already record in setting table so that we update that table
        // if there is that record, we update it
        $setting = $this->settingModel->getSettings();
        if ($setting){
            
           if( $this->settingModel->updateSettings($setting['id'],$data)){
            $this->jsonResponse([
                'success'=> true,
                'message'=>'Settings updated!',
                'data'=> $data
            ],200);
           }
           else{
            $this->jsonResponse([
                'success'=> false,
                'message'=> 'Something went wrong'],500);

           }
           
        }
    $setting_data = $this->settingModel->create($data);
    if($setting_data){
        $this->jsonResponse([
            'success'=> true,
            'message'=> 'Settings created!',
            'data'=> $setting_data
            ],200);
    }else{
        $this->jsonResponse([
            'success'=> false,
            'message' => 'something went wrong!'
            ],500);
    }


}
// upload logo
public function uploadlogo(){
    $userId = $this->getAuthenticatedUserId();

    if(!$userId){
        $this->jsonResponse(['message'=>"You must login!"],400);
    }
    $user = $this->userModel->findByUserId($userId);
    // check user access privileges
    if($user['role'] !=='admin'){
        $this->jsonResponse(['message'=> 'Unauthorized access!'],401);
    }
    // the logo comes in as a multipart file upload, not JSON body
    if (!isset($_FILES['site_logo'])) {
        $this->jsonResponse([
            'success' => false,
            'message' => 'The site_logo file is required.'
        ], 422);
    }

    $uploadHelper = new UploadHelper();
    try {
        $uploaded = $uploadHelper->uploadLogo($_FILES['site_logo']);
    } catch (Exception $e) {
        $this->jsonResponse([
            'success' => false,
            'message' => $e->getMessage()
        ], 422);
    }

    // checking existing record so we update it instead of creating a duplicate
    $setting = $this->settingModel->getSettings();
    if ($setting){

       $updated = $this->settingModel->updateSettings($setting['id'], ['site_logo' => $uploaded['path']]);
       if ($updated){
        // remove the previous logo file now that the new one is saved
        if (!empty($setting['site_logo'])) {
            $uploadHelper->deleteFile($setting['site_logo']);
        }
        $this->jsonResponse([
            'success'=> true,
            'message'=>'Logo updated!',
            'data'=> $updated
        ],200);
       }
       else{
        $this->jsonResponse([
            'success'=> false,
            'message'=> 'Something went wrong'],500);

       }

    }
    // no settings record yet, create one with only the logo set
    $setting_data = $this->settingModel->create(['site_logo' => $uploaded['path']]);
    if($setting_data){
        $this->jsonResponse([
            'success'=> true,
            'message'=> 'Logo uploaded!',
            'data'=> $setting_data
            ],200);
    }else{
        $this->jsonResponse([
            'success'=> false,
            'message' => 'something went wrong!'
            ],500);
    }

}
}