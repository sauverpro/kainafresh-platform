<?php
return [
    'host'         => getenv('MAIL_HOST') ?: 'smtp.kainafresh.rw',
    'port'         => getenv('MAIL_PORT') ?: 587,
    'username'     => getenv('MAIL_USERNAME') ?: 'orders@kainafresh.rw',
    'password'     => getenv('MAIL_PASSWORD') ?: 'Myhandle12@!',
    'encryption'   => getenv('MAIL_ENCRYPTION') ?: 'tls',
    'from_address' => getenv('MAIL_FROM_ADDRESS') ?: 'orders@kainafresh.rw',
    'from_name'    => getenv('MAIL_FROM_NAME') ?: 'KainaFresh',
    'reply_to'     => getenv('MAIL_REPLY_TO') ?: 'orders@kainafresh.rw',
];