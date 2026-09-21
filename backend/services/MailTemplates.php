<?php
// services/MailTemplates.php

require_once __DIR__ . '/Mailer.php';

class MailTemplates
{
    private Mailer $mailer;

    public function __construct(array $config)
    {
        $this->mailer = new Mailer($config);
    }

    /* ---------------------------------------------------------------
     * Internal: render an email template file
     * --------------------------------------------------------------- */
    private function render(string $template, array $vars): string
    {
        $path = __DIR__ . '/../emails/' . $template . '.php';
        if (!is_readable($path)) {
            throw new RuntimeException("Email template not found: {$template}");
        }
        extract($vars, EXTR_SKIP);
        ob_start();
        include $path;
        return (string) ob_get_clean();
    }

    /* ---------------------------------------------------------------
     * Build the item rows once, reuse in both order emails
     * --------------------------------------------------------------- */
    private function buildItemsHtml(array $items): string
    {
        $html = '';
        foreach ($items as $it) {
            $name     = htmlspecialchars($it['product_name'] ?? ('Product #' . $it['product_id']));
            $qty      = (int) $it['quantity'];
            $subtotal = (float) ($it['subtotal'] ?? ($it['quantity'] * $it['unit_price']));
            $html .= "<tr>
                <td style='padding:10px;border-top:1px solid #eef2f5;'>{$name}</td>
                <td align='center' style='padding:10px;border-top:1px solid #eef2f5;'>{$qty}</td>
                <td align='right' style='padding:10px;border-top:1px solid #eef2f5;'>RWF "
                . number_format($subtotal) . "</td>
            </tr>";
        }
        return $html;
    }

    /* ---------------------------------------------------------------
     * 1. Customer order confirmation
     * --------------------------------------------------------------- */
    public function sendOrderConfirmationToCustomer(
        array $order,
        array $items,
        string $customerEmail
    ): bool {
        $ref = $order['order_reference']
            ?? ('KF-' . str_pad((string) $order['id'], 4, '0', STR_PAD_LEFT));

        $html = $this->render('order_confirmation_customer', [
            'customerName'     => $order['customer_first_name'] ?? 'Customer',
            'orderRef'         => $ref,
            'itemsHtml'        => $this->buildItemsHtml($items),
            'totalFormatted'   => number_format((float) ($order['total'] ?? 0)),
            'trackUrl'         => 'https://kainafresh.rw/track-order?id=' . urlencode($ref),
            'deliveryEstimate' => 'Tomorrow, 8:00 AM – 12:00 PM',
        ]);

        return $this->mailer->send(
            $customerEmail,
            "Order {$ref} confirmed – Kaina Fresh Ltd",
            $html
        );
    }

    /* ---------------------------------------------------------------
     * 2. Admin / operations order notification
     * --------------------------------------------------------------- */
    public function sendOrderConfirmationToAdmin(
        array $order,
        array $items,
        array $adminRecipients  
    ): bool {
        $ref = $order['order_reference']
            ?? ('KF-' . str_pad((string) $order['id'], 4, '0', STR_PAD_LEFT));

        $html = $this->render('order_confirmation_admin', [
            'orderRef'        => $ref,
            'customerName'    => trim(
                ($order['customer_first_name'] ?? '') . ' ' .
                ($order['customer_last_name'] ?? '')
            ) ?: 'Customer',
            'customerPhone'   => $order['customer_phone'] ?? '—',
            'customerEmail'   => $order['customer_email'] ?? '—',
            'deliveryAddress' => $order['customer_address'] ?? '—',
            'itemsHtml'       => $this->buildItemsHtml($items),
            'totalFormatted'  => number_format((float) ($order['total'] ?? 0)),
            'orderDate'       => date('D, d M Y H:i', strtotime($order['order_date'] ?? 'now')),
            'adminUrl'        => 'https://kainafresh.rw/admin/orders/' . urlencode((string) $order['id']),
        ]);

        return $this->mailer->send(
            $adminRecipients,
            "[NEW ORDER] {$ref} – " . number_format((float) ($order['total'] ?? 0)) . " RWF",
            $html
        );
    }

    /* ---------------------------------------------------------------
     * 3. Contact form notification
     * --------------------------------------------------------------- */
    public function sendContactNotification(
        array $form,             // name, email, phone, subject, message
        array $supportRecipients // ["support@kainafresh.rw" => "Support"]
    ): bool {
        $html = $this->render('contact_notification', [
            'senderName'    => htmlspecialchars($form['name'] ?? '—'),
            'senderEmail'   => htmlspecialchars($form['email'] ?? '—'),
            'senderPhone'   => htmlspecialchars($form['phone'] ?? '—'),
            'subjectLine'   => htmlspecialchars($form['subject'] ?? 'General Inquiry'),
            'messageBody'   => nl2br(htmlspecialchars($form['message'] ?? '')),
            'receivedAt'    => date('D, d M Y H:i'),
        ]);

       

        return $this->mailer->send(
            $supportRecipients,
            "Contact form: " . ($form['subject'] ?? 'New message'),
            $html
        );
    }

    /* ---------------------------------------------------------------
     * 3. Inquiry form notification
     * --------------------------------------------------------------- */
    public function sendInquiryNotification(
        array $form,             // name, email, phone, subject, message
        array $supportRecipients 
    ): bool {
        $html = $this->render('inquiry_notification', [
            'senderName'    => htmlspecialchars($form['companyName'] ?? '—'),
            'senderEmail'   => htmlspecialchars($form['email'] ?? '—'),
            'senderPhone'   => htmlspecialchars($form['phone'] ?? '—'),
            'subjectLine'   => htmlspecialchars($form['productInterest'] ?? '-'),
            'country'   => htmlspecialchars($form['country'] ?? '-'),
            'estimatedQuantity'   => htmlspecialchars($form['estimatedQuantity'] ?? '-'),
            'messageBody'   => nl2br(htmlspecialchars($form['message'] ?? '')),
            'receivedAt'    => date('D, d M Y H:i'),
        ]);

       

        return $this->mailer->send(
            $supportRecipients,
            "Inquiry form: " . ($form['productInterest'] ?? 'New message'),
            $html
        );
    }
}