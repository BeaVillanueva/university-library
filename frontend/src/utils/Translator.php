<?php
// backend/src/Utils/Translator.php

class Translator {
  private static array $translations = [];
  private static string $currentLanguage = 'en';

  public static function init(string $language = 'en'): void {
    self::$currentLanguage = $language;
    self::loadTranslations($language);
  }

  private static function loadTranslations(string $language): void {
    $filePath = __DIR__ . '/../../config/translations/' . $language . '.php';
    if (file_exists($filePath)) {
      self::$translations = require $filePath;
    }
  }

  public static function get(string $key, array $params = []): string {
    $value = self::$translations[$key] ?? $key;
    
    foreach ($params as $paramKey => $paramValue) {
      $value = str_replace(":{$paramKey}", $paramValue, $value);
    }
    
    return $value;
  }

  public static function setLanguage(string $language): void {
    self::$currentLanguage = $language;
    self::loadTranslations($language);
  }

  public static function getLanguage(): string {
    return self::$currentLanguage;
  }
}