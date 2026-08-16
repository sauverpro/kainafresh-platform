<?php
$router = new Router();
$router->addRoute('GET','/api/health','AuthController@test');
$router->addRoute('POST', '/api/auth/register', 'AuthController@register');
$router->addRoute('POST','/api/auth/login','AuthController@login');