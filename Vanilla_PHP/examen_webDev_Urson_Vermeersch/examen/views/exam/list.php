<form method="get" action="/">
    <input type="text" name="search" placeholder="Zoek examen" value="<?= isset($_GET['search']) ? $_GET['search'] : '' ?>">
    <input type="submit" value="Zoek" class="btn btn-primary">
</form>
<div class="exams">
    <?php foreach ($exams as $exam): ?>
        <?php
            $description = strlen($exam->description) > 200 ? substr($exam->description, 0, 200) . '...' : $exam->description;


            $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
            $foundInTitle = stripos($exam->title, $searchTerm) !== false;
            $foundInDescription = stripos($exam->description, $searchTerm) !== false;

            if ($searchTerm === '' || $foundInTitle || $foundInDescription):
        ?>
            <a href="/exam/<?= $exam->exam_id ?>" class="exam">
                <h2><?= $exam->title ?></h2>
                <?= $description ?>
            </a>
        <?php endif; ?>
    <?php endforeach; ?>
</div>
