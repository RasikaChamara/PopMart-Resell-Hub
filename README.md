# PopMart Resell Hub

A web-based **reseller management and commission management system** built for an online business.

PopMart Resell Hub helps manage reseller operations, products, sales, and commission-related information through a centralized web application.

## Overview

Managing an online reseller business can involve keeping track of resellers, products, orders, sales, and commissions across different tools or spreadsheets.

This application was built to bring these workflows together into a single system, making it easier to manage reseller activity and monitor commission-related information.

## Features

* Reseller management
* Product management
* Sales and order management
* Commission management
* Dashboard for business information
* Centralized data management
* Responsive web interface

## Tech Stack

* **React**
* **Vite**
* **JavaScript**
* **Tailwind CSS**
* **Supabase**
* **Vercel**

## Live Demo

[PopMart Resell Hub](https://pop-mart-resell-hub.vercel.app/)

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/RasikaChamara/PopMart-Resell-Hub.git
cd PopMart-Resell-Hub
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure the required environment variables.

Start the development server:

```bash
npm run dev
```

The application will then be available through the local development URL provided by Vite.

## Environment Variables

The application uses environment variables for its Supabase configuration.

Create a `.env` file locally:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Do not commit your `.env` file or any credentials to the repository.**

## Purpose

This project was developed to solve a practical business workflow rather than as a simple demonstration application. The focus was on building a usable system for managing reseller operations and commission-related processes within an online business.

## Future Improvements

* More detailed business analytics and reporting
* Improved commission reports
* Additional role-based access controls
* Automated notifications
* Expanded reseller and sales management features
