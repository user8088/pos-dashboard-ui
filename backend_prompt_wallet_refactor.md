# Backend Refactoring Prompt: Unified Customer Wallet & Automatic Due Clearing

## Objective
Refactor the customer wallet system to consolidate "Reserved Wallet" and "Advance Wallet" into a single **Advance Balance**. Implement automatic clearing of **Due Balance** using available **Advance Balance** upon transaction creation.

## Core Requirements

### 1. Database Schema Changes
- **Customer Table**:
  - Ensure `advance_balance` is the single source of truth for customer credit.
  - **Remove** `reserved_balance` or `reserved_value` columns if they exist.
  - Migrate any existing `reserved_balance` data into `advance_balance`.

### 2. Transaction Logic (Automatic Due Clearing)
- **Trigger**: When a new Invoice/Transaction is created (or updated to a final state).
- **Logic**:
  - Check if `Customer.advance_balance > 0` AND `Invoice.due_amount > 0`.
  - If both are true, **automatically** apply the advance to the due amount.
  - **Debit** `advance_balance` by `min(advance_balance, due_amount)`.
  - **Credit** the Invoice (reduce due amount).
  - **Record Transaction**: Create a ledger entry (e.g., "Payment via Advance") linked to both the Customer and the Invoice.
- **Constraint**: This must happen **automatically** without requiring a separate "Apply Advance" API call from the frontend, unless the frontend explicitly overrides this behavior (which it shouldn't for this refactor).

### 3. API Updates
- **GET /customers/{id}**:
  - Response should include `advance_balance` and `due_balance`.
  - Remove `reserved_value` from the response to avoid frontend confusion.
- **POST /invoices** (and related endpoints):
  - Ensure the response reflects the *net* due balance after the automatic advance application.
  - If an advance was applied, include it in the payment breakdown or transaction history returned immediately.

### 4. Reservation Handling
- **Create Reservation**:
  - Any "Advance Payment" made during reservation creation should be credited directly to `advance_balance`.
  - Do **not** hold it in a separate "reserved" state.
- **Complete Reservation (Convert to Sale)**:
  - The system should treat this as a standard sale.
  - Since the advance is already in `advance_balance`, the **Automatic Due Clearing** logic (Point 2) should kick in and apply it to the new invoice.

## Expected Behavior Example
1. **Customer A** has `advance_balance = 0`.
2. **Customer A** makes a Reservation with `500` advance.
   - Backend credits `advance_balance` -> `500`.
3. **Customer A** comes to pickup. Total Bill is `1200`.
4. **Frontend** sends "Create Invoice" for `1200`.
5. **Backend**:
   - Creates Invoice for `1200`.
   - Detects `advance_balance = 500`.
   - Automatically applies `500` to Invoice.
   - Updates `advance_balance` -> `0`.
   - Updates Invoice Due -> `700`.
   - Returns Invoice with `due_amount = 700` and `paid_amount = 500` (via advance).

## Deliverables
- SQL Migration scripts for schema changes.
- Updated Backend Logic (Controller/Service/Observer) for automatic clearing.
- API Response updates.
