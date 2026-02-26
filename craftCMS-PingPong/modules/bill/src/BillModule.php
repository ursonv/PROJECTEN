<?php

namespace modules\bill;

use yii\base\BootstrapInterface;
use yii\base\Module;
use modules\bill\events\PaymentUpdate;


class BillModule extends Module implements BootstrapInterface
{
    public function init() 
    {
        parent::init();

        PaymentUpdate::handle();   
        // dd("test");
    }

    public function bootstrap($app)
    {

    }
}