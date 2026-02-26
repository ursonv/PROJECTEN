<?php

namespace App\Models;

use PDO;

class Exam extends BaseModel {

 
    protected function getAll() {
        global $db;

        $sql = "SELECT *
                FROM exams";

        $query = $db->prepare($sql);
        $query->execute();

        return self::castToModel($query->fetchAll());
    }

    public function getQuestionCount() {
        global $db;

        $sql = "SELECT COUNT(*) AS question_count
                FROM questions
                WHERE exam_id = :exam_id";

        $query = $db->prepare($sql);
        $query->bindParam(':exam_id', $this->exam_id);
        $query->execute();

        $result = $query->fetch(PDO::FETCH_ASSOC);
        return $result['question_count'];
    }

}   