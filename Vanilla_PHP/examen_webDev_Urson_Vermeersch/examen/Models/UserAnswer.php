<?php

namespace App\Models;

use PDO;

class UserAnswer extends BaseModel {

    public static function saveAnswer($userExamId, $questionId, $answer) {
        global $db;
    
        $sql = "INSERT INTO user_answers (user_exam_id, question_id, answer) VALUES (:user_exam_id, :question_id, :answer)";
        $query = $db->prepare($sql);
        $query->bindParam(':user_exam_id', $userExamId);
        $query->bindParam(':question_id', $questionId);
        $query->bindParam(':answer', $answer);
        $query->execute();
    }
}
