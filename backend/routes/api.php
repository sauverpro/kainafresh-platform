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
$router->addRoute('GET','/api/settings','SettingController@index');
$router->addRoute('GET','/api/navlinks','NavLinkController@index');
$router->addRoute('GET','/api/navlinks/nav','NavLinkController@navs');
$router->addRoute('GET','/api/team','TeamController@index');
$router->addRoute('GET','/api/team/test','TeamController@test');
// middleware protected routes
$router->addRoute('POST','/api/settings/create','SettingController@store','auth');

// upload site logo
$router->addRoute('POST','/api/settings/uploadlogo','SettingController@uploadlogo','auth');
$router->addRoute('POST','/api/navlinks/create','NavLinkController@store','auth');
$router->addRoute('PUT','/api/navlinks/update/{id}','NavLinkController@update','auth');
$router->addRoute('DELETE','/api/navlinks/delete/{id}','NavLinkController@delete','auth');
// create team
$router->addRoute('POST','/api/team/new','TeamController@create');

/*
|--------------------------------------------------------------------------
| Units
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/units',
    'UnitController@index'
);

$router->addRoute(
    'GET',
    '/api/units/{id}',
    'UnitController@show'
);

$router->addRoute(
    'POST',
    '/api/units',
    'UnitController@store'
);

$router->addRoute(
    'PUT',
    '/api/units/{id}',
    'UnitController@update'
);

$router->addRoute(
    'DELETE',
    '/api/units/{id}',
    'UnitController@destroy'
);

/*
|--------------------------------------------------------------------------
| Products
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/products',
    'ProductController@index'
);

$router->addRoute(
    'GET',
    '/api/products/{id}',
    'ProductController@show'
);

$router->addRoute(
    'POST',
    '/api/products',
    'ProductController@store'
);

$router->addRoute(
    'PUT',
    '/api/products/{id}',
    'ProductController@update'
);

$router->addRoute(
    'DELETE',
    '/api/products/{id}',
    'ProductController@destroy'
);


/*
|--------------------------------------------------------------------------
| Stocks
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/stocks',
    'StockController@index'
);

$router->addRoute(
    'GET',
    '/api/stocks/{id}',
    'StockController@show'
);

$router->addRoute(
    'POST',
    '/api/stocks',
    'StockController@store'
);

$router->addRoute(
    'PUT',
    '/api/stocks/{id}',
    'StockController@update'
);

$router->addRoute(
    'DELETE',
    '/api/stocks/{id}',
    'StockController@destroy'
);

/*
|--------------------------------------------------------------------------
| IMS - Customers
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/customers',
    'CustomerController@index'
);

$router->addRoute(
    'GET',
    '/api/customers/{id}',
    'CustomerController@show'
);

$router->addRoute(
    'POST',
    '/api/customers',
    'CustomerController@store'
);

$router->addRoute(
    'PUT',
    '/api/customers/{id}',
    'CustomerController@update'
);

$router->addRoute(
    'DELETE',
    '/api/customers/{id}',
    'CustomerController@destroy'
);

/*
|--------------------------------------------------------------------------
| Orders
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/orders',
    'OrderController@index'
);

$router->addRoute(
    'GET',
    '/api/orders/{id}',
    'OrderController@show'
);

$router->addRoute(
    'POST',
    '/api/orders',
    'OrderController@store'
);

$router->addRoute(
    'PUT',
    '/api/orders/{id}',
    'OrderController@update'
);

$router->addRoute(
    'DELETE',
    '/api/orders/{id}',
    'OrderController@destroy'
);

/*
|--------------------------------------------------------------------------
| Order Items
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/order-items',
    'OrderItemController@index'
);

$router->addRoute(
    'GET',
    '/api/order-items/{id}',
    'OrderItemController@show'
);

$router->addRoute(
    'GET',
    '/api/orders/{orderId}/items',
    'OrderItemController@indexByOrder'
);

$router->addRoute(
    'POST',
    '/api/orders/{orderId}/items',
    'OrderItemController@store'
);

$router->addRoute(
    'PUT',
    '/api/order-items/{id}',
    'OrderItemController@update'
);

$router->addRoute(
    'DELETE',
    '/api/order-items/{id}',
    'OrderItemController@destroy'
);
