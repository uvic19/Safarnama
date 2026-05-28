import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and saves an expense report PDF.
 *
 * @param {object} trip - The trip document (needs name, base_currency, start_date, end_date, destinations)
 * @param {Array}  expenses - Array of expense objects with dateStr, category, description, paid_by_name, currency, amount, amount_in_base, amountVal
 * @param {object} [options]
 * @param {string} [options.title]       - Override the PDF title line
 * @param {string} [options.subtitle]    - Second line below the title
 * @param {string} [options.filename]    - Override the saved filename (without .pdf)
 * @param {number} [options.filteredTotal] - Pre-calculated total (skips recalculation)
 */
export function generateExpensePDF(trip, expenses, options = {}) {
  if (!trip || expenses.length === 0) return;

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const baseCurr = trip.base_currency || 'INR';

  const title = options.title || `${trip.name} — Expense Report`;
  const subtitle = options.subtitle || `Exported on: ${new Date().toLocaleString()}`;
  const filename = options.filename
    ? `${options.filename}.pdf`
    : `safarnama_${trip.name.replace(/\s+/g, '_').toLowerCase()}_export.pdf`;

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(subtitle, pageWidth / 2, 28, { align: 'center' });

  // Summary stats
  const total =
    options.filteredTotal != null
      ? options.filteredTotal
      : expenses.reduce((sum, e) => sum + (e.amountVal ?? Number(e.amount_in_base || e.amount) ?? 0), 0);

  pdf.setFontSize(12);
  pdf.text(`Total: ${baseCurr} ${total.toLocaleString()}`, 14, 40);
  pdf.text(`Expenses: ${expenses.length}`, 14, 48);

  if (trip.destinations?.length) {
    pdf.text(
      `Destinations: ${Array.isArray(trip.destinations) ? trip.destinations.join(', ') : trip.destinations}`,
      14,
      56,
    );
  }

  // Table
  const tableData = expenses.map((exp) => {
    const dateStr =
      exp.dateStr ||
      (exp.created_at?.toDate
        ? exp.created_at.toDate().toLocaleDateString()
        : 'Unknown');

    const amtStr =
      exp.currency && exp.currency !== baseCurr
        ? `${exp.currency} ${exp.amount} (${baseCurr} ${exp.amount_in_base || exp.amount})`
        : `${baseCurr} ${exp.amountVal ?? exp.amount_in_base ?? exp.amount}`;

    return [
      dateStr,
      exp.category || 'Other',
      exp.description || '—',
      exp.paid_by_name || 'Someone',
      amtStr,
    ];
  });

  autoTable(pdf, {
    startY: 65,
    head: [['Date', 'Category', 'Description', 'Paid By', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [24, 24, 27] }, // zinc-900
  });

  pdf.save(filename);
}
