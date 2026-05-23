<?php

declare(strict_types=1);

// ---- CORS (MUST be FIRST, before any output) ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

if (in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header('Vary: Origin');
  header('Access-Control-Allow-Credentials: true');
}


header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// ✅ Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// ✅ DEBUG: Log all requests
error_log("[API] {$_SERVER['REQUEST_METHOD']} {$_SERVER['REQUEST_URI']}");

// ✅ TEMP DEBUG
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

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

require_once __DIR__ . '/../src/Controllers/AnnouncementController.php';
require_once __DIR__ . '/../src/Controllers/UserPreferencesController.php';


$config = require __DIR__ . '/../config/config.php';
Cors::handle($config['cors'] ?? []);

$router = new Router();

/**
 * ✅ Health (NO DB connection needed)
 */
$router->add('GET', '/health', function () {
  Http::ok(['message' => 'API is healthy']);
});

/**
 * ✅ Lazy PDO connection
 */
function pdo(array $config): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;
  $db = new Database($config['db']);
  $pdo = $db->pdo();
  return $pdo;
}

/**
 * Parse request path
 */
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$basePath = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
$path = parse_url($uri, PHP_URL_PATH) ?: '/';

if ($basePath && str_starts_with($path, $basePath)) {
  $path = substr($path, strlen($basePath)) ?: '/';
}

// Support /index.php prefix
if (str_starts_with($path, '/index.php')) {
  $path = substr($path, strlen('/index.php')) ?: '/';
}

// Support /api prefix
if (str_starts_with($path, '/api')) {
  $path = substr($path, 4) ?: '/';
}

// Normalize path (remove trailing slashes except root)
if ($path !== '/' && str_ends_with($path, '/')) {
  $path = rtrim($path, '/');
}

// ✅ DEBUG
error_log("[ROUTER] method=$method path=$path");

/**
 * Auth Routes
 */
$router->add('POST', '/auth/login', function () use ($config) {
  AuthController::login(pdo($config), $config);
});
$router->add('POST', '/auth/register', function () use ($config) {
  AuthController::registerStudent(pdo($config), $config);
});
$router->add('POST', '/auth/forgot-password', function () use ($config) {
  AuthController::forgotPassword(pdo($config), $config);
});
$router->add('POST', '/auth/reset-password', function () use ($config) {
  AuthController::resetPassword(pdo($config), $config);
});
$router->add('GET', '/auth/me', function () use ($config) {
  $payload = AuthMiddleware::requireAuth($config);
  Http::ok(['user' => $payload]);
});
$router->add('POST', '/auth/logout', function () use ($config) {
  AuthController::logout(pdo($config), $config);
});

/**
 * Activity Logs
 */
$router->add('GET', '/activity-logs', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ActivityLogsController::list(pdo($config), $config);
});

/**
 * Categories
 */
$router->add('GET', '/categories', function () use ($config) {
  AuthMiddleware::requireAuth($config);
  CategoriesController::list(pdo($config));
});
$router->add('POST', '/categories', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']);
  CategoriesController::create(pdo($config));
});

/**
 * Books - ✅ GET /books is PUBLIC (no auth)
 */
$router->add('GET', '/books', function () use ($config) {
  BooksController::list(pdo($config));
});

$router->add('POST', '/books', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  BooksController::create(pdo($config), $auth);
});

/**
 * Borrowing
 */
$router->add('POST', '/borrow', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['student']);
  BorrowController::borrow(pdo($config), $config, $auth);
});
$router->add('GET', '/borrow/my', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  BorrowController::myHistory(pdo($config), $auth);
});
$router->add('GET', '/borrow/all', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  BorrowController::listAll(pdo($config), $auth);
});

/**
 * Import
 */
$router->add('POST', '/import/books/preview', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['librarian']);
  ImportController::preview(pdo($config), $auth);
});
$router->add('POST', '/import/books/commit', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['librarian']);
  ImportController::commit(pdo($config), $auth);
});

/**
 * Reports
 */
$router->add('GET', '/reports/summary', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ReportsController::summary(pdo($config));
});
$router->add('GET', '/reports', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ReportsController::list(pdo($config));
}); 
$router->add('GET', '/reports/export', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ReportsController::exportCsv(pdo($config));
});
$router->add('GET', '/reports/my-summary', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['student']);
  ReportsController::mySummary(pdo($config), $auth);
});
$router->add('GET', '/reports/distribution', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ReportsController::distribution(pdo($config), $auth);
});
$router->add('GET', '/reports/weekly-borrows', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ReportsController::weeklyBorrows(pdo($config), $auth);
});
$router->add('GET', '/reports/my-weekly-borrows', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['student']);
  ReportsController::myWeeklyBorrows(pdo($config), $auth);
});
$router->add('GET', '/reports/student-stats', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ReportsController::studentStats(pdo($config));
});

/**
 * Announcements
 */
$router->add('GET', '/announcements', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AnnouncementController::list(pdo($config), $auth);
});

$router->add('POST', '/announcements', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AnnouncementController::create(pdo($config), $auth);
});

/**
 * User Preferences
 */
$router->add('GET', '/preferences', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  UserPreferencesController::get(pdo($config), $auth);
});

$router->add('PUT', '/preferences', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  UserPreferencesController::update(pdo($config), $auth);
});


/**
 * Users
 */
$router->add('GET', '/users', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']);
  UsersController::list(pdo($config), $auth);
});
$router->add('GET', '/users/pending', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']);
  UsersController::listPending(pdo($config), $auth);
});
$router->add('POST', '/users', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin']);
  UsersController::create(pdo($config), $auth);
});

/**
 * Dynamic Routes - GET /books/{id}
 */
if ($method === 'GET') {
  $id = Path::matchId($path, '/books/');
  if ($id !== null) {
    // ✅ GET /books/{id} is PUBLIC
    BooksController::get(pdo($config), $id);
    exit;
  }
}

/**
 * Dynamic Routes - PATCH /books/{id}
 */
if (in_array($method, ['PUT','PATCH'], true)) {
  $id = Path::matchId($path, '/books/');
  if ($id !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin','librarian']);
    BooksController::update(pdo($config), $id);
    exit;
  }

  $cid = Path::matchId($path, '/categories/');
  if ($cid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    CategoriesController::update(pdo($config), $cid);
    exit;
  }

  $id2 = Path::matchId($path, '/users/');
  if ($id2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::update(pdo($config), $auth, $id2);
    exit;
  }

  $aid = Path::matchId($path, '/announcements/');
  if ($aid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AnnouncementController::update(pdo($config), $auth, $aid);
    exit;
  }
}

/**
 * Dynamic Routes - DELETE
 */
if ($method === 'DELETE') {
  $id = Path::matchId($path, '/users/');
  if ($id !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::delete(pdo($config), $auth, $id);
    exit;
  }

  $cid = Path::matchId($path, '/categories/');
  if ($cid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    CategoriesController::delete(pdo($config), $cid);
    exit;
  }

  $aid = Path::matchId($path, '/announcements/');
  if ($aid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AnnouncementController::delete(pdo($config), $auth, $aid);
    exit;
  }
}

/**
 * Dynamic Routes - POST (stock, cover, return, cancel, approve, decline)
 */
if ($method === 'POST') {
  $sid = Path::matchSuffixId($path, '/books/', '/stock');
  if ($sid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin','librarian']);
    BooksController::addStock(pdo($config), $auth, $sid);
    exit;
  }

  $cid = Path::matchSuffixId($path, '/books/', '/cover');
  if ($cid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin','librarian']);
    BooksController::uploadCover(pdo($config), $auth, $cid);
    exit;
  }

  $rid = Path::matchSuffixId($path, '/borrow/', '/return');
  if ($rid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['librarian']);
    BorrowController::returnBook(pdo($config), $auth, $rid);
    exit;
  }

  $cid2 = Path::matchSuffixId($path, '/borrow/', '/cancel');
  if ($cid2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['student']);
    BorrowController::cancel(pdo($config), $auth, $cid2);
    exit;
  }

  $bid = Path::matchSuffixId($path, '/borrow/', '/approve');
  if ($bid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['librarian']);
    BorrowController::approve(pdo($config), $config, $auth, $bid);
    exit;
  }

  $bid2 = Path::matchSuffixId($path, '/borrow/', '/decline');
  if ($bid2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['librarian']);
    BorrowController::decline(pdo($config), $auth, $bid2);
    exit;
  }

  $uid = Path::matchSuffixId($path, '/users/', '/approve');
  if ($uid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::approve(pdo($config), $auth, $uid);
    exit;
  }

  $uid2 = Path::matchSuffixId($path, '/users/', '/decline');
  if ($uid2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::decline(pdo($config), $auth, $uid2);
    exit;
  }
}

/**
 * Serve static files from /covers directory
 */
if ($method === 'GET' && str_starts_with($path, '/covers/')) {
  $filePath = __DIR__ . $path;
  
  if (!file_exists($filePath) || !is_file($filePath)) {
    http_response_code(404);
    exit;
  }
  
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = finfo_file($finfo, $filePath);
  finfo_close($finfo);
  
  if (!$mime) $mime = 'application/octet-stream';
  
  header("Content-Type: {$mime}");
  header("Cache-Control: public, max-age=3600");
  header("Content-Length: " . filesize($filePath));
  
  readfile($filePath);
  exit;
}

// ✅ Dispatch to router
$router->dispatch($method, $path);