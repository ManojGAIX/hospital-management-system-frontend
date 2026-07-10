# HR Backend API Contract

Base path: `/api/hr`

The React HR module now calls these endpoints through `src/api/hrApi.js`. Implement the backend with equivalent controller, service, repository, entity, and DTO classes.

## Required Java Classes

- `HrEmployee`
- `HrDepartment`
- `HrDesignation`
- `HrAttendance`
- `HrLeaveRequest`
- `HrShift`
- `HrHoliday`
- `HrPayroll`
- `HrRole`
- `HrEmployeeDocument`
- `HrEmployeeRepository`
- `HrDepartmentRepository`
- `HrDesignationRepository`
- `HrAttendanceRepository`
- `HrLeaveRequestRepository`
- `HrShiftRepository`
- `HrHolidayRepository`
- `HrPayrollRepository`
- `HrRoleRepository`
- `HrEmployeeDocumentRepository`
- `HrService`
- `HrController`

## Endpoints

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| GET | `/employees` | none | `HrEmployee[]` |
| POST | `/employees` | `HrEmployee` | saved `HrEmployee` |
| PUT | `/employees/{id}` | `HrEmployee` | updated `HrEmployee` |
| DELETE | `/employees/{id}` | none | `204 No Content` |
| GET | `/departments` | none | `HrDepartment[]` |
| POST | `/departments` | `HrDepartment` | saved `HrDepartment` |
| PUT | `/departments/{id}` | `HrDepartment` | updated `HrDepartment` |
| DELETE | `/departments/{id}` | none | `204 No Content` |
| GET | `/designations` | none | `HrDesignation[]` |
| POST | `/designations` | `HrDesignation` | saved `HrDesignation` |
| PUT | `/designations/{id}` | `HrDesignation` | updated `HrDesignation` |
| DELETE | `/designations/{id}` | none | `204 No Content` |
| GET | `/attendance` | none | attendance table rows |
| GET | `/leaves` | none | leave table rows |
| GET | `/shifts` | none | shift table rows |
| GET | `/holidays` | none | holiday table rows |
| GET | `/payroll` | none | payroll table rows |
| POST | `/payroll/generate` | payroll run request | payroll table rows |
| GET | `/roles` | none | role table rows |
| GET | `/dashboard` | none | optional dashboard summary |

## Frontend Field Shape

`HrEmployee` should include:

```json
{
  "id": 1,
  "employeeId": "MH-EMP-2026-001",
  "name": "Mary Thomas",
  "mobile": "9898981111",
  "email": "mary.thomas@madhavhms.in",
  "department": "Nursing",
  "designation": "Staff Nurse",
  "type": "Permanent",
  "joiningDate": "2026-07-09",
  "manager": "Kavitha Rao",
  "status": "Active",
  "emergency": "Emergency Contact",
  "bank": "ICICI Bank",
  "documents": ["Aadhaar", "PAN", "Photo"]
}
```

`HrDepartment` should include `id`, `name`, `head`, `employees`, and `status`.

`HrDesignation` should include `id`, `title`, `department`, and `grade`.

The current UI accepts table-row arrays for attendance, leave, shifts, payroll, holidays, and roles. For a stricter backend, return DTOs and add mapping in `HRModule.jsx`.
