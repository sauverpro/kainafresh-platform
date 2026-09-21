<?php
// services/Mailer.php

require_once __DIR__ . '/../lib/PHPMailer/Exception.php';
require_once __DIR__ . '/../lib/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../lib/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer
{
    private PHPMailer $mail;
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->mail = new PHPMailer(true);

        $this->mail->isSMTP();
        $this->mail->Host       = $config['host'];
        $this->mail->SMTPAuth   = true;
        $this->mail->Username   = $config['username'];
        $this->mail->Password   = $config['password'];
        $this->mail->SMTPSecure = $config['encryption'] === 'ssl'
            ? PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port       = (int) $config['port'];
        $this->mail->CharSet    = 'UTF-8';

        $this->mail->setFrom($config['from_address'], $config['from_name']);
        if (!empty($config['reply_to'])) {
            $this->mail->addReplyTo($config['reply_to']);
        }
    }

    /**
     * Send an email.
     *
     * @param string|array $to  "email" OR ["email" => "Name", ...]
     * @param string $subject
     * @param string $htmlBody
     * @param string|null $altBody
     * @param array $attachments [['path' => '/...', 'name' => '...'], ...]
     */
    public function send(
        string|array $to,
        string $subject,
        string $htmlBody,
        ?string $altBody = null,
        array $attachments = []
    ): bool {
        try {
            $this->mail->clearAddresses();
            $this->mail->clearAttachments();

            if (is_array($to)) {
                foreach ($to as $address => $name) {
                    $this->mail->addAddress($address, is_string($name) ? $name : '');
                }
            } else {
                $this->mail->addAddress($to);
            }

            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body    = $htmlBody;
            $this->mail->AltBody = $altBody ?? strip_tags($htmlBody);

            foreach ($attachments as $a) {
                if (!empty($a['path']) && is_readable($a['path'])) {
                    $this->mail->addAttachment($a['path'], $a['name'] ?? '');
                }
            }

            return $this->mail->send();
        } catch (Exception $e) {
            error_log('[Mailer] ' . $this->mail->ErrorInfo);
            return false;
        }
    }
}