<?php

namespace App\Models;

use PDO;

class Comment extends BaseModel {

    // Haal opmerkingen op basis van artikel-ID
    protected function getByArticleId($article_id) {
        global $db;

        // SQL-query om opmerkingen op te halen voor een specifiek artikel
        $sql = "SELECT * FROM comments WHERE article_id = :article_id";

        // Bereid de SQL-query voor
        $stmnt = $db->prepare($sql);

        // Voer de SQL-query uit met het opgegeven artikel-ID
        $stmnt->execute([
            ':article_id' => $article_id
        ]);

        // Haal de resultaten op en cast deze naar het Comment-model
        $stmnt->setFetchMode(\PDO::FETCH_CLASS, 'App\Models\Comment');
        $results = $stmnt->fetchAll();

        // Geef de resultaten terug
        return $results;
    }

}
