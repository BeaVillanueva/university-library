<?php
declare(strict_types=1);

// Run in browser or CLI to generate a password_hash.
// Example (CLI): php backend/tools/hash.php "Password123!"

$pw = $argv[1] ?? ($_GET['pw'] ?? '');
if ($pw === '') {
  echo "Usage: php hash.php \"Password123!\"\nOr visit: hash.php?pw=Password123!\n";
  exit;
}

echo password_hash((string)$pw, PASSWORD_DEFAULT) . "\n";