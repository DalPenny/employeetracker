SELECT 
employee.id, 
employee.first_name, 
employee.last_name, 
empl_role.title, 
empl_role.salary, 
empl_dept.department, 
CONCAT(MGR.first_name, ' ', MGR.last_name) as manager
FROM employee 
LEFT JOIN empl_role ON employee.role_id = empl_role.id
LEFT JOIN empl_dept ON empl_dept.id = empl_role.department_id
LEFT JOIN employee AS MGR ON MGR.id = employee.manager_id;