ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(60) NULL AFTER id,
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(60) NULL AFTER first_name;

UPDATE users
SET
  first_name = TRIM(SUBSTRING_INDEX(name, ' ', 1)),
  last_name = TRIM(
    CASE
      WHEN LOCATE(' ', name) > 0 THEN SUBSTRING(name, LOCATE(' ', name) + 1)
      ELSE ''
    END
  )
WHERE (first_name IS NULL OR first_name = '')
  AND (last_name IS NULL OR last_name = '');
