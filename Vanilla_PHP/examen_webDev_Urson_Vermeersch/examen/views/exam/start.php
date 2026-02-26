<h1><?= $exam->title ?></h1>
<p><a href="/exam/1">&lt; Keer terug</a></p>
<form action="/exam/finish/<?= $userExamId ?>" method="post">

<?php foreach ($questions as $question): ?>
    <div class='question'>

        <h2><?= $question->text ?></h2>
        <?php if ($question->image): ?>
                <img src='/images/<?= $question->image; ?>' alt=''>
        <?php endif; ?>

        <?php if ($question->type === 'open'): ?>
            <div class="answer"><label><textarea name="questions[<?= $question->question_id; ?>]" rows="5"></textarea></label></div>

        <?php elseif ($question->type === 'mc'): ?>
            <?php foreach ($question->getAnswers() as $answer): ?>
                <div class="answer"><label><input type="radio" name="questions[<?= $question->question_id; ?>]" value="<?= $answer->answer_id; ?>"><?= $answer->text ?></label></div>
            <?php endforeach; ?>

        <?php endif; ?>
    </div>
<?php endforeach; ?>
<input type="hidden" name="user_exam_id" value="<?= $userExamId ?>">

<input type="submit" value="Verstuur" class="btn btn-primary">

</form>


