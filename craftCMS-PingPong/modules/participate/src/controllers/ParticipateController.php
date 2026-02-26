<?php

namespace modules\participate\controllers;

use Craft;
use craft\elements\Entry;
use craft\web\Controller;
use modules\participate\traits\ParticipateTrait;
use yii\filters\AccessControl;

class ParticipateController extends Controller
{
    use ParticipateTrait; // some helper methods
    private $user;

    public function init() : void {
        parent::init();
        $this->user = Craft::$app->getUser()->getIdentity(); // Haal de ingelogde gebruiker op
    }

    public function behaviors(): array {
        return array_merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::class,
                'rules' => [
                    [
                        'allow' => true,
                        'roles' => ['@'], // Alleen ingelogde gebruikers
                    ],
                ],
                'denyCallback' => function () {
                    return $this->redirect('/login');
                },
            ],
        ]);
    }

    public function actionAddParticipation() {
        // Haal de entryId en status op
        $entryId = Craft::$app->getRequest()->getRequiredParam('entryId');
        $status = Craft::$app->getRequest()->getRequiredParam('status');
        
        // Haal de ingelogde gebruiker op
        $userId = $this->user->id;
    
        // Zoek de juiste entry
        $entry = Craft::$app->getEntries()->getEntryById($entryId);
    
        if (!$entry) {
            // Handle the case when the entry isn't found
            throw new \yii\web\NotFoundHttpException("Entry not found.");
        }
    
        // Log voor debugging
        Craft::info('Entry found: ' . $entry->title, __METHOD__);
    
        // Haal de participatie items op
        $itemQuery = $entry->getFieldValue('participation_items');
        $existingItems = $itemQuery->all();
    
        // Voeg een nieuw item toe aan de participaties
        $newItem = $this->createParticipationItem($entry, $status, $userId);
        
        // Update de sortOrder en voeg het nieuwe item toe
        $participationItems = [
            'sortOrder' => array_map(fn($item) => $item->id, $existingItems)
        ];
        
        $participationItems['sortOrder'][] = $newItem->id;
        
        // Sla de participaties op in het entry
        $entry->setFieldValue('participation_items', $participationItems);
        Craft::$app->getElements()->saveElement($entry);
        
        // Redirect na deelname
        return $this->redirect('/');
    }
    
    
    private function findEntryById($entryId) {
        // Zoek de entry op basis van het entryId
        return Entry::find()
            ->section('playDates_section')  // Zorg ervoor dat we naar de juiste section zoeken
            ->id($entryId)          // Gebruik entryId om de juiste entry te vinden
            ->one();
    }
    
    private function createParticipationItem($entry, $status, $userId) {
        // Maak een nieuwe "matrixblok" entry (nu een Entry)
        $newItem = new Entry();
        $newItem->sectionId = $entry->sectionId;
        $newItem->typeId = $this->getEntryTypeForParticipationBlock();  // EntryType voor participatieblok
        $newItem->setFieldValue('p_status', $status);
        $newItem->setFieldValue('p_user', [$userId]);
    
        // Sla het nieuwe "matrixblok" entry op
        Craft::$app->getElements()->saveElement($newItem);
    
        return $newItem;
    }
    
    private function getEntryTypeForParticipationBlock() {
        // Haal het juiste Entry Type voor de matrixblok (nu een entry)
        return EntryType::find()
            ->section('playDates_section') // Zorg ervoor dat dit EntryType van de juiste section komt
            ->handle('participation_items')  // Handle van je matrix Entry Type
            ->one();
    }
    
}
