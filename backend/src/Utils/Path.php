<?php
declare(strict_types=1);

final class Path {
  public static function matchId(string $path, string $prefix): ?int {
    // Example: matchId('/users/12', '/users/') => 12
    if (!str_starts_with($path, $prefix)) return null;
    $rest = substr($path, strlen($prefix));
    if ($rest === '' || !preg_match('/^\d+$/', $rest)) return null;
    return (int)$rest;
  }

  public static function matchSuffixId(string $path, string $prefix, string $suffix): ?int {
    // Example: '/borrows/12/return' prefix '/borrows/' suffix '/return'
    if (!str_starts_with($path, $prefix) || !str_ends_with($path, $suffix)) return null;
    $mid = substr($path, strlen($prefix), -strlen($suffix));
    if ($mid === '' || !preg_match('/^\d+$/', $mid)) return null;
    return (int)$mid;
  }
}