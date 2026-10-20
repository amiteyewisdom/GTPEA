import xlsx from 'xlsx';
const wb = xlsx.readFile('GTPEA Data - Jun26 b.xlsx');
for (const name of wb.SheetNames) {
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[name], { header: 1 });
  console.log(`\n=== ${name} (${rows.length} rows) ===`);
  console.log('header:', JSON.stringify(rows[0]));
  const colCounts = {};
  for (const r of rows.slice(1)) {
    if (!Array.isArray(r)) continue;
    r.forEach((v, i) => {
      const d = String(v ?? '').replace(/\D/g, '');
      if (d.length >= 9 && d.length <= 13) colCounts[i] = (colCounts[i] || 0) + 1;
    });
  }
  console.log('digit-ish cells per col:', JSON.stringify(colCounts));
  rows.slice(1, 4).forEach(r => console.log('  ', JSON.stringify(r)));
}
