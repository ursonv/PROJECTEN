<?php

namespace modules\participate;

use yii\base\BootstrapInterface;
use yii\base\Module;



class ParticipateModule extends Module implements BootstrapInterface
{
    public function init()
    {
        parent::init();


        //dd("test participatemodule");     

    }

    public function bootstrap($app)
    {
        /*
            The bootstrap method in a Yii module is typically used to perform actions 
            that need to be executed when the application is bootstrapping, 
            such as registering components, setting up event handlers, 
            or performing other initialization tasks.
            However, in many cases, the init method is sufficient for these purposes, 
            especially if the module does not need to interact with the application 
            at the very early stages of its lifecycle.
        */
    }
}