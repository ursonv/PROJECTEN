<?php

namespace modules\bill\events;

use Craft;
use craft\db\Query;
use craft\elements\Entry;
use studioespresso\molliepayments\events\TransactionUpdateEvent;
use studioespresso\molliepayments\events\PaymentUpdateEvent;
use studioespresso\molliepayments\MolliePayments;
use yii\base\Event;
use studioespresso\molliepayments\elements\Payment;
use studioespresso\molliepayments\services\Transaction;

/**
 * PaymentUpdate class.
 */
class PaymentUpdate {

    public static function handle() {
        Event::on(
            Payment::class,
            MolliePayments::EVENT_BEFORE_PAYMENT_SAVE,
            function (PaymentUpdateEvent $event) {
                // handle the event here
            }
        );

        // listen for the transaction update event
        Event::on(
            Transaction::class,
            MolliePayments::EVENT_AFTER_TRANSACTION_UPDATE,
            function (TransactionUpdateEvent $event) {
                // log the event
                Craft::info(['Transactie update']);
                
                // check if the status is paid
                if($event->status == "paid") {
                    // obtain the transaction ID from the event
                    $transactionUId = $event->transaction['id'];

                    // finally, update the related Bill
                    self::updateBill($transactionUId);
                }
            }
        );
    }

    /**
     * Updates the bill with the given transaction ID.
     *
     * @param string $transactionId The ID of the transaction to update the bill with.
     *
     * @return void
     */
    private static function updateBill($transactionId) {
        // get the payment ID from the transaction
        $transactionRecord = (new Query())
            ->select(['payment'])
            ->from('mollie_transactions')
            ->where(['id' => $transactionId])
            ->one();
        
        if ($transactionRecord) {
            $paymentId = $transactionRecord['payment'];
        } else {
            Craft::error('Transaction not found: ' . $transactionId, __METHOD__);
            return;
        }
    
        // find the payment
        $payment = Payment::find()
            ->id($paymentId)
            ->one();
        
        if (!$payment) {
            Craft::error('Payment not found: ' . $paymentId, __METHOD__);
            return;
        }
    
        // get the bill ID from the payment
        $billId = $payment->bill;
    
        // find the bill
        $bill = Entry::find()
            ->section('bill_section')
            ->uid($billId)
            ->one();
    
        if (!$bill) {
            Craft::error('Bill not found: ' . $billId, __METHOD__);
            return;
        }
    
        // Update the title based on the payment status
        if ($bill->bill_status === 'Open') {
            // Update to PAID and change item count if necessary
            $itemsCount = count($bill->bill_items);  // or use another way to count items
            $bill->title = "[PAID] Bill voor " . Craft::$app->getUser()->getIdentity()->username . " (" . $itemsCount . " items)";
        }
    
        $bill->bill_status = "Paid";
        if (!Craft::$app->elements->saveElement($bill)) {
            Craft::error('Failed to save bill element: ' . $billId, __METHOD__);
        }
    }    
}