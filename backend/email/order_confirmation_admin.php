<?php
/**
 * Vars:
 * @var string $orderRef
 * @var string $customerName
 * @var string $customerPhone
 * @var string $customerEmail
 * @var string $deliveryAddress
 * @var string $itemsHtml
 * @var string $totalFormatted
 * @var string $orderDate
 * @var string $adminUrl
 */

$content = <<<HTML
<h2 style="margin:0 0 12px;color:#076935;">New order received: #{$orderRef}</h2>

<table width="100%" cellpadding="0" cellspacing="0"
       style="margin:0 0 16px;font-size:14px;">
  <tr>
    <td style="padding:6px 0;color:#64748b;width:130px;">Customer</td>
    <td style="padding:6px 0;font-weight:bold;">{$customerName}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Phone</td>
    <td style="padding:6px 0;">{$customerPhone}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Email</td>
    <td style="padding:6px 0;">{$customerEmail}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Address</td>
    <td style="padding:6px 0;">{$deliveryAddress}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Date</td>
    <td style="padding:6px 0;">{$orderDate}</td>
  </tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0"
       style="border-collapse:collapse;font-size:14px;">
  <thead>
    <tr style="background:#f4faf7;">
      <th align="left"  style="padding:10px;">Item</th>
      <th align="center" style="padding:10px;">Qty</th>
      <th align="right" style="padding:10px;">Subtotal</th>
    </tr>
  </thead>
  <tbody>{$itemsHtml}</tbody>
  <tfoot>
    <tr>
      <td colspan="2" align="right" style="padding:12px 10px;font-weight:bold;">Total</td>
      <td align="right" style="padding:12px 10px;font-weight:bold;color:#076935;">
        RWF {$totalFormatted}
      </td>
    </tr>
  </tfoot>
</table>

<p style="margin:24px 0 8px;">
  <a href="{$adminUrl}"
     style="display:inline-block;background:#076935;color:#fff;padding:12px 22px;
            border-radius:24px;text-decoration:none;font-weight:bold;">
    Open in Admin Dashboard
  </a>
</p>
HTML;

$title = "New order #{$orderRef}";

include __DIR__ . '/layout.php';