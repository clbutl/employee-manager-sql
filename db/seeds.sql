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
  ('Cannon', 'Adams', 3, 1),
  ('Maxwell', 'Adams', 2, 7),
  ('Dale', 'Adams', 3, 7),
  ('Jorden', 'Adams', 4, 8),
  ('Andrew', 'Adams', 5, 8),
  ('Perkins', 'Adams', 1, 1),
  ('Issac', 'Adams', 2, 7),
  ('Braeden', 'Adams', 4, 1);