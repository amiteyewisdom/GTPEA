import xlsx from 'xlsx';
const wb = xlsx.readFile('GTPEA Final Template New.xlsx');
for (const name of wb.SheetNames) {
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[name], { header: 1 });
  console.log(`\n=== ${name} (${rows.length} rows) ===`);
  console.log('header:', JSON.stringify(rows[0]));
  // count cells that look like phone numbers (7+ digits) per column
  const colCounts = {};
  for (const r of rows.slice(1)) {
    if (!Array.isArray(r)) continue;
    r.forEach((v, i) => {
      const d = String(v ?? '').replace(/\D/g, '');
      if (d.length >= 9 && d.length <= 13) colCounts[i] = (colCounts[i] || 0) + 1;
    });
  }
  console.log('digit-ish cells per col:', JSON.stringify(colCounts));
}
