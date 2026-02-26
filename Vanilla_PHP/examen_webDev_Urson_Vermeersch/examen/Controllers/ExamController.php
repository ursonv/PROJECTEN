<?php

namespace App\Controllers;

use App\Models\Exam;
use App\Models\Question;
use App\Models\UserExam;
use App\Models\UserAnswer;

class ExamController extends BaseController {

    public static function index() {
        $exams = Exam::getAll();
        $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';

        self::loadView('/exam/list', [
            'title' => 'Homepage',
            'exams' => $exams,
            'searchTerm' => $searchTerm,
        ]);
    }

    public static function detail($id) {
        $exam = Exam::find($id);

        if ($exam === null) {
            header('Location: /?error=Exam not found');
            exit;
        }

        $exam->question_count = $exam->getQuestionCount();

        self::loadView('/exam/detail', [
            'title' => $exam->title,
            'exam' => $exam,
        ]);
    }

    public static function startExam($examId) {
        $exam = Exam::find($examId);

        if ($exam === null) {
            header('Location: /?error=Exam not found');
            exit;
        }

        UserExam::startExam(5, $examId);

        $questions = Question::getQuestionsForExam($examId);

        foreach ($questions as $question) {
            $question->answers = $question->getAnswers();
        }

        self::loadView('/exam/start', [
            'title' => 'Start Exam',
            'questions' => $questions,
            'exam' => $exam,
        ]);
    }

    public static function finishExam($userExamId, $examId) {
        $exam = Exam::find($examId);
        $userExam = UserExam::find($userExamId);
    
        if ($userExam === null) {
            header('Location: /?error=User exam not found');
            exit;
        }
    
        $userExam->finish_date = date('Y-m-d H:i:s');
        $userExam->save();
    

        $answers = $_POST['questions'];
        foreach ($answers as $questionId => $answer) {
            UserAnswer::saveAnswer($userExam->id, $questionId, $answer);
        }
    
        self::loadView('/exam/finish', [
            'title' => 'Finish Exam',
            'exam' => $exam,
        ]);
 
    }
    
}
