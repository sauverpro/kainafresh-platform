<?php
/**
 * @var string $title
 * @var string $content  rendered inner HTML
 * @var string|null $preheader
 */
$appName = 'KainaFresh';
$appUrl  = 'https://kainafresh.rw';
$year    = date('Y');
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($title) ?></title>
</head>
<body style="margin:0;padding:0;background:#f4faf7;font-family:Arial,sans-serif;color:#1f2937;">
  <?php if (!empty($preheader)): ?>
    <div style="display:none;font-size:1px;color:#f4faf7;"><?= htmlspecialchars($preheader) ?></div>
  <?php endif; ?>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:24px 12px;">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;
                    border:1px solid #07693522;box-shadow:0 4px 16px rgba(0,0,0,0.04);">

        <tr><td style="background:#076935;color:#fff;padding:24px 32px;">
          <div style="font-size:20px;font-weight:bold;"><?= $appName ?></div>
        </td></tr>

        <tr><td style="padding:32px;">
          <?= $content ?>
        </td></tr>

        <tr><td style="background:#f4faf7;padding:20px 32px;color:#64748b;font-size:12px;text-align:center;">
          &copy; <?= $year ?> <?= $appName ?>. All rights reserved.<br>
          <a href="<?= $appUrl ?>" style="color:#076935;text-decoration:none;">Visit our store</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>