<h1><?= $exam->title; ?></h1>
<h2>Het examen bevat <?= $exam->question_count ?> vragen</h2>


<p>
    <?= $exam->description ?>
</p>

<a href="/exam/start/<?= $exam->exam_id ?>" class="btn btn-primary">Start het examen</a>

<p><a href="/">&lt; Keer terug</a></p>