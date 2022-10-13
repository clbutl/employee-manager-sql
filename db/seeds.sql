INSERT INTO department (name) 
VALUES ('Management'),
  ('Development'),
  ('Unpaid Interns'),
  ('Customer Support');

INSERT INTO roles (title, salary, department_id) VALUES 
  ('Manager', 130000, 1),
  ('Associate TL', 70000, 1),
  ('Associate', 60000, 2),
  ('Intern', 10000, 3),
  ('Service Rep', 40000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id) 
VALUES ('Samual', 'Adams', 1, null),
  ('Cannon', 'Butler', 3, 1),
  ('Maxwell', 'Trout', 2, 7),
  ('Dale', 'Yolk', 3, 7),
  ('Jorden', 'Evans', 4, 8),
  ('Andrew', 'Smith', 5, 8),
  ('Perkins', 'Joust', 1, 1),
  ('Issac', 'Babb', 2, 7),
  ('Braeden', 'Attan', 4, 1);