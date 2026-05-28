<?php
// backend/src/Controllers/UserPreferencesController.php

final class UserPreferencesController {

  /**
   * Get user preferences
   */
  public static function get(PDO $pdo, array $auth): void {
    $userId = (int)($auth['user_id'] ?? 0);

    $stmt = $pdo->prepare("
      SELECT * FROM user_preferences WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $prefs = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$prefs) {
      // Create default preferences
      $stmt = $pdo->prepare("
        INSERT INTO user_preferences (user_id, language, theme_mode, font_size)
        VALUES (?, 'en', 'system', 'normal')
      ");
      $stmt->execute([$userId]);
      $prefs = [
        'user_id' => $userId,
        'language' => 'en',
        'theme_mode' => 'system',
        'font_size' => 'normal',
        'text_to_speech_enabled' => false,
      ];
    }

    Http::ok(['preferences' => $prefs]);
  }

  /**
   * Update user preferences
   */
  public static function update(PDO $pdo, array $auth): void {
    $userId = (int)($auth['user_id'] ?? 0);
    $data = Http::readJsonBody();

    $language = trim((string)($data['language'] ?? 'en'));
    $themeMode = trim((string)($data['theme_mode'] ?? 'system'));
    $fontSize = trim((string)($data['font_size'] ?? 'normal'));
    $ttsEnabled = (bool)($data['text_to_speech_enabled'] ?? false);

    // Validate
    if (!in_array($language, ['en', 'tl'], true)) {
      Http::error('Invalid language', 422);
    }
    if (!in_array($themeMode, ['system', 'light', 'dark'], true)) {
      Http::error('Invalid theme mode', 422);
    }
    if (!in_array($fontSize, ['small', 'normal', 'large'], true)) {
      Http::error('Invalid font size', 422);
    }

    $stmt = $pdo->prepare("
      UPDATE user_preferences
      SET language = ?, theme_mode = ?, font_size = ?, text_to_speech_enabled = ?
      WHERE user_id = ?
    ");
    $stmt->execute([$language, $themeMode, $fontSize, $ttsEnabled ? 1 : 0, $userId]);

    Http::ok(['message' => 'Preferences updated']);
  }
}
?>
