<?php
declare(strict_types=1);

final class Router {
  private array $routes = [];

  public function add(string $method, string $path, callable $handler): void {
    $method = strtoupper($method);
    $this->routes[$method][$path] = $handler;
  }

  public function dispatch(string $method, string $path): void {
    $method = strtoupper($method);
    $handler = $this->routes[$method][$path] ?? null;

    if (!$handler) {
      Http::error('Not found', 404, ['method' => $method, 'path' => $path]);
    }

    $handler();
  }
}