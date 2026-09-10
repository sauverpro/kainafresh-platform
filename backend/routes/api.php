<?php
$router = new Router();
$router->addRoute('GET','/api/health','AuthController@test');
$router->addRoute('POST', '/api/auth/register', 'AuthController@register');
$router->addRoute('POST','/api/auth/login','AuthController@login');
$router->addRoute('GET','/api/auth/me','AuthController@me','auth');

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
    'PageController@store','auth'
);

$router->addRoute(
    'PUT',
    '/api/pages/{id}',
    'PageController@update','auth'
);

$router->addRoute(
    'DELETE',
    '/api/pages/{id}',
    'PageController@destroy','auth'
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
    'PageSectionController@store','auth'
);

$router->addRoute(
    'PUT',
    '/api/pages/{pageId}/sections/{sectionId}',
    'PageSectionController@update','auth'
);

$router->addRoute(
    'DELETE',
    '/api/pages/{pageId}/sections/{sectionId}',
    'PageSectionController@destroy','auth'
);
$router->addRoute(
    'PUT',
    '/api/pages/{pageId}/sections/reorder',
    'PageSectionController@reorder','auth'
);
$router->addRoute('GET','/api/settings','SettingController@index');
$router->addRoute('GET','/api/navlinks','NavLinkController@index');
$router->addRoute('GET','/api/navlinks/nav','NavLinkController@navs');
$router->addRoute('GET','/api/team','TeamController@index');
$router->addRoute('GET','/api/team/test','TeamController@test');
$router->addRoute('POST','/api/inquiry/create','ContactController@createInquiry');
$router->addRoute('POST','/api/contact/create','ContactController@createContact');
$router->addRoute('GET','/api/partners','PartnerController@index');
// middleware protected routes
$router->addRoute('POST','/api/settings/create','SettingController@store','auth');

// upload site logorouter
$router->addRoute('POST','/api/settings/uploadlogo','SettingController@uploadlogo','auth');
$router->addRoute('POST','/api/navlinks/create','NavLinkController@store','auth');
$router->addRoute('PUT','/api/navlinks/update/{id}','NavLinkController@update','auth');
$router->addRoute('DELETE','/api/navlinks/delete/{id}','NavLinkController@delete','auth');
// create team
$router->addRoute('POST','/api/team/new','TeamController@create');
$router->addRoute('POST','/api/partners/new','PartnerController@store','auth');
$router->addRoute('POST','/api/partners/edit/{id}','PartnerController@partner','auth');
$router->addRoute('DELETE','/api/partners/delete/{id}','PartnerController@destroy','auth');
$router->addRoute('GET','/api/admin/users','AuthController@users','auth');
$router->addRoute('POST','/api/admin/users/new','AuthController@createuser','auth');
// $router->addRoute('GET','/api/customers','AuthController@customers','auth');
$router->addRoute('PUT','/api/admin/users/update/{id}','AuthController@updateuser','auth');
$router->addRoute('DELETE','/api/admin/users/delete/{id}','AuthController@destroy','auth');
$router->addRoute('POST','/api/auth/change_password/{id}','AuthController@updatepassword','auth');
// units protected routes
$router->addRoute('POST','/api/units','UnitController@store','auth');

$router->addRoute('PUT','/api/units/{id}','UnitController@update','auth');

$router->addRoute('DELETE','/api/units/{id}','UnitController@destroy','auth');

// end of units protected routes
/*
|--------------------------------------------------------------------------
| Units
|--------------------------------------------------------------------------
*/

$router->addRoute( 'GET','/api/units','UnitController@index');

$router->addRoute('GET','/api/units/{id}','UnitController@show');


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
    'ProductController@store','auth'
);

$router->addRoute(
    'PUT',
    '/api/products/{id}',
    'ProductController@update','auth'
);

$router->addRoute(
    'POST',
    '/api/products/{id}',
    'ProductController@update','auth'
);

$router->addRoute(
    'DELETE',
    '/api/products/{id}',
    'ProductController@destroy','auth'
);


/*
|--------------------------------------------------------------------------
| Stocks
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/stocks',
    'StockController@index','auth'
);

$router->addRoute(
    'GET',
    '/api/stocks/{id}',
    'StockController@show','auth'
);

$router->addRoute(
    'POST',
    '/api/stocks',
    'StockController@store','auth'
);

$router->addRoute(
    'PUT',
    '/api/stocks/{id}',
    'StockController@update','auth'
);

$router->addRoute(
    'DELETE',
    '/api/stocks/{id}',
    'StockController@destroy','auth'
);

/*
|--------------------------------------------------------------------------
| IMS - Customers
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/customers',
    'CustomerController@index','auth'
);

$router->addRoute(
    'GET',
    '/api/customers/{id}',
    'CustomerController@show','auth'
);

$router->addRoute(
    'POST',
    '/api/customers',
    'CustomerController@store','auth'
);

$router->addRoute(
    'PUT',
    '/api/customers/{id}',
    'CustomerController@update','auth'
);

$router->addRoute(
    'DELETE',
    '/api/customers/{id}',
    'CustomerController@destroy','auth'
);

/*
|--------------------------------------------------------------------------
| Orders
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/orders',
    'OrderController@index','auth'
);

$router->addRoute(
    'GET',
    '/api/orders/{id}',
    'OrderController@show','auth'
);

$router->addRoute(
    'POST',
    '/api/orders',
    'OrderController@store'
);

$router->addRoute(
    'PUT',
    '/api/orders/{id}',
    'OrderController@update','auth'
);

$router->addRoute(
    'DELETE',
    '/api/orders/{id}',
    'OrderController@destroy','auth'
);

/*
|--------------------------------------------------------------------------
| Order Items
|--------------------------------------------------------------------------
*/

$router->addRoute(
    'GET',
    '/api/order-items',
    'OrderItemController@index','auth'
);

$router->addRoute(
    'GET',
    '/api/order-items/{id}',
    'OrderItemController@show','auth'
);

$router->addRoute(
    'GET',
    '/api/orders/{orderId}/items',
    'OrderItemController@indexByOrder','auth'
);

$router->addRoute(
    'POST',
    '/api/orders/{orderId}/items',
    'OrderItemController@store'
);

$router->addRoute(
    'PUT',
    '/api/order-items/{id}',
    'OrderItemController@update','auth'
);

$router->addRoute(
    'DELETE',
    '/api/order-items/{id}',
    'OrderItemController@destroy','auth'
);
