SELECT 
empl_role.id, 
empl_role.title,
empl_role.salary,
empl_dept.department
 FROM empl_role
 LEFT JOIN empl_dept ON empl_dept.id = empl_role.department_id;