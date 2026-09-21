<?php 

class ContactController extends BaseController{
private $contact_model;
private $inquiry_model;
private $user_model;

public function __construct(){
    $this->contact_model = new Contact();
    $this->inquiry_model = new Inquiry();
    $this->user_model = new User();
}
// create inquiry
public function createInquiry(){
    //$this->jsonResponse(["status"=>true,'message'=>"hello"],201);
$data = $this->getRequestData();

 $validation = $this->validateRequired($data,['companyName','contactName','email','phone','country','productInterest','estimatedQuantity','message']);
 if ($validation) {
    $this->jsonResponse([
            'success' => false,
            'message' => $validation
            ], 422);
    }
 $createddata = $this->inquiry_model->create( $data );

 if($createddata){
     try {
            require_once __DIR__ . '/../../services/MailTemplates.php';

              

            $orderForEmail = array_merge($createddata, [
                'senderName' => $createddata['companyName'] ?? '',
                'subjectLine'  => $createddata['productInterest']  ?? '',
                'senderPhone'      => $createddata['phone']      ?? '',
                'senderEmail'      => $createddata['email']      ?? '',
                'messageBody'    => $createddata['message']    ?? '',
                'estimatedQuantity'    => $createddata['estimatedQuantity']    ?? '',
            ]);

            $config = require __DIR__ . '/../../config/mail.php';
            $mailer = new MailTemplates($config);

            

            $mailer->sendInquiryNotification(
                $orderForEmail,
                ['orders@kainafresh.rw' => 'Kaina Fresh Team']
            );
        } catch (Throwable $e) {
            error_log('[Order email dispatch] ' . $e->getMessage());
        }
    $this->jsonResponse([
        'success'=> true,
        'data'=>$data
    ],201);
 }
 else
    {
            $this->jsonResponse(['message'=> 'Something went wrong!'],500);
    }

}

// create contact
public function createContact(){
    //$this->jsonResponse(["status"=>true,'message'=>"hello"],201);
$data = $this->getRequestData();

 $validation = $this->validateRequired($data,['name','email','phone','subject','message']);
 if ($validation) {
    $this->jsonResponse([
            'success' => false,
            'message' => $validation
            ], 422);
    }
 $createddata = $this->contact_model->create( $data );
 if($createddata){
     try {
            require_once __DIR__ . '/../../services/MailTemplates.php';

              

            $orderForEmail = array_merge($createddata, [
                'senderName' => $createddata['name'] ?? '',
                'subjectLine'  => $createddata['subject']  ?? '',
                'senderPhone'      => $createddata['phone']      ?? '',
                'senderEmail'      => $createddata['email']      ?? '',
                'messageBody'    => $createddata['message']    ?? '',
            ]);

            $config = require __DIR__ . '/../../config/mail.php';
            $mailer = new MailTemplates($config);

            

            $mailer->sendContactNotification(
                $orderForEmail,
                ['orders@kainafresh.rw' => 'Kaina Fresh Team']
            );
        } catch (Throwable $e) {
            error_log('[Order email dispatch] ' . $e->getMessage());
        }
    $this->jsonResponse([
        'success'=> true,
        'data'=>$data
    ],201);
 }      
 else
    {
            $this->jsonResponse(['message'=> 'Something went wrong!'],500);
    }

}
}