<?php
declare(strict_types=1);

final class Csv {
  public static function outputDownload(string $filename, array $headers, array $rows): void {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    $out = fopen('php://output', 'w');
    if ($out === false) {
      Http::error('Failed to open output stream', 500);
    }

    fputcsv($out, $headers);

    foreach ($rows as $row) {
      $line = [];
      foreach ($headers as $h) $line[] = $row[$h] ?? '';
      fputcsv($out, $line);
    }
    fclose($out);
    exit;
  }
}