export async function printInvoiceDocument(root: HTMLElement, documentTitle = 'Invoice'): Promise<void> {
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
          html {
            font-size: 16px;
          }
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
          .invoice-document {
            border: 0 !important;
            border-radius: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            width: 194mm !important;
            min-height: auto !important;
            margin: 0 auto !important;
            gap: 18px !important;
            break-inside: avoid-page;
            page-break-inside: avoid;
          }
          .invoice-document__header {
            display: grid !important;
            grid-template-columns: minmax(0, 1.9fr) repeat(3, minmax(0, 0.78fr)) !important;
            gap: 18px !important;
            align-items: start !important;
          }
          .invoice-document__title h2,
          .invoice-document__number {
            font-size: 2rem !important;
          }
          .invoice-document__meta-item {
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
          }
          .invoice-document__meta-item span,
          .invoice-document__caption {
            font-size: 0.98rem !important;
          }
          .invoice-document__meta-item strong {
            font-size: 1.18rem !important;
            line-height: 1.2 !important;
          }
          .invoice-document__parties {
            display: grid !important;
            grid-template-columns: minmax(0, 1.9fr) repeat(3, minmax(0, 0.78fr)) !important;
            column-gap: 18px !important;
            row-gap: 12px !important;
            padding: 18px 0 !important;
          }
          .invoice-document__from {
            grid-column: 1 / 2 !important;
          }
          .invoice-document__billto {
            grid-column: 2 / 5 !important;
          }
          .invoice-document__parties h3 {
            font-size: 1.8rem !important;
            margin: 0 0 12px !important;
          }
          .invoice-document__parties p {
            margin: 0 0 4px !important;
            line-height: 1.28 !important;
            font-size: 1.05rem !important;
          }
          .invoice-document__table {
            font-size: 1.06rem !important;
          }
          .invoice-document__row {
            display: grid !important;
            grid-template-columns: 2.4fr 0.9fr 0.9fr 0.9fr 0.9fr 1fr !important;
            gap: 14px !important;
            padding: 10px 0 !important;
            align-items: start !important;
          }
          .invoice-document__row--head {
            font-size: 0.88rem !important;
          }
          .invoice-document__summary {
            border-top: 2px solid #111827 !important;
          }
          .invoice-document__summary-row {
            display: grid !important;
            grid-template-columns: minmax(0, 1.9fr) repeat(3, minmax(0, 0.78fr)) !important;
            gap: 18px !important;
            padding: 10px 0 !important;
            font-size: 1.12rem !important;
            align-items: center !important;
          }
          .invoice-document__summary-label {
            grid-column: 1 / 4 !important;
          }
          .invoice-document__summary-value {
            grid-column: 4 / 5 !important;
            text-align: right !important;
          }
          .invoice-document__notes {
            gap: 6px !important;
            font-size: 0.92rem !important;
          }
          .invoice-document__notes h4 {
            margin: 0 0 4px !important;
            font-size: 1.08rem !important;
          }
          .invoice-document__notes p {
            margin: 0 0 2px !important;
            line-height: 1.12 !important;
          }
          .invoice-document__logo img {
            max-width: 190px !important;
          }
          .invoice-document__logo {
            padding-top: 0 !important;
            margin-top: -6px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          @media print {
            .invoice-document__header {
              grid-template-columns: minmax(0, 1.9fr) repeat(3, minmax(0, 0.78fr)) !important;
            }
            .invoice-document__parties {
              grid-template-columns: minmax(0, 1.9fr) repeat(3, minmax(0, 0.78fr)) !important;
            }
            .invoice-document__row {
              grid-template-columns: 2.4fr 0.9fr 0.9fr 0.9fr 0.9fr 1fr !important;
            }
            .invoice-document__summary-row {
              grid-template-columns: minmax(0, 1.9fr) repeat(3, minmax(0, 0.78fr)) !important;
            }
          }
          @page {
            size: A4;
            margin: 7mm 8mm;
          }
        </style>
      </head>
      <body>${clonedRoot.outerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  const waitForImages = Promise.all(
    Array.from(printWindow.document.images).map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        })
    )
  );

  void waitForImages.then(() => {
    setTimeout(() => {
      printWindow.print();
    }, 150);
  });
}
