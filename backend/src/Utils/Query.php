<?php
declare(strict_types=1);

final class Query {
  public static function int(string $key, int $default, int $min = PHP_INT_MIN, int $max = PHP_INT_MAX): int {
    $v = $_GET[$key] ?? null;
    if ($v === null || $v === '') return $default;
    $i = (int)$v;
    if ($i < $min) $i = $min;
    if ($i > $max) $i = $max;
    return $i;
  }

  public static function str(string $key, string $default = ''): string {
    $v = $_GET[$key] ?? null;
    if ($v === null) return $default;
    return trim((string)$v);
  }

  public static function date(string $key): ?string {
    $v = self::str($key, '');
    if ($v === '') return null;
    return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : null;
  }
}