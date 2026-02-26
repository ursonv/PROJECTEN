<?php

namespace modules\bill\controllers;

use Craft;
use craft\elements\Entry;
use craft\web\Controller;
use modules\bill\traits\BillTrait;
use yii\filters\AccessControl;

class BillController extends Controller
{
    use BillTrait; // some helper methods

    private $userId;

    public function init() : void {
        parent::init();

        // get the logged in user id
        $this->userId = Craft::$app->getUser()->getIdentity()->getId();
    }
    
    /**
     * Defines the behaviors for the BillController.
     * By adding the AccessControl behavior, we can ensure that only logged in users can access the methods in this controller.
     *
     * @return array An array of behaviors to be applied to the controller.
     */
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

    /**
     * Adds an item to the bill.
     *
     * This method handles the addition of an item to the user's bill.
     *
     * @return void
     */
    public function actionAddItem() {
        // get the drink id from the request
        $drinkId = Craft::$app->getRequest()->getRequiredParam('drink');
        $quantity = Craft::$app->getRequest()->getParam('quantity', 1); // default quantity is 1 if not provided

        // get logged in user id
        $userId = $this->userId;

        // find existing open bill, if not found create a new one
        $entry = $this->findOrCreateBill($userId);

        // Get the matrix field data
        $itemQuery = $entry->getFieldValue('bill_items'); // bill_items is the handle of the matrix field
        $existing_items = $itemQuery->all(); // Get all the items
        
        // create a new array with the existing items, we need this to update the sortOrder array
        $bill_items = [
            'sortOrder' => array_map(fn($item) => $item->id, $existing_items)
        ];

        // finally, create a new bill item
        $newItem = $this->createNewBillItem($entry, $drinkId, $quantity);

        // add the new item to the sortOrder array
        $bill_items['sortOrder'][] = $newItem->id;

        // update the bill title
        $entry->title = "[OPEN] Bill  " . Craft::$app->getUser()->getIdentity()->username . " (" . count($bill_items['sortOrder']) . " items)";

        // save the new sortOrder array
        $entry->bill_items = $bill_items;

        // save the entry
        Craft::$app->getElements()->saveElement($entry);

        // redirect to the bill page
        return $this->redirect('/drinks');
    }

    /**
     * Finds an existing bill for the given user ID or creates a new one if it doesn't exist.
     *
     * @param int $userId The ID of the user for whom to find or create the bill.
     * @return Bill The found or newly created bill.
     */
    private function findOrCreateBill($userId) {

        // find the bill entry for the given user
        $entry = Entry::find()
            ->section('bill_section')
            ->bill_status('open')
            ->relatedTo([
                'targetElement' => $userId,
                'field' => 'bill_user',
            ])
            ->orderBy('dateCreated DESC')
            ->one();

        // if no bill is found, create a new one
        if (!$entry) {
            $entry = $this->createNewBill($userId);
        }

        // return the found or newly created bill
        return $entry;
    }

    /**
     * Creates a new bill for the given user.
     *
     * @param int $userId The ID of the user for whom the bill is being created.
     * @return void
     */
    private function createNewBill($userId) {
        $section = $this->getSectionByHandle('bill_section');
        $entryType = $this->getEntryType($section);

        $entry = new Entry();
        $entry->sectionId = $section->id;
        $entry->typeId = $entryType->id;
        $entry->authorId = $userId;
        $entry->enabled = true;
        $entry->title = '[NEW] Bill for ' . Craft::$app->getUser()->getIdentity()->username;
        $entry->bill_status = 'open';
        $entry->bill_user = [$userId];
        Craft::$app->getElements()->saveElement($entry);

        return $entry;
    }

    /**
     * Creates a new bill item.
     *
     * @param mixed $entry The entry data for the new bill item.
     * @param int $drinkId The ID of the drink to be associated with the bill item.
     * @return void
     */
    private function createNewBillItem($entry, $drinkId, $quantity) {
        
        $userId = $this->userId;
        $itemFieldId = $entry->bill_items->fieldId[0];

        // get the drink entry for some basic data
        $drink = Entry::find()
            ->section('drinks')
            ->id($drinkId)
            ->one();

        $drinkImg = $drink->image->one();

        // now we can add the new item to the array
        // for this we need to create a new item and save it
        $newItem = new Entry(); // Maak een nieuw item aan
        
        // meta data
        $newItem->fieldId = $itemFieldId; // De ID van het matrix veldx
        $newItem->authorId = $userId; // De ID van de auteur
        $newItem->ownerId = $entry->id; // De ID van de entry waartoe het item behoort
        $newItem->enabled = true; // Zorg dat het item is ingeschakeld
        
        // fields
        $newItem->title = $drink->title; // Zorg dat de titel uniek is
        $newItem->image = [$drinkImg->id];
        $newItem->price = $drink->price->getAmount(); 
        $newItem->amount = $quantity;
         
        // Sla het item op
        Craft::$app->getElements()->saveElement($newItem);
        
        return $newItem;
    }
    
    public function actionRemoveItem($id) {
        // get the logged-in user id
        $userId = $this->userId;
    
        // find the open bill
        $entry = $this->findOrCreateBill($userId);
    
        // get the bill items
        $itemQuery = $entry->getFieldValue('bill_items');
        $items = $itemQuery->all(); // Get all the items
    
        // Find the item by its ID
        $itemToRemove = null;
        foreach ($items as $item) {
            if ($item->id == $id) {
                $itemToRemove = $item;
                break;
            }
        }
    
        if ($itemToRemove) {
            // Remove the item from the bill's items field
            $bill_items = [
                'sortOrder' => array_map(fn($item) => $item->id, $items),
            ];
    
            // Remove the item ID from the sortOrder array
            $bill_items['sortOrder'] = array_filter($bill_items['sortOrder'], fn($itemId) => $itemId != $id);
    
            // Update the bill's items field
            $entry->bill_items = $bill_items;
    
            // Update the title with the new count of items
            $entry->title = "[OPEN] Bill  " . Craft::$app->getUser()->getIdentity()->username . " (" . count($bill_items['sortOrder']) . " items)";
    
            // Save the bill
            Craft::$app->getElements()->saveElement($entry);
    
            // Redirect back to the bill page
            return $this->redirect('/bill');
        } else {
            // Handle the case where the item is not found
            Craft::$app->getSession()->setError('Item not found in your bill.');
            return $this->redirect('/bill');
        }
    }
    public function actionUpdateItem() {
        $itemId = Craft::$app->getRequest()->getRequiredParam('itemId');
        $quantity = Craft::$app->getRequest()->getParam('quantity', 1);
    
        // Haal de open rekening op
        $entry = $this->findOrCreateBill($this->userId);
    
        $itemQuery = $entry->getFieldValue('bill_items');
        $items = $itemQuery->all();
        
        $itemToUpdate = null;
        foreach ($items as $item) {
            if ($item->id == $itemId) {
                $itemToUpdate = $item;
                break;
            }
        }
        
        if ($itemToUpdate) {
            // Werk de hoeveelheid bij
            $itemToUpdate->amount = $quantity;
            Craft::$app->getElements()->saveElement($itemToUpdate);
        
            // Werk de rekening bij met de nieuwe hoeveelheden
            $bill_items = [
                'sortOrder' => array_map(fn($item) => $item->id, $items),
            ];
            $entry->bill_items = $bill_items;
        
            // Update de titel van de rekening
            $entry->title = "[OPEN] Bill  " . Craft::$app->getUser()->getIdentity()->username . " (" . count($bill_items['sortOrder']) . " items)";
            Craft::$app->getElements()->saveElement($entry);
        }
        
    
        return $this->redirect('/bill');
    }
    
    public function actionViewAllBills() {
        // Controleer of de gebruiker een admin is
        $user = Craft::$app->getUser();
        if (!$user->getIsAdmin()) {
            // Redirect naar een foutpagina of homepage als de gebruiker geen admin is
            return $this->redirect('/')->setStatusCode(403);
        }
    
        // Haal alle bills op
        $bills = Entry::find()
            ->section('bill_section')
            ->all();
    
        // Render een template en geef de bills door
        return $this->renderTemplate('bill/manage', [
            'bills' => $bills,
        ]);
    }

    public function actionPaymentSucceed() {
        // Haal de 'status' uit de URL
        $status = Craft::$app->getRequest()->getParam('status');
    
        // Controleer of de betaling succesvol is
        if ($status === 'paid') {
            // Zoek de open bill voor de huidige gebruiker (op basis van de gebruiker en de factuurstatus)
            $entry = Entry::find()
                ->section('bill_section')
                ->bill_status('open')
                ->relatedTo([
                    'targetElement' => $this->userId,  // Zoek naar de bill voor de ingelogde gebruiker
                    'field' => 'bill_user',  // Het veld dat de relatie naar de gebruiker heeft
                ])
                ->one();
    
            // Als de bill gevonden is
            if ($entry) {
                // Werk de status van de bill bij naar 'paid'
                $entry->bill_status = 'paid';
    
                // Sla de entry op
                Craft::$app->getElements()->saveElement($entry);
    
                // Stuur een notificatie naar de gebruiker
                $this->notifyOnPaid($entry);
    
                // Optioneel: toon een succesbericht of redirect de gebruiker
                //dd('Betaling succesvol ontvangen.');
                return $this->redirect('/bill/succeed');
            } else {
                // Als er geen open bill wordt gevonden voor deze gebruiker, toon een foutmelding
                //dd('Geen open factuur gevonden voor deze betaling.');
                return $this->redirect('/drinks');
            }
        } else {
            // Als de betaling niet succesvol was, toon een foutmelding
            //dd('Betaling mislukt.');
            return $this->redirect('/drinks');
        }
    }

    public function actionPaymentSucceedId() {
        // Haal de 'status' uit de URL
        $status = Craft::$app->getRequest()->getParam('status');
        
        // Haal de bill_uid op uit de GET-parameter (deze komt van de URL)
        $billUid = Craft::$app->getRequest()->getParam('bill_uid');
        
        // Zoek de bill op basis van de bill_uid
        $bill = Entry::find()
            ->section('bill_section')
            ->uid($billUid)
            ->one();
        
        if ($bill && $status === 'paid') {
            // Haal de gebruiker op die aan de bill is gekoppeld via het veld bill_user
            $user = $bill->bill_user->one();
            
            if ($user) {
                // Werk de status van de bill bij naar 'paid'
                $bill->bill_status = 'paid';
                
                // Sla de entry op
                Craft::$app->getElements()->saveElement($bill);
                
                // Stuur een notificatie naar de gebruiker
                $this->notifyOnPaid($bill);
                
                // Optioneel: toon een succesbericht of redirect de gebruiker
                return $this->redirect('/bill/succeed');
            } else {
                // Als er geen gebruiker aan de bill is gekoppeld
                return $this->redirect('/bill/manage');
            }
        } else {
            // Als de betaling niet succesvol was of de bill niet gevonden is
            return $this->redirect('/bill/manage');
        }
    }
    
    
    


    public function notifyOnPaid($bill) {
        $mailer = craft::$app->getMailer();
        
        $user = $bill->getFieldValue('bill_user')->one();
        $email = $user ? $user->email : 'test@example.com';
    
        Craft::debug('Versturen naar: ' . $email, __METHOD__);
    
        $message = $mailer->compose()
            ->setTo($email) 
            ->setSubject('Your bill is paid!')
            ->setHtmlBody(
                craft::$app->view->renderTemplate(
                    '_emails/bill-paid',
                    [
                        'bill' => $bill
                    ]
                )
            );
    
        // Verstuur de e-mail
        if (!$mailer->send($message)) {
            Craft::error('De e-mail kon niet worden verzonden.', __METHOD__);
        }
    }
    

    public function actionMarkAsPaid($billId) {
        // Find the bill entry by its ID
        $entry = Entry::findOne($billId);

        if ($entry && $entry->section->handle == 'bill_section') {
            // Update the bill's status to 'paid'
            $entry->bill_status = 'paid';

            // Save the updated entry
            Craft::$app->getElements()->saveElement($entry);

            // Call the notifyOnPaid function
            $this->notifyOnPaid($entry);

            // Optionally, redirect or show a success message
            Craft::$app->getSession()->setNotice('Bill marked as paid and user notified.');
            return $this->redirect('/bill');
        } else {
            // Handle the case where the bill does not exist or is not part of the correct section
            Craft::$app->getSession()->setError('Bill not found.');
            return $this->redirect('/bill');
        }
    }

    public function actionDetail($billId) {
        // Haal de bill op op basis van de meegegeven ID
        $bill = Entry::find()
            ->section('bill_section')
            ->id($billId)
            ->one();
    
        if (!$bill) {
            Craft::$app->getSession()->setError('Bill not found.');
            return $this->redirect('/bill/manage');
        }
        // Haal de beschikbare drankjes op (bijvoorbeeld alle drankjes uit de "drink_section")
        $availableDrinks = Entry::find()
        ->section('drinks')  // Pas dit aan naar de juiste sectie voor drankjes
        ->all();
        // Render het detail template met de bill data
        return $this->renderTemplate('bill/detail', [
            'bill' => $bill,
            'availableDrinks' => $availableDrinks,
        ]);
    }

    public function actionAddDrink($billId) {
        // Haal de bill op via de billId
        $bill = Entry::find()
            ->section('bill_section')
            ->id($billId)
            ->one();
    
        if (!$bill) {
            // Als de bill niet gevonden wordt, gooi een fout
            throw new NotFoundHttpException('Bill not found');
        }
    
        // Verkrijg de geselecteerde drank
        $drinkId = Craft::$app->getRequest()->getBodyParam('drink');
        $drink = Entry::find()
            ->section('drinks') // Zorg ervoor dat dit het juiste veld is voor de dranken
            ->id($drinkId)
            ->one();
    
        if ($drink) {
            // Voeg de drank toe aan de bill (update de bill_items matrix veld)
            $itemQuery = $bill->getFieldValue('bill_items');
            $existing_items = $itemQuery->all(); // Haal alle bestaande items op
            
            // Maak een nieuwe item voor de drank
            $newItem = $this->createNewBillItem($bill, $drinkId, 1);  // Voeg de drank toe met hoeveelheid 1
            
            // Voeg de nieuwe item toe aan de sortOrder array
            $bill_items = [
                'sortOrder' => array_map(fn($item) => $item->id, $existing_items) 
            ];
            $bill_items['sortOrder'][] = $newItem->id;  // Voeg de nieuwe item ID toe aan de sortOrder
    
            // Update de factuur
            $bill->bill_items = $bill_items;
    
            // Sla de bill op
            Craft::$app->getElements()->saveElement($bill);
        }
    
        // Redirect de gebruiker terug naar de detailpagina
        return $this->redirect('bill/detail/' . $bill->id);
        //return "test";
    }
    

    public function actionCreate() {
        // Check of de gebruiker een admin is
        if (!Craft::$app->getUser()->getIsAdmin()) {
            return $this->redirect('/login');
        }
    
        // Verkrijg de status en gebruiker uit het formulier
        $status = Craft::$app->getRequest()->getRequiredParam('status');
        $userId = Craft::$app->getRequest()->getRequiredParam('user');
        
        // Maak een nieuwe bill aan met de opgegeven gegevens
        $entry = new Entry();
        $entry->sectionId = $this->getSectionByHandle('bill_section')->id;
        $entry->typeId = $this->getEntryType($entry->section)->id;
        $entry->title = '[NEW] Bill';
        $entry->bill_status = $status;  // De status die werd gekozen
        $entry->bill_user = [$userId];  // De geselecteerde gebruiker
    
        // Sla de entry op
        if (Craft::$app->getElements()->saveElement($entry)) {
            Craft::$app->getSession()->setNotice('Bill successfully created.');
        } else {
            Craft::$app->getSession()->setError('There was an error creating the bill.');
        }
    
        // Redirect terug naar de manage pagina
        return $this->redirect('bill/manage');
    }
    
    
}