<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= ($title ?? '') . ' ' . $_ENV['SITE_NAME'] ?></title>
    <link rel="stylesheet" href="/css/main.css?v=<?php if( $_ENV['DEV_MODE'] == "true" ) { echo time(); }; ?>">
</head>

<?php include '_partials/header.php'; ?>

<body>

    <main>

        <?php if (isset($_GET['error'])) : ?>
            <p class="error"><?= $_GET['error'] ?></p>
        <?php endif; ?>
        
        <?= $content; ?>
    </main>
    

    <?php include '_partials/footer.php'; ?>

</body>
</html>