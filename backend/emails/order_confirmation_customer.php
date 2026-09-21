<?php
/**
 * Vars:
 * @var string $customerName
 * @var string $orderRef
 * @var string $itemsHtml
 * @var string $totalFormatted
 * @var string $trackUrl
 * @var string $deliveryEstimate
 */

$content = <<<HTML
<h2 style="margin:0 0 12px;color:#076935;">Your order is confirmed</h2>
<p style="margin:0 0 16px;">Hi <strong>{$customerName}</strong>,</p>
<p style="margin:0 0 16px;">
  Thank you for your order <strong>#{$orderRef}</strong>. Our team is packing
  your fresh harvest right now.
</p>

<table width="100%" cellpadding="0" cellspacing="0"
       style="margin:16px 0;border-collapse:collapse;font-size:14px;">

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
  <a href="{$trackUrl}"
     style="display:inline-block;background:#076935;color:#fff;padding:12px 22px;
            border-radius:24px;text-decoration:none;font-weight:bold;">
    Track Your Order
  </a>
</p>

<p style="color:#64748b;font-size:12px;margin-top:24px;">
  Estimated delivery: {$deliveryEstimate}
</p>
HTML;

$title = "Order #{$orderRef} confirmed";

include __DIR__ . '/layout.php';