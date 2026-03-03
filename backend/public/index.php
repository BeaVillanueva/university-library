<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Http.php';
require_once __DIR__ . '/../src/Router.php';
require_once __DIR__ . '/../src/Database.php';

require_once __DIR__ . '/../src/Middleware/Cors.php';
require_once __DIR__ . '/../src/Auth/Jwt.php';
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';

require_once __DIR__ . '/../src/Utils/Query.php';
require_once __DIR__ . '/../src/Utils/Path.php';
require_once __DIR__ . '/../src/Utils/Csv.php';

require_once __DIR__ . '/../src/Services/OverdueService.php';

require_once __DIR__ . '/../src/ActivityLogger.php';
require_once __DIR__ . '/../src/Controllers/ActivityLogsController.php';

require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/UsersController.php';
require_once __DIR__ . '/../src/Controllers/CategoriesController.php';
require_once __DIR__ . '/../src/Controllers/BooksController.php';
require_once __DIR__ . '/../src/Controllers/ImportController.php';
require_once __DIR__ . '/../src/Controllers/BorrowController.php';
require_once __DIR__ . '/../src/Controllers/ReportsController.php';

require_once __DIR__ . '/../src/Utils/Text.php';
require_once __DIR__ . '/../src/Utils/Mailer.php';

$config = require __DIR__ . '/../config/config.php';

Cors::handle($config['cors']);

$db = new Database($config['db']);
$pdo = $db->pdo();

$router = new Router();

/**
 * IMPORTANT:
 * Define $method and $path BEFORE any dynamic route checks use them.
 */
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$basePath = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
$path = parse_url($uri, PHP_URL_PATH) ?: '/';
if ($basePath && str_starts_with($path, $basePath)) {
  $path = substr($path, strlen($basePath)) ?: '/';
}

/**
 * Health
 */
$router->add('GET', '/health', function () {
  Http::ok(['message' => 'API is healthy']);
});

/**
 * Auth
 */
$router->add('POST', '/auth/login', function () use ($pdo, $config) {
  AuthController::login($pdo, $config);
});
$router->add('POST', '/auth/register', function () use ($pdo, $config) {
  AuthController::registerStudent($pdo, $config);
});
$router->add('POST', '/auth/forgot-password', function () use ($pdo, $config) {
  AuthController::forgotPassword($pdo, $config);
});
$router->add('POST', '/auth/reset-password', function () use ($pdo, $config) {
  AuthController::resetPassword($pdo, $config);
});
$router->add('GET', '/auth/me', function () use ($config) {
  $payload = AuthMiddleware::requireAuth($config);
  Http::ok(['user' => $payload]);
});

/**
 * Activity Logs (Admin + Librarian)
 */
$router->add('GET', '/activity-logs', function () use ($pdo, $config) {
  ActivityLogsController::list($pdo, $config);
});

/**
 * Categories
 * - list is allowed for authenticated users (for filters/forms)
 * - create/update/delete are admin only
 */
$router->add('GET', '/categories', function () use ($pdo, $config) {
  AuthMiddleware::requireAuth($config);
  CategoriesController::list($pdo);
});
$router->add('POST', '/categories', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']);
  CategoriesController::create($pdo);
});

/**
 * Books
 * - list/get: any authenticated
 * - update: admin/librarian
 * - create: NOT exposed (import only)
 */
$router->add('GET', '/books', function () use ($pdo, $config) {
  AuthMiddleware::requireAuth($config);
  BooksController::list($pdo);
});
$router->add('GET', '/books/_', function () { /* placeholder */ });

/**
 * Borrowing
 * - student can borrow
 * - librarian/admin can list all and return
 * - student can view their history
 */
$router->add('POST', '/borrow', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['student','admin','librarian']);
  BorrowController::borrow($pdo, $config, $auth);
});
$router->add('GET', '/borrow/my', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  BorrowController::myHistory($pdo, $auth);
});
$router->add('GET', '/borrow/all', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  BorrowController::listAll($pdo);
});

/**
 * Import (Librarian/Admin)
 */
$router->add('POST', '/import/books/preview', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ImportController::preview($pdo, $auth);
});
$router->add('POST', '/import/books/commit', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ImportController::commit($pdo, $auth);
});

/**
 * Reports
 * - summary: Admin + Librarian (for dashboard KPIs)
 * - list/export: Admin only
 */
$router->add('GET', '/reports/summary', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']); // <-- changed
  ReportsController::summary($pdo);
});

$router->add('GET', '/reports', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']); // keep admin only
  ReportsController::list($pdo);
});

$router->add('GET', '/reports/export', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']); // keep admin only
  ReportsController::exportCsv($pdo);
});

$router->add('GET', '/reports/my-summary', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['student']);
  ReportsController::mySummary($pdo, $auth);
});

$router->add('GET', '/reports/distribution', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin', 'librarian']);
  ReportsController::distribution($pdo, $auth);
});

$router->add('GET', '/reports/weekly-borrows', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin', 'librarian']);
  ReportsController::weeklyBorrows($pdo, $auth);
});

$router->add('GET', '/reports/my-weekly-borrows', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['student']);
  ReportsController::myWeeklyBorrows($pdo, $auth);
});

$router->add('GET', '/reports/student-stats', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ReportsController::studentStats($pdo);
});

/**
 * Users (Admin only)
 */
$router->add('GET', '/users', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']);
  UsersController::list($pdo, $auth);
});
$router->add('GET', '/users/pending', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']);
  UsersController::listPending($pdo, $auth);
});
$router->add('POST', '/users', function () use ($pdo, $config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']);
  UsersController::create($pdo, $auth);
});

//
// Dynamic routes (simple manual dispatch for {id} patterns)
// IMPORTANT: if a dynamic route matches, call controller and then exit.
//
if ($method === 'GET') {
  $id = Path::matchId($path, '/books/');
  if ($id !== null) {
    AuthMiddleware::requireAuth($config);
    BooksController::get($pdo, $id);
    exit;
  }
}

if (in_array($method, ['PUT','PATCH'], true)) {
  $id = Path::matchId($path, '/books/');
  if ($id !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin','librarian']);
    BooksController::update($pdo, $id);
    exit;
  }

  $cid = Path::matchId($path, '/categories/');
  if ($cid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    CategoriesController::update($pdo, $cid);
    exit;
  }

  $id2 = Path::matchId($path, '/users/');
  if ($id2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::update($pdo, $auth, $id2);
    exit;
  }
}

if ($method === 'DELETE') {
  $id = Path::matchId($path, '/users/');
  if ($id !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::delete($pdo, $auth, $id);
    exit;
  }

  $cid = Path::matchId($path, '/categories/');
  if ($cid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    CategoriesController::delete($pdo, $cid);
    exit;
  }
}

// Return route match
if ($method === 'POST') {
  $rid = Path::matchSuffixId($path, '/borrow/', '/return');
  if ($rid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin','librarian']);
    BorrowController::returnBook($pdo, $auth, $rid);
    exit;
  }

  // approve: POST /users/{id}/approve
  $uid = Path::matchSuffixId($path, '/users/', '/approve');
  if ($uid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::approve($pdo, $auth, $uid);
    exit;
  }

  // NEW: decline: POST /users/{id}/decline
  $uid2 = Path::matchSuffixId($path, '/users/', '/decline');
  if ($uid2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::decline($pdo, $auth, $uid2);
    exit;
  }
}

$router->dispatch($method, $path);