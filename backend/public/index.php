<?php
declare(strict_types=1);

// ---- CORS quick-guard (must run before any output) ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// ✅ FIXED: Allow ANY origin in development (permissive)
// For production, replace with specific allowed origins
$allowAnyOrigin = true; // Set to false in production

if ($allowAnyOrigin) {
  // Allow all origins (development mode)
  header("Access-Control-Allow-Origin: *");
} else {
  // Specific allowed origins (production mode)
  $allowed = [
    'http://localhost:5173',
    'http://localhost:8000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000',
    'http://192.168.1.5:5173',
    'http://192.168.1.5:8000',
  ];
  
  if ($origin && in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header("Vary: Origin");
    header("Access-Control-Allow-Credentials: true");
  }
}

header("Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}
// ---- end CORS guard ----

// ✅ TEMP DEBUG (remove later if you want)
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
 * ✅ Lazy PDO connection (connect only when a route actually needs DB)
 */
function pdo(array $config): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;
  $db = new Database($config['db']);
  $pdo = $db->pdo();
  return $pdo;
}

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

// ✅ support calling via /index.php/route
if (str_starts_with($path, '/index.php')) {
  $path = substr($path, strlen('/index.php')) ?: '/';
}

// ✅ STRIP /api prefix if present
if (str_starts_with($path, '/api')) {
  $path = substr($path, 4) ?: '/';
}

/**
 * Auth
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
 * Activity Logs (Admin + Librarian)
 */
$router->add('GET', '/activity-logs', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  ActivityLogsController::list(pdo($config), $config);
});

/**
 * Categories
 * - list is allowed for authenticated users (for filters/forms)
 * - create/update/delete are admin only
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
 * Books
 * - list/get: any authenticated
 * - create/update/addStock: admin/librarian
 */
$router->add('GET', '/books', function () use ($config) {
  BooksController::list(pdo($config));
});

// ✅ FIX: allow manual add (create)
$router->add('POST', '/books', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['admin','librarian']);
  BooksController::create(pdo($config), $auth);
});

$router->add('GET', '/books/_', function () { /* placeholder */ });

/**
 * Borrowing
 * - student can borrow (request -> pending)
 * - librarian can list all + approve/decline/return
 * - admin can view all (list only)
 * - student can view their history
 */
$router->add('POST', '/borrow', function () use ($config) {
  $auth = AuthMiddleware::requireAuth($config);
  AuthMiddleware::requireRole($auth, ['student']); // ✅ student-only
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
 * Import (Librarian ONLY)
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
 * Users (Admin only)
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

//
// Dynamic routes (simple manual dispatch for {id} patterns)
// IMPORTANT: if a dynamic route matches, call controller and then exit.
//
if ($method === 'GET') {
  $id = Path::matchId($path, '/books/');
  if ($id !== null) {
    AuthMiddleware::requireAuth($config);
    BooksController::get(pdo($config), $id);
    exit;
  }
}

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
}

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
}

// Borrow actions: approve/decline/return (LIBRARIAN ONLY)
if ($method === 'POST') {
  // add stock: POST /books/{id}/stock (LIBRARIAN/ADMIN)
  $sid = Path::matchSuffixId($path, '/books/', '/stock');
  if ($sid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin','librarian']);
    BooksController::addStock(pdo($config), $auth, $sid);
    exit;
  }

  // ✅ upload cover: POST /books/{id}/cover (LIBRARIAN/ADMIN)
  $cid = Path::matchSuffixId($path, '/books/', '/cover');
  if ($cid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin','librarian']);
    BooksController::uploadCover(pdo($config), $auth, $cid);
    exit;
  }

  // return: POST /borrow/{id}/return
  $rid = Path::matchSuffixId($path, '/borrow/', '/return');
  if ($rid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['librarian']);
    BorrowController::returnBook(pdo($config), $auth, $rid);
    exit;
  }

  // cancel: POST /borrow/{id}/cancel (STUDENT ONLY)
  $cid2 = Path::matchSuffixId($path, '/borrow/', '/cancel');
  if ($cid2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['student']);
    BorrowController::cancel(pdo($config), $auth, $cid2);
    exit;
  }

  // approve: POST /borrow/{id}/approve
  $bid = Path::matchSuffixId($path, '/borrow/', '/approve');
  if ($bid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['librarian']);
    BorrowController::approve(pdo($config), $config, $auth, $bid);
    exit;
  }

  // decline: POST /borrow/{id}/decline
  $bid2 = Path::matchSuffixId($path, '/borrow/', '/decline');
  if ($bid2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['librarian']);
    BorrowController::decline(pdo($config), $auth, $bid2);
    exit;
  }

  // approve: POST /users/{id}/approve
  $uid = Path::matchSuffixId($path, '/users/', '/approve');
  if ($uid !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::approve(pdo($config), $auth, $uid);
    exit;
  }

  // decline: POST /users/{id}/decline
  $uid2 = Path::matchSuffixId($path, '/users/', '/decline');
  if ($uid2 !== null) {
    $auth = AuthMiddleware::requireAuth($config);
    AuthMiddleware::requireRole($auth, ['admin']);
    UsersController::decline(pdo($config), $auth, $uid2);
    exit;
  }
}

// ✅ FIXED: Serve static files from /covers directory (MUST BE AFTER ALL ROUTE CHECKS)
if ($method === 'GET' && str_starts_with($path, '/covers/')) {
  $filePath = __DIR__ . $path;
  
  // Check if file exists
  if (!file_exists($filePath)) {
    http_response_code(404);
    exit;
  }
  
  // Check if it's actually a file (not directory)
  if (!is_file($filePath)) {
    http_response_code(403);
    exit;
  }
  
  // Get MIME type using finfo
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = finfo_file($finfo, $filePath);
  finfo_close($finfo);
  
  if (!$mime) {
    $mime = 'application/octet-stream';
  }
  
  // Set proper headers
  header("Content-Type: {$mime}");
  header("Cache-Control: public, max-age=3600");
  header("Content-Length: " . filesize($filePath));
  
  // Send file
  readfile($filePath);
  exit;
}

$router->dispatch($method, $path);
