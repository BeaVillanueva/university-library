<?php
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$pw = $_GET['pw'] ?? '';
if ($pw === '') {
  echo "Usage: ?pw=YourNewPassword\n";
  exit;
}

echo password_hash($pw, PASSWORD_DEFAULT);