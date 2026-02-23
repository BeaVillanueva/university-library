<?php
declare(strict_types=1);

final class Jwt {
  private static function b64urlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  private static function b64urlDecode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) $data .= str_repeat('=', 4 - $remainder);
    return base64_decode(strtr($data, '-_', '+/')) ?: '';
  }

  public static function sign(array $payload, string $secret): string {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $segments = [
      self::b64urlEncode(json_encode($header, JSON_UNESCAPED_SLASHES)),
      self::b64urlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES)),
    ];
    $data = implode('.', $segments);
    $sig = hash_hmac('sha256', $data, $secret, true);
    $segments[] = self::b64urlEncode($sig);
    return implode('.', $segments);
  }

  public static function verify(string $token, string $secret): array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return ['valid' => false, 'error' => 'Invalid token format'];

    [$h64, $p64, $s64] = $parts;
    $data = $h64 . '.' . $p64;

    $sig = self::b64urlDecode($s64);
    $expected = hash_hmac('sha256', $data, $secret, true);

    if (!hash_equals($expected, $sig)) return ['valid' => false, 'error' => 'Invalid signature'];

    $payloadJson = self::b64urlDecode($p64);
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) return ['valid' => false, 'error' => 'Invalid payload'];

    $now = time();
    if (isset($payload['exp']) && is_numeric($payload['exp']) && $now > (int)$payload['exp']) {
      return ['valid' => false, 'error' => 'Token expired'];
    }

    return ['valid' => true, 'payload' => $payload];
  }
}