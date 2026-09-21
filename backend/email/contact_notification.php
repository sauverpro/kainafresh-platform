<?php
/**
 * Vars:
 * @var string $senderName
 * @var string $senderEmail
 * @var string $senderPhone
 * @var string $subjectLine
 * @var string $messageBody   (already nl2br'd or escaped)
 * @var string $receivedAt
 */

$content = <<<HTML
<h2 style="margin:0 0 12px;color:#076935;">New contact message</h2>

<table width="100%" cellpadding="0" cellspacing="0"
       style="margin:0 0 16px;font-size:14px;">
  <tr>
    <td style="padding:6px 0;color:#64748b;width:120px;">From</td>
    <td style="padding:6px 0;font-weight:bold;">{$senderName}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Email</td>
    <td style="padding:6px 0;">
      <a href="mailto:{$senderEmail}" style="color:#076935;">{$senderEmail}</a>
    </td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Phone</td>
    <td style="padding:6px 0;">{$senderPhone}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Subject</td>
    <td style="padding:6px 0;">{$subjectLine}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Received</td>
    <td style="padding:6px 0;">{$receivedAt}</td>
  </tr>
</table>

<div style="background:#f4faf7;border-left:4px solid #076935;
            padding:16px;border-radius:8px;font-size:14px;line-height:1.6;">
  {$messageBody}
</div>
HTML;

$title = "Contact: {$subjectLine}";

include __DIR__ . '/layout.php';