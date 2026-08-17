<?php
$router = new Router();
$router->addRoute('GET','/api/health','AuthController@test');
$router->addRoute('POST', '/api/auth/register', 'AuthController@register');
$router->addRoute('POST','/api/auth/login','AuthController@login');
$router->addRoute('GET','/api/settings','SettingController@index');
$router->addRoute('GET','/api/navlinks','NavLinkController@index');
// middleware protected routes
$router->addRoute('POST','/api/settings/create','SettingController@store','auth');

// upload site logo
$router->addRoute('POST','/api/settings/uploadlogo','SettingController@uploadlogo','auth');
$router->addRoute('POST','/api/navlinks/create','NavLinkController@store','auth');
$router->addRoute('PUT','/api/navlinks/update/{id}','NavLinkController@update','auth');
$router->addRoute('DELETE','/api/navlinks/delete/{id}','NavLinkController@delete','auth');