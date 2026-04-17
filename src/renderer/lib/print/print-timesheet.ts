export async function printTimesheetDocument(root: HTMLElement, documentTitle = 'Timesheet'): Promise<void> {
  const printWindow = window.open('', '_blank', 'width=1200,height=900');

  if (!printWindow) {
    return;
  }

  const clonedRoot = root.cloneNode(true) as HTMLElement;
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <html>
      <head>
        <title>${documentTitle}</title>
        <base href="${window.location.origin}/" />
        ${styles}
        <style>
          body {
            margin: 0;
            padding: 0;
            background: white;
            color: #111827;
            font-family: "Segoe UI", Arial, sans-serif;
          }
          body * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .timesheet-sheet--print {
            padding: 0 !important;
            border: 0 !important;
            width: 194mm !important;
            margin: 0 auto !important;
            gap: 10px !important;
          }
          .timesheet-sheet__header {
            gap: 8px !important;
          }
          .timesheet-sheet__summary {
            display: block !important;
          }
          .timesheet-sheet__meta-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 6px 16px !important;
          }
          .timesheet-sheet__meta-pair {
            grid-template-columns: 58px 1fr !important;
            gap: 6px !important;
          }
          .timesheet-sheet__meta-pair span,
          .timesheet-sheet__meta-pair strong {
            font-size: 0.86rem !important;
          }
          .timesheet-table-shell {
            margin-top: 2px !important;
          }
          .timesheet-table {
            min-width: 100% !important;
          }
          .timesheet-table th,
          .timesheet-table td {
            padding: 3px 4px !important;
            font-size: 0.74rem !important;
          }
          .timesheet-table__time-head {
            min-width: 20px !important;
          }
          .timesheet-table__day-head {
            min-width: 74px !important;
          }
          .timesheet-table__date-head {
            min-width: 58px !important;
          }
          .timesheet-table__slot-cell {
            min-width: 24px !important;
          }
          .timesheet-table__total-head,
          .timesheet-table__total-cell {
            min-width: 30px !important;
          }
          .timesheet-table__comment-head,
          .timesheet-table__comment-cell {
            min-width: 178px !important;
          }
          .timesheet-table__comment-cell {
            word-break: break-word !important;
            font-size: 0.7rem !important;
          }
          .timesheet-sheet__header h2 {
            font-size: 1.35rem !important;
            margin-bottom: 2px !important;
          }
          .timesheet-sheet__footer {
            margin-top: 0 !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .timesheet-sheet__footer-date {
            margin-bottom: 0 !important;
            align-self: center !important;
            grid-template-columns: 42px minmax(100px, 140px) !important;
            gap: 8px !important;
            flex: 0 0 auto !important;
          }
          .timesheet-sheet__logo {
            display: flex !important;
            justify-content: flex-end !important;
            min-height: 0 !important;
            align-items: center !important;
            align-self: center !important;
            flex: 0 0 auto !important;
          }
          .timesheet-sheet__logo img {
            width: 112px !important;
            display: block !important;
          }
          @page {
            size: A4;
            margin: 8mm;
          }
        </style>
      </head>
      <body>${clonedRoot.outerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 150);
}
