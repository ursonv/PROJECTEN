<?php
//inladen van models, helpers, controllers
require 'autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

require 'config.php';

session_start();

//connectie maken met DB
$db = new PDO($config['db_connection'] . ':dbname=' . $config['db_database'] . ';host=' . $config['db_host'] . ';port=' . $config['db_port'], $config['db_username'], $config['db_password']);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

//routes aanmaken
$router = new \Bramus\Router\Router();
//$router->get('/', function() { echo 'Dit is de index vanuit de route'; });
$router->setNamespace('\App\Controllers');
$router->get('/', 'FlightController@index');
$router->get('/flight/(.*)', 'FlightController@detail');
$router->post('/flight/(.*)', 'FlightController@order');

$router->get('/qr/(.*)', function($url) {
    $qr = new \Endroid\QrCode\QrCode($url);
    $writer = new \Endroid\QrCode\Writer\PngWriter();
    $data = $writer->write($qr);
    header('Content-Type: image/png');
    echo $data->getString();
});

$router->get('/(.*)', function($url) {
    header('Location: /');
    //echo '404: ' . $url . ' not found';
});

//Run
$router->run();