<?php
/**
 * Site URL Rules
 *
 * You can define custom site URL rules here, which Craft will check in addition
 * to routes defined in Settings → Routes.
 *
 * Read all about Craft’s routing behavior, here:
 * https://craftcms.com/docs/4.x/routing.html
 */

return [
    [
        'pattern' => 'bill/add-item/', 
        'route' => 'bill-module/bill/add-item',
        'verb' => ['POST', 'GET'],
    ],
    [
        'pattern' => 'bill/remove-item/<id:\d+>',
        'route' => 'bill-module/bill/remove-item',
        'verb' => 'POST',
    ],
    [
        'pattern' => 'bill/update-item',
        'route' => 'bill-module/bill/update-item',
        'verb' => ['POST', 'GET'],
    ],
    [
        'pattern' => 'bill/manage',
        'route' => 'bill-module/bill/view-all-bills',
        'verb' => ['POST', 'GET'],
    ],
    [
        'pattern' => 'bill/create',
        'route' => 'bill-module/bill/create-bill',
        'verb' => ['POST', 'GET'],
    ],
    [
        'pattern' => 'bill/paying',
        'route' => 'bill-module/bill/payment-succeed',
        'verb' => ['POST', 'GET'],
    ],
    [
        'pattern' => 'bill/payingid',
        'route' => 'bill-module/bill/payment-succeed-id',
        'verb' => ['POST', 'GET'],
    ],

    [
        'pattern' => 'bill/detail/<billId:\d+>/add-drink/',
        'route' => 'bill-module/bill/add-drink',
        'verb' => ['POST', 'GET'],
    ],
    [
        'pattern' => 'bill/detail/<billId:\d+>',
        'route' => 'bill-module/bill/detail',
        'verb' => ['POST', 'GET'],
    ],
    [
        'pattern' => 'bill/manage/create',
        'route' => 'bill-module/bill/create',
        'verb' => ['POST', 'GET'],
    ],
    [
        'pattern' => 'play-dates/<teamType:\w+>/<id:\d+>/add-participation',
        'route' => 'participate-module/participate/add-participation',
        'verb' => ['POST', 'GET'],
    ],
    
];
