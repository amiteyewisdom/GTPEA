import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const excelFilePath = path.join(process.cwd(), 'GTPEA Final Template New.xlsx');
const outputDir = path.join(process.cwd(), 'gtpea-imports');

try {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read the Excel file
  const fileBuffer = fs.readFileSync(excelFilePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  
  console.log('📊 Extracting Sheets from GTPEA Excel File');
  console.log('============================================\n');
  
  // Extract each sheet as CSV
  workbook.SheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    // Create a safe filename
    const safeName = sheetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeName}.csv`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, csv);
    
    console.log(`✅ Sheet ${index + 1}: "${sheetName}" → ${filename}`);
  });
  
  console.log(`\n📁 All sheets extracted to: ${outputDir}`);
  console.log('🚀 You can now upload these CSV files individually through the admin interface!');
  
} catch (error) {
  console.error('❌ Error extracting sheets:', error.message);
}