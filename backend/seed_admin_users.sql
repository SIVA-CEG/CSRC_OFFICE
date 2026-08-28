-- Seed real admin_users rows from your friend's data.
-- Column order matches the schema: id, name, username, password_hash, role,
-- created_at, phone, email, employee_no, signature_path

INSERT INTO admin_users (id, name, username, password_hash, role, created_at, phone, email, employee_no, signature_path) VALUES
(1, 'tapaladmin', 'tapal_admin', '$2b$10$4iyyceZz83g6qwwOV8YQKOpP6yRnY5BLkJw92RgibYKmK8YfUVsyi', 'tapal', '2026-06-11 14:26:39.898725', '7708780398', 'siva13november2005@gmail.com', '1234', 'uploads\signatures\signature_1_1781517297583.jpeg'),
(2, 'Mr. R. Senthilkumar', 'ast1', '$2b$10$iYjTf3Plz3EIzpUvEvZmUOpr3mi3HMOEiaLWZXfuAeF.5UOQw4xwi', 'assistant', '2026-06-12 15:22:54.736122', '07708780398', 'siva13november2005@gmail.com', '1234', 'uploads\signatures\signature_2_1781518257589.jpeg'),
(3, 'Mr. T. Anbarasan', 'sup1', '$2b$10$K97dyiXOIUSoel6v2qSWv.4vRF9Cr7AHKBj9gCb3jobZZrpPdOLoy', 'superintendent', '2026-06-12 15:22:54.736122', '07708780398', 'siva13november2005@gmail.com', '34223', 'uploads\signatures\signature_3_1781594184377.jpg'),
(4, 'Dr. S. Balasivanandha Prabu', 'dir1', '$2b$10$39QvMFpG7I7JFxkWt6jrJurqxriKLM7NVzTnVUvEQPg/hSh2akrOe', 'director', '2026-06-12 15:22:54.736122', '07708780398', 'siva13november2005@gmail.com', '34532', 'uploads\signatures\signature_4_1781603489594.jpeg'),
(5, 'Dr. Suba', 'dd1', '$2b$10$/RsFNJEvDfNQ0WDyB8osAOX22HnTbU3zI/8Sk.1J0pkp49uaLqcTG', 'dd', '2026-07-07 15:54:57.563442', '07708780398', 'siva13november2005@gmail.com', '34532', 'uploads\signatures\signature_4_1781603489594.jpeg');

-- Bump the SERIAL sequence so future INSERTs (without explicit id) don't
-- collide with the ids we just hardcoded above.
SELECT setval('admin_users_id_seq', (SELECT MAX(id) FROM admin_users));