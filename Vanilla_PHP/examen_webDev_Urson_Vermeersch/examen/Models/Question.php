<?php

namespace App\Models;

use PDO;

class Question extends BaseModel {

    public function getAnswers() {
        global $db;

        $sql = "SELECT * FROM answers WHERE question_id = :question_id";
        $query = $db->prepare($sql);
        $query->bindParam(':question_id', $this->question_id);
        $query->execute();

        $answers = $query->fetchAll(PDO::FETCH_ASSOC);

        $baseModel = new BaseModel();
        return $baseModel->castToModel($answers);
    }

    public static function getQuestionsForExam($examId) {
        global $db;

        $sql = "SELECT * FROM questions WHERE exam_id = :exam_id";
        $query = $db->prepare($sql);
        $query->bindParam(':exam_id', $examId);
        $query->execute();

        $questionsData = $query->fetchAll(PDO::FETCH_ASSOC);

        $questionModel = new self();
        return $questionModel->castToModel($questionsData);
    }
}
