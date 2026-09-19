# Building a Reseller and Commission Management System

## Introduction

PopMart Resell Hub is a web application I built to manage the operations of an online reseller business.

The application focuses on three main areas:

* Managing items
* Managing orders
* Managing resellers and their commissions

When a reseller makes a sale, the application automatically calculates a **25% commission**, stores the commission in the database, and allows an administrator to track whether that commission has been paid.

## The Problem

Managing reseller sales and commissions manually can become difficult as the number of orders increases.

For each reseller sale, the business needs to know:

* Which item was sold
* Which reseller made the sale
* The order amount
* How much commission the reseller earned
* Whether the commission has been paid

The goal of the application was to keep this information connected and automate the commission calculation instead of requiring the administrator to calculate it manually.

## Application Workflow

The main workflow is:

1. Items are added and managed in the system.
2. Resellers are registered and managed.
3. An order is created and associated with the relevant reseller and item.
4. When a reseller sale is recorded, the application automatically calculates the reseller's commission.
5. The calculated commission is stored in the database.
6. The administrator can later mark the commission as **Paid** or **Unpaid**.

This provides a simple workflow for tracking both reseller sales and outstanding commission payments.

## Commission Calculation

The commission rate is currently **25%** of the sale amount.

For example, if a reseller makes a sale of 10,000:

```text
Commission = Sale Amount × Commission Rate

Commission = 10,000 × 0.25

Commission = 2,500
```

The application performs this calculation automatically when the sale is recorded and stores the resulting commission in the database.

This avoids relying on manual calculations and ensures that the same commission rule is applied consistently.

## Commission Payment Tracking

Calculating the commission is only part of the process. The business also needs to know whether the reseller has actually received the commission.

For this reason, the application keeps a payment status for the commission.

The administrator can mark a commission as:

```text
Unpaid
Paid
```

This allows the administrator to identify commissions that still need to be paid and keep track of completed commission payments.

## Data Management

The application uses Supabase for database storage and data management.

The application manages information related to:

* Items
* Orders
* Resellers
* Commissions

Orders connect the sale information with the relevant reseller and item, while commission information records the amount earned by the reseller and its payment status.

## Implementation

The frontend was built using React and Vite, with Supabase used for database operations.

The application contains business logic for automatically calculating the reseller commission when a sale is recorded.

One of the important implementation decisions was to store the calculated commission rather than requiring it to be calculated manually every time it is displayed. This also allows the application to maintain a record of the commission and its payment status.

## What I Learned

This project helped me understand how to translate a real business process into application logic.

One of the main things I learned was that business rules need to be handled consistently by the application. Instead of asking an administrator to manually calculate 25% for every reseller sale, I implemented the calculation as part of the order workflow.

I also learned how related data can be used to represent a business process. An order can be associated with a reseller, which allows the application to determine the commission earned from that sale and maintain its payment status.

Building the project also gave me practical experience working with React, Supabase, database operations, and implementing business logic in a real application.

## Future Improvements

If I continued developing the application, I would consider adding:

* Commission reports for individual resellers
* Commission payment history
* Better filtering and searching for orders and commissions
* Support for different commission rates
* More detailed sales reporting
* Role-based access control for administrators

## Conclusion

PopMart Resell Hub was built to simplify a real reseller business workflow by bringing item management, order management, reseller management, and commission tracking into one application.

The project demonstrates how a relatively simple business rule—automatically calculating a 25% reseller commission—can be integrated into an application's data and workflow so that the process is consistent and easier to manage.
