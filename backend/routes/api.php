<?php
$router = new Router();
$router->addRoute('GET','/api/health','AuthController@test');
$router->addRoute('POST', '/api/auth/register', 'AuthController@register');
$router->addRoute('POST','/api/auth/login','AuthController@login');

/*
|--------------------------------------------------------------------------
| Pages
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/pages',
    'PageController@index'
);

$router->addRoute(
    'GET',
    '/api/pages/{id}',
    'PageController@show'
);

$router->addRoute(
    'GET',
    '/api/pages/slug/{slug}',
    'PageController@showBySlug'
);

$router->addRoute(
    'POST',
    '/api/pages',
    'PageController@store'
);

$router->addRoute(
    'PUT',
    '/api/pages/{id}',
    'PageController@update'
);

$router->addRoute(
    'DELETE',
    '/api/pages/{id}',
    'PageController@destroy'
);

/*
|--------------------------------------------------------------------------
| Page Sections
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/pages/{pageId}/sections',
    'PageSectionController@index'
);

$router->addRoute(
    'GET',
    '/api/pages/{pageId}/sections/{sectionId}',
    'PageSectionController@show'
);

$router->addRoute(
    'POST',
    '/api/pages/{pageId}/sections',
    'PageSectionController@store'
);

$router->addRoute(
    'PUT',
    '/api/pages/{pageId}/sections/{sectionId}',
    'PageSectionController@update'
);

$router->addRoute(
    'DELETE',
    '/api/pages/{pageId}/sections/{sectionId}',
    'PageSectionController@destroy'
);
$router->addRoute(
    'PUT',
    '/api/pages/{pageId}/sections/reorder',
    'PageSectionController@reorder'
);