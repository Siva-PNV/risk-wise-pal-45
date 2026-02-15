

# Intelligent Money Overuse Risk Prediction System

## Overview
A financial health tracking app that predicts money overuse risk based on income and expense data, with visual analytics and personalized suggestions.

---

## Page 1: Dashboard (Home)
The main hub showing a financial overview at a glance:
- **Summary cards**: Monthly income, total spending, savings ratio, current risk level (with colored badge: green/yellow/red)
- **Charts section**:
  - Pie chart: Essential vs Non-Essential spending breakdown
  - Bar chart: Category-wise spending
  - Line chart: Monthly expense trend over time
  - Risk history chart: Risk level tracked over months
- Quick-action buttons to add income/expenses

## Page 2: Add Income
- Form to enter monthly income with month selector and amount field
- Table showing income history with edit/delete options

## Page 3: Add Expenses
- Form with fields: month, category (dropdown), amount, expense type (essential/non-essential)
- Expense history table with filtering by month and category
- Edit/delete functionality

## Page 4: Risk Prediction
- Select a month to analyze
- The system automatically calculates:
  - Total spending
  - Savings ratio
  - Essential vs non-essential ratios
  - Expense growth rate
- Displays:
  - **Risk level** (Low / Medium / High) with visual badge
  - **Savings ratio** percentage
  - **Personalized suggestions**:
    - High Risk: Reduce non-essential spending, savings targets, top 3 high-spend categories
    - Medium Risk: Improve savings ratio to 25%+
    - Low Risk: Investment planning recommendations
- Prediction history table

## Page 5: Analytics & Comparison
- Side-by-side comparison of financial metrics across months
- Spending trends and risk trajectory
- Category breakdown analysis over time

## Risk Classification Logic (Rule-Based)
- Savings ratio > 30% → **Low Risk** (green)
- Savings ratio 10–30% → **Medium Risk** (yellow)
- Savings ratio < 10% → **High Risk** (red)

## Data Storage
All data stored locally in browser (localStorage) since no auth is needed. This means:
- No account needed — just start using it
- Data persists between sessions
- Can be upgraded to Supabase database later for cloud sync

## Design
- Clean, modern dashboard design with card-based layout
- Color-coded risk indicators throughout
- Responsive design for desktop and mobile
- Light theme with clear data visualization using Recharts (already installed)

## Navigation
- Sidebar or top navigation with links to: Dashboard, Income, Expenses, Predict, Analytics

