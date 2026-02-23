<?php
declare(strict_types=1);

final class CategoriesController {
  public static function list(PDO $pdo): void {
    $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY name ASC");
    Http::ok(['items' => $stmt->fetchAll()]);
  }

  public static function create(PDO $pdo): void {
    $b = Http::readJsonBody();
    $name = trim((string)($b['name'] ?? ''));
    if ($name === '') Http::error('name required', 422);

    try {
      $stmt = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
      $stmt->execute([$name]);
      Http::ok(['id' => (int)$pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
      Http::error('Category already exists', 409);
    }
  }

  public static function update(PDO $pdo, int $id): void {
    $b = Http::readJsonBody();
    $name = trim((string)($b['name'] ?? ''));
    if ($name === '') Http::error('name required', 422);

    try {
      $stmt = $pdo->prepare("UPDATE categories SET name = ? WHERE id = ?");
      $stmt->execute([$name, $id]);
      Http::ok();
    } catch (PDOException $e) {
      Http::error('Category name already exists', 409);
    }
  }

  public static function delete(PDO $pdo, int $id): void {
    // Prevent delete if used? We'll allow and set book category_id to NULL via FK
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    Http::ok();
  }
}