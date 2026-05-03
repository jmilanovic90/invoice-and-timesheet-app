# Invoice & Timesheet App

A web application for managing company and client data, creating invoices and timesheets, viewing lists, and exporting PDF documents.

## Run Locally
1. Open a terminal in the project root folder:
   `C:\Users\jmila\OneDrive\Documents\Invoice And Timesheet App`
2. Install dependencies:
   `npm install`
3. Start the app:
   `npm run dev`
4. Open the address shown by Vite in the terminal, most commonly:
   [http://localhost:5173](http://localhost:5173)
5. If you want to check the project before using it:
   `npm run typecheck`
6. If you want a production build:
   `npm run build`

## Access Through Vercel
1. Open the Vercel deployment link for the app https://invoice-and-timesheet-app.vercel.app/
2. The app runs directly in the browser, with no local installation needed.
3. For the best result, use one browser and one device for the same set of data.
4. If your data disappears, check whether browser storage was cleared or if you changed browser, profile, or device.

## How To Use The App
### App can be used for generating pdf invoices and timesheets at any time, but long-term usage has storage limitations (read below)
1. Open `Company` and enter your company details.
2. Add a logo if you want it to appear on invoice and timesheet PDFs.
3. Open `Clients` and add one or more clients.
4. Open `Invoices`, click `New invoice`, and create an invoice.
5. From the invoice list you can:
   - open an invoice
   - edit an invoice
   - download a PDF
   - delete an invoice
6. Open `Timesheets`, click `New timesheet`, and choose a month, year, and optionally a client.
7. Enter hours by day, save the timesheet, and download a PDF if needed.

## Local Vs Vercel
### Running locally
- Data is stored in browser storage on that computer and in that browser.
- If you clear browser storage, switch browsers, or use another user profile, the data will not be available there.
- Local usage is better for day-to-day work and keeping the same data on one computer.

### Vercel version
- Data is also stored only in browser storage, not in a database.
- This means data may disappear if storage is cleared, the browser changes, another device is used, or the app is opened in private/incognito mode.
- The Vercel version is better suited for quick entry, invoice generation, previewing, and PDF export.
- For long-term data keeping, do not rely only on the deployed version.

## Current Limitations
- There is no backend database and no user account system.
- There is no data sync between devices or browsers.
- Field validation is basic and does not cover all business cases.
- There are no advanced tax rules, accounting rules, or approval workflows.
- The PDF layout is tailored for this project and is not a generic template engine.
- If data is removed from browser storage, the app cannot restore it.

## Recommended Use
- First fill in `Company`.
- Then add all required `Clients`.
- After that, use `Invoices` and `Timesheets`.
- When you create an important invoice or timesheet, download the PDF immediately.

## Scripts
- `npm run dev` - start locally
- `npm run build` - production build
- `npm run preview` - preview the production build
- `npm run typecheck` - TypeScript check
- `npm run test` - unit tests
