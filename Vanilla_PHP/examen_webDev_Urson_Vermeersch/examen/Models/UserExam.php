<?php
namespace App\Models;

use PDO;

class UserExam extends BaseModel {

    public static function startExam($userId, $examId) {
        global $db;

        $sql = "INSERT INTO user_exams (user_id, exam_id, start_date) VALUES (:user_id, :exam_id, NOW())";
        $query = $db->prepare($sql);
        $query->bindParam(':user_id', $userId);
        $query->bindParam(':exam_id', $examId);
        $query->execute();
    }


    public function stopExam($userExamId) {
        global $db;

        $sql = "UPDATE user_exams SET finish_date = NOW() WHERE id = :user_exam_id";
        $query = $db->prepare($sql);
        $query->bindParam(':user_exam_id', $userExamId);
        $query->execute();
    }
}
