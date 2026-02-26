<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= ($title ?? '') . ' ' . $_ENV['SITE_NAME'] ?></title>
    <link rel="stylesheet" href="/css/style.css?v=<?php if( $_ENV['DEV_MODE'] == "true" ) { echo time(); }; ?>">
</head>
<body>
    <header>
        <a href="index.html" class="brand">RestoReserve</a>
        <form class="search"><input type="search"><button type="submit">Zoeken</button></form>
       <div class="user">
           <a href="afspraken.html">Mijn afspraken <span class="badge">2</span></a>
       </div>
    </header>

    <div class="brand">BrandName</div>

    
    
    <?= $content; ?>
    
    
    <?php include_once BASE_DIR . '/views/_templates/_partials/footer.php' ?>
</body>
</html>