<?php

namespace App\Models;

class User extends BaseModel {

    // Haal artikelen op die aan deze gebruiker zijn gekoppeld
    public function articles() {
        $sql = "SELECT * FROM articles WHERE user_id = :user_id ORDER BY created_on DESC LIMIT 20";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $this->user_id]);
        $stmt->setFetchMode(\PDO::FETCH_CLASS, 'App\Models\Article');
        return $stmt->fetchAll();
    }

    // Genereer de volledige naam van de gebruiker
    public function fullName() {
        return $this->firstname . ' ' . $this->lastname;
    }

    // Zoek een gebruiker op basis van het e-mailadres
    protected function findByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['email' => $email]);
        $stmt->setFetchMode(\PDO::FETCH_CLASS, 'App\Models\User');
        return $stmt->fetch();
    }

    // Registreer een nieuwe gebruiker
    public function register() {

        // Controleer of het e-mailadres al bestaat
        if ($this->findByEmail($this->email)) {
            throw new \Exception('Email already exists');
        }

        // Voeg de nieuwe gebruiker toe aan de database
        $sql = "INSERT INTO users (firstname, lastname, email, password) VALUES (:firstname, :lastname, :email, :password)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'firstname' => $this->firstname,
            'lastname' => $this->lastname,
            'email' => $this->email,
            'password' => password_hash($this->password, PASSWORD_DEFAULT)
        ]);
        $this->user_id = $this->db->lastInsertId();
    }

}
