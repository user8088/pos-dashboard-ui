# Backend Implementation Prompt: Attendance-Based Salary Calculation API

## Overview
Implement a backend API endpoint that calculates staff salary based on attendance records for a given period (week/month/year). This endpoint will be used by the frontend to display recommended salary amounts in the Quick Pay modal and Staff Profile.

## API Endpoint Specification

### Endpoint
**GET** `/api/salary-payments/attendance-based/{userId}`

### Query Parameters
- `period_type` (required): `week` | `month` | `year`
- `period_value` (required): 
  - For `week`: Date string in format `YYYY-MM-DD` (any date within the week)
  - For `month`: Month string in format `YYYY-MM`
  - For `year`: Year string in format `YYYY`
- `start_date` (optional): Override start date in format `YYYY-MM-DD`
- `end_date` (optional): Override end date in format `YYYY-MM-DD`

### Request Example
```
GET /api/salary-payments/attendance-based/1?period_type=month&period_value=2025-11&start_date=2025-11-01&end_date=2025-11-30
```

### Expected Response Format
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "period_type": "month",
    "period_value": "2025-11",
    "start_date": "2025-11-01",
    "end_date": "2025-11-30",
    "salary_structure": {
      "base_salary": "30000.00",
      "allowances": "0.00",
      "deductions": "0.00"
    },
    "calendar_days": 30,
    "daily_rate": "1000.00",
    "attendance": {
      "present_count": 15,
      "late_count": 2,
      "half_day_count": 3,
      "leave_count": 5,
      "absent_count": 5,
      "total_working_days": 20.5
    },
    "calculated_salary": "20500.00",
    "full_salary": "30000.00",
    "difference": "-9500.00"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

## Business Logic Requirements

### 1. Period Calculation
Calculate the start and end dates based on `period_type` and `period_value`:

- **Week**: 
  - Find the Monday of the week containing the given date
  - End date is Sunday of the same week (7 days total)
  - Example: If `period_value` is `2025-11-15` (Friday), start = `2025-11-10` (Monday), end = `2025-11-16` (Sunday)

- **Month**: 
  - Start date: 1st day of the month
  - End date: Last day of the month
  - Example: If `period_value` is `2025-11`, start = `2025-11-01`, end = `2025-11-30`

- **Year**: 
  - Start date: January 1st of the year
  - End date: December 31st of the year
  - Example: If `period_value` is `2025`, start = `2025-01-01`, end = `2025-12-31`

**Note**: If `start_date` and `end_date` are provided as query parameters, use them instead of calculating from `period_type` and `period_value`.

### 2. Salary Structure Retrieval
- Fetch the active salary structure for the given `userId`
- If no salary structure exists, return an error: `"No salary structure found for this user"`
- Use the `base_salary` from the salary structure for calculations
- Include `allowances` and `deductions` in the response for reference

### 3. Daily Rate Calculation
- **Formula**: `daily_rate = base_salary / calendar_days`
- `calendar_days` = Number of days in the selected period (e.g., 30 for November, 7 for a week, 365/366 for a year)
- Round to 2 decimal places

### 4. Attendance Calculation
Query attendance records for the user within the calculated date range:

- **Present**: Count as 1 full day
- **Late**: Count as 1 full day
- **Half-day**: Count as 0.5 days
- **Leave**: Count as 1 full day (paid leave)
- **Absent**: Count as 0 days (unpaid)

**Formula for total working days**:
```
total_working_days = present_count + late_count + (half_day_count × 0.5) + leave_count
```

### 5. Salary Calculation
- **Calculated Salary**: `daily_rate × total_working_days`
- **Full Salary**: `base_salary` (for the period - if period is month, use monthly salary; if year, use yearly salary)
- **Difference**: `calculated_salary - full_salary`

**Note**: For periods other than month, adjust the full salary calculation:
- **Week**: `full_salary = (base_salary / calendar_days_in_month) × 7`
- **Month**: `full_salary = base_salary`
- **Year**: `full_salary = base_salary × 12`

### 6. Attendance Status Mapping
Map attendance status values from your database to the calculation logic. Common status values might include:
- `present`, `on-time` → Present (1 day)
- `late`, `tardy` → Late (1 day)
- `half-day`, `half day`, `halfday` → Half-day (0.5 days)
- `leave`, `on leave`, `paid leave` → Leave (1 day)
- `absent`, `no-show` → Absent (0 days)

Handle case-insensitive matching and variations in status naming.

## Database Queries

### 1. Get Salary Structure
```sql
SELECT id, user_id, base_salary, allowances, deductions, type, commission_rate, notes
FROM salary_structures
WHERE user_id = ? AND status = 'active'
ORDER BY created_at DESC
LIMIT 1
```

### 2. Get Attendance Records
```sql
SELECT id, user_id, date, status, remarks
FROM attendances
WHERE user_id = ? 
  AND date >= ? 
  AND date <= ?
ORDER BY date ASC
```

### 3. Count Attendance by Status
You can either:
- Query all records and count in application code, OR
- Use SQL aggregation:
```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(CASE WHEN status IN ('half-day', 'half day', 'halfday') THEN 0.5 ELSE 1 END) as days
FROM attendances
WHERE user_id = ? 
  AND date >= ? 
  AND date <= ?
GROUP BY status
```

## Implementation Steps

### Step 1: Create Controller Method
Create a new method in your `SalaryPaymentController` (or appropriate controller):

```php
public function getAttendanceBasedSalary(Request $request, $userId)
{
    try {
        // Validate user exists
        $user = User::findOrFail($userId);
        
        // Get query parameters
        $periodType = $request->query('period_type'); // week, month, year
        $periodValue = $request->query('period_value');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        
        // Validate required parameters
        if (!$periodType || !$periodValue) {
            return response()->json([
                'success' => false,
                'message' => 'period_type and period_value are required'
            ], 400);
        }
        
        // Calculate period dates
        $dates = $this->calculatePeriodDates($periodType, $periodValue, $startDate, $endDate);
        
        // Get salary structure
        $salaryStructure = SalaryStructure::where('user_id', $userId)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->first();
        
        if (!$salaryStructure) {
            return response()->json([
                'success' => false,
                'message' => 'No salary structure found for this user'
            ], 404);
        }
        
        // Calculate calendar days
        $calendarDays = $this->calculateCalendarDays($dates['start_date'], $dates['end_date']);
        
        // Calculate daily rate
        $dailyRate = $salaryStructure->base_salary / $calendarDays;
        
        // Get attendance records
        $attendances = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$dates['start_date'], $dates['end_date']])
            ->get();
        
        // Calculate attendance counts and working days
        $attendanceData = $this->calculateAttendanceData($attendances);
        
        // Calculate salary
        $calculatedSalary = $dailyRate * $attendanceData['total_working_days'];
        $fullSalary = $this->calculateFullSalary($salaryStructure->base_salary, $periodType, $calendarDays);
        $difference = $calculatedSalary - $fullSalary;
        
        // Build response
        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => (int) $userId,
                'period_type' => $periodType,
                'period_value' => $periodValue,
                'start_date' => $dates['start_date'],
                'end_date' => $dates['end_date'],
                'salary_structure' => [
                    'base_salary' => number_format($salaryStructure->base_salary, 2, '.', ''),
                    'allowances' => number_format($salaryStructure->allowances ?? 0, 2, '.', ''),
                    'deductions' => number_format($salaryStructure->deductions ?? 0, 2, '.', ''),
                ],
                'calendar_days' => $calendarDays,
                'daily_rate' => number_format($dailyRate, 2, '.', ''),
                'attendance' => [
                    'present_count' => $attendanceData['present_count'],
                    'late_count' => $attendanceData['late_count'],
                    'half_day_count' => $attendanceData['half_day_count'],
                    'leave_count' => $attendanceData['leave_count'],
                    'absent_count' => $attendanceData['absent_count'],
                    'total_working_days' => $attendanceData['total_working_days'],
                ],
                'calculated_salary' => number_format($calculatedSalary, 2, '.', ''),
                'full_salary' => number_format($fullSalary, 2, '.', ''),
                'difference' => number_format($difference, 2, '.', ''),
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to calculate attendance-based salary',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

### Step 2: Helper Methods

```php
private function calculatePeriodDates($periodType, $periodValue, $startDate = null, $endDate = null)
{
    // If start_date and end_date are provided, use them
    if ($startDate && $endDate) {
        return [
            'start_date' => $startDate,
            'end_date' => $endDate
        ];
    }
    
    $start = null;
    $end = null;
    
    if ($periodType === 'week') {
        // Parse the date and find Monday of that week
        $date = Carbon::parse($periodValue);
        $start = $date->copy()->startOfWeek(Carbon::MONDAY);
        $end = $start->copy()->endOfWeek(Carbon::SUNDAY);
    } elseif ($periodType === 'month') {
        // Parse YYYY-MM format
        $date = Carbon::createFromFormat('Y-m', $periodValue);
        $start = $date->copy()->startOfMonth();
        $end = $date->copy()->endOfMonth();
    } elseif ($periodType === 'year') {
        // Parse YYYY format
        $date = Carbon::createFromFormat('Y', $periodValue);
        $start = $date->copy()->startOfYear();
        $end = $date->copy()->endOfYear();
    }
    
    return [
        'start_date' => $start->format('Y-m-d'),
        'end_date' => $end->format('Y-m-d')
    ];
}

private function calculateCalendarDays($startDate, $endDate)
{
    $start = Carbon::parse($startDate);
    $end = Carbon::parse($endDate);
    return $start->diffInDays($end) + 1; // +1 to include both start and end dates
}

private function calculateAttendanceData($attendances)
{
    $presentCount = 0;
    $lateCount = 0;
    $halfDayCount = 0;
    $leaveCount = 0;
    $absentCount = 0;
    
    foreach ($attendances as $attendance) {
        $status = strtolower(trim($attendance->status));
        
        if (in_array($status, ['present', 'on-time', 'on time'])) {
            $presentCount++;
        } elseif (in_array($status, ['late', 'tardy'])) {
            $lateCount++;
        } elseif (in_array($status, ['half-day', 'half day', 'halfday'])) {
            $halfDayCount++;
        } elseif (in_array($status, ['leave', 'on leave', 'paid leave'])) {
            $leaveCount++;
        } elseif (in_array($status, ['absent', 'no-show', 'no show'])) {
            $absentCount++;
        }
    }
    
    $totalWorkingDays = $presentCount + $lateCount + ($halfDayCount * 0.5) + $leaveCount;
    
    return [
        'present_count' => $presentCount,
        'late_count' => $lateCount,
        'half_day_count' => $halfDayCount,
        'leave_count' => $leaveCount,
        'absent_count' => $absentCount,
        'total_working_days' => $totalWorkingDays,
    ];
}

private function calculateFullSalary($baseSalary, $periodType, $calendarDays)
{
    if ($periodType === 'month') {
        return $baseSalary;
    } elseif ($periodType === 'week') {
        // Assume 30 days per month for weekly calculation
        $dailyRate = $baseSalary / 30;
        return $dailyRate * 7;
    } elseif ($periodType === 'year') {
        return $baseSalary * 12;
    }
    
    return $baseSalary;
}
```

### Step 3: Add Route
Add the route to your `routes/api.php`:

```php
Route::get('/salary-payments/attendance-based/{userId}', [SalaryPaymentController::class, 'getAttendanceBasedSalary']);
```

## Testing Scenarios

1. **Test with month period**:
   - Request: `GET /api/salary-payments/attendance-based/1?period_type=month&period_value=2025-11`
   - Verify: Start date is 2025-11-01, end date is 2025-11-30
   - Verify: Calendar days = 30
   - Verify: Daily rate = base_salary / 30
   - Verify: Attendance counts are correct
   - Verify: Calculated salary = daily_rate × total_working_days

2. **Test with week period**:
   - Request: `GET /api/salary-payments/attendance-based/1?period_type=week&period_value=2025-11-15`
   - Verify: Start date is Monday of that week, end date is Sunday
   - Verify: Calendar days = 7
   - Verify: Daily rate = base_salary / 30 (monthly) then × 7 / 7 = base_salary / 30

3. **Test with year period**:
   - Request: `GET /api/salary-payments/attendance-based/1?period_type=year&period_value=2025`
   - Verify: Start date is 2025-01-01, end date is 2025-12-31
   - Verify: Calendar days = 365 or 366
   - Verify: Full salary = base_salary × 12

4. **Test with no attendance records**:
   - Verify: All counts are 0, total_working_days = 0, calculated_salary = 0

5. **Test with no salary structure**:
   - Verify: Returns 404 with message "No salary structure found for this user"

6. **Test with invalid period_type**:
   - Verify: Returns 400 with validation error

7. **Test attendance status variations**:
   - Verify: "Present", "present", "PRESENT" all count as present
   - Verify: "Half-day", "half day", "halfday" all count as 0.5 days
   - Verify: "Leave", "on leave", "paid leave" all count as 1 day

## Edge Cases to Handle

1. **User has no salary structure**: Return 404 error
2. **User has no attendance records for period**: Return zero counts and calculated salary = 0
3. **Invalid period_value format**: Return 400 validation error
4. **Period spans multiple months/years**: Handle correctly based on period type
5. **Leap year**: Handle February 29 correctly
6. **Week starts/ends on month boundaries**: Calculate correctly
7. **Missing query parameters**: Return 400 validation error
8. **Invalid user_id**: Return 404 error

## Notes

- All monetary values should be returned as strings with 2 decimal places (e.g., "30000.00")
- All counts should be integers
- `total_working_days` can be a decimal (e.g., 20.5 for 20 full days + 1 half day)
- Use Carbon or similar date library for date calculations
- Ensure timezone handling is consistent with your application
- Consider caching attendance data if performance is a concern
- Add proper authentication/authorization middleware to the route

## Frontend Integration

The frontend will call this endpoint with:
- `userId`: The staff member's ID
- `period_type`: "week", "month", or "year"
- `period_value`: Date string based on period type
- `start_date` and `end_date`: Optional, calculated by frontend but can be overridden

The frontend expects the response format exactly as specified above. Any deviations may cause display issues.

