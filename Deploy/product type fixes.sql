UPDATE product
SET product_type = 3
WHERE name LIKE '%Discovery%'
AND start_date > '2024-06-01';

UPDATE product
SET product_type = 1
WHERE name LIKE '%Extra English%'
AND start_date > '2024-06-01';

UPDATE product
SET product_type = 1,
    name = '1 day Summer Sports'
WHERE name LIKE '%Multi%'
AND start_date > '2024-06-01';
