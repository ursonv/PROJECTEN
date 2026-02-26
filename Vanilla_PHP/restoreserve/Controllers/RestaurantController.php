<?php 

namespace App\Controllers;
//use App\Models\User;

class RestaurantController extends BaseController {

    public static function index() {
        
        self::loadView('/restaurant/list', [

        ]);
    }

}