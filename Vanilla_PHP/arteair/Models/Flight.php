<?php

namespace App\Models;

class Flight extends BaseModel {

 
    protected function getAll() {
        global $db;

        $sql = "SELECT flight.*, 
                        aircraft.aircraft_code, aircraft.model, aircraft.aircraft_id,
                        f.name AS from_name, 
                        t.name AS to_name
                FROM flight
                JOIN aircraft ON flight.aircraft_id = aircraft.aircraft_id
                JOIN airport f ON `from` = f.airport_id
                JOIN airport t ON `to` = t.airport_id";

        $query = $db->prepare($sql);
        $query->execute();

        return self::castToModel($query->fetchAll());
    }

    protected function getById($id) {
        global $db;

        $sql = "SELECT flight.*, 
                        aircraft.aircraft_code, aircraft.model, 
                        f.name AS from_name, 
                        t.name AS to_name
                FROM flight
                JOIN aircraft ON flight.aircraft_id = aircraft.aircraft_id
                JOIN airport f ON `from` = f.airport_id
                JOIN airport t ON `to` = t.airport_id
                WHERE flight_id = ?";

        $query = $db->prepare($sql);
        $query->execute([ $id ]);

        return self::castToModel($query->fetchObject());
    }

    
}