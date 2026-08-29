<?php 

class PartnerController extends BaseController{
  private $partner;
  private $user_model;
  public function __construct( ){
    $this->user_model = new User();
    $this->partner = new Partner();
  }

//   get partners
public function index(){

$parners = $this->partner->getPartners();
if($parners){
    return $this->jsonResponse(['status'=>true,'data'=>$parners],200);
}
else{
    return $this->jsonResponse(['status'=>false,'message'=>'Unable to load data'],500);
}
}

// create partner with admin authorization
public function store(){
    $userid = $this->getAuthenticatedUserId();

    if(!$userid){
        return $this->jsonResponse(['status'=>false,'message'=> 'Token Expired! Login again!'], 403);
    }
    $users = $this->user_model->findByUserId($userid);
    if($users['role'] !== 'admin'){
        return $this->jsonResponse(['status'=>false,'message'=> 'unauthorized Access'],403);
    }
    $data = array_merge($this->getRequestData(),$_POST);

    if (!isset($_FILES['partner_logo'])) {
        $this->jsonResponse([
            'success' => false,
            'message' => 'The partner_logo file is required.'
        ], 422);
    }
    try {
    $uploadHelper = new UploadHelper();
    $uploadResult = $uploadHelper->uploadLogo($_FILES['partner_logo']);
    // store the public/path value expected by DB (Partner::$fillable includes partner_logo)
    $data['partner_logo'] = $uploadResult['path'];
} catch (Exception $e) {
    return $this->jsonResponse(['success' => false, 'message' => $e->getMessage()], 422);
}
    $createdata = $this->partner->create($data);
    if($createdata){
        return $this->jsonResponse(['status'=>true,'data'=>$createdata],200);
    }
    else{
        return $this->jsonResponse(['status'=>false,'message'=> 'SOmething went wrong'],500);
    }
}
}