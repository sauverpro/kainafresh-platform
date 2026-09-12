<?php

class TeamController extends BaseController {
    private $team_model;
    private $userModel;
    public function __construct() {
        $this->team_model = new Team();
        $this->userModel = new User();
    }
    public function test(){
        $this->jsonResponse(['success'=>true,'message'=>'test passed!'],201);
    }
    // get team (public)
    public function index() {
        $data = $this->team_model->getTeams();
        if ($data) {
            $this->jsonResponse(['status'=>true,'data'=>$data]);
        } else {
            $this->jsonResponse(['status'=>false,'message'=>'failed to load team']);
        }
    }
    // create team (admin only)
    public function create() {
        $userid = $this->getAuthenticatedUserId();
        if (!$userid) {
            return $this->jsonResponse(['status'=>false,'message'=>'Token Expired! Login again!'], 403);
        }
        $user = $this->userModel->findByUserId($userid);
        if ($user['role'] !== 'admin') {
            return $this->jsonResponse(['status'=>false,'message'=>'unauthorized Access'],403);
        }

        $data = $this->getRequestData();

        $validation = $this->validateRequired($data,['name','role','phone_number','email']);

        if ($validation) {
            return $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);
        }
        // get initials from name
        $nameParts = explode(' ', $data['name']);
        $initials = '';
        foreach ($nameParts as $part) {
            $initials .= strtoupper(substr($part, 0, 1));
        }
        $data['initials'] = $initials;

        $team = $this->team_model->createTeam($data);
        if ($team) {
            $this->jsonResponse([
                'success'=> true,
                'data'=> $team,
                'message'=> 'Team member added successfully'
            ],200);
        } else {
            $this->jsonResponse([
                'success'=> false,
                'message'=> 'Something went wrong'
            ],500);
        }
    }
    // update team member (admin only)
    public function update($id) {
        try {
            $userId = $this->getAuthenticatedUserId();
            if (!$userId) {
                return $this->jsonResponse(['success' => false, 'message' => 'You must Login'], 401);
            }

            $user = $this->userModel->findByUserId($userId);
            if ($user['role'] !== 'admin') {
                return $this->jsonResponse(['success' => false, 'message' => 'Unauthorized access'], 403);
            }

            $existing = $this->team_model->find($id);
            if (!$existing) {
                return $this->jsonResponse(['success' => false, 'message' => 'Team member not found with ID: ' . $id], 404);
            }

            $data = $this->getRequestData();
            if (empty($data)) {
                return $this->jsonResponse(['success' => false, 'message' => 'No data provided for update. Please check your request body.'], 422);
            }

            $updated = $this->team_model->updateTeam($id, $data);

            if ($updated) {
                return $this->jsonResponse([
                    'success' => true,
                    'data' => $updated,
                    'message' => 'Team member updated successfully'
                ], 200);
            }

            return $this->jsonResponse(['success' => false, 'message' => 'Failed to update team member. Please check the data and try again.'], 500);
        } catch (Exception $e) {
            return $this->jsonResponse(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
    // delete team member (admin only)
    public function destroy($id) {
        try {
            $userId = $this->getAuthenticatedUserId();
            if (!$userId) {
                return $this->jsonResponse(['success' => false, 'message' => 'You must Login'], 401);
            }

            $user = $this->userModel->findByUserId($userId);
            if ($user['role'] !== 'admin') {
                return $this->jsonResponse(['success' => false, 'message' => 'Unauthorized access'], 403);
            }

            $deleted = $this->team_model->deleteTeam($id);
            if ($deleted) {
                return $this->jsonResponse([
                    'success' => true,
                    'message' => 'Team member deleted successfully'
                ], 200);
            }

            return $this->jsonResponse(['success' => false, 'message' => 'Failed to delete team member'], 500);
        } catch (Exception $e) {
            return $this->jsonResponse(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
}