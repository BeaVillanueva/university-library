<?php
declare(strict_types=1);

final class Text {
  /**
   * Convert a name to Title Case.
   * - trims
   * - collapses multiple spaces
   * - lowercases then uppercases first letter of each word
   *
   * Note: simple implementation; does not special-case "Mc", "O'", "de la", etc.
   */
  public static function titleCaseName(?string $s): string {
    $str = trim((string)($s ?? ''));
    if ($str === '') return '';

    // collapse whitespace
    $str = preg_replace('/\s+/', ' ', $str) ?? $str;

    $str = mb_strtolower($str, 'UTF-8');
    $parts = explode(' ', $str);

    $out = [];
    foreach ($parts as $w) {
      if ($w === '') continue;
      $first = mb_substr($w, 0, 1, 'UTF-8');
      $rest = mb_substr($w, 1, null, 'UTF-8');
      $out[] = mb_strtoupper($first, 'UTF-8') . $rest;
    }

    return implode(' ', $out);
  }
}