import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const excelFilePath = path.join(process.cwd(), 'GTPEA Final Template New.xlsx');

try {
  // Read the Excel file
  const fileBuffer = fs.readFileSync(excelFilePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  
  console.log('📊 Excel File Analysis');
  console.log('=====================\n');
  
  // Display all sheet names
  console.log('📋 Sheets found:');
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`  ${index + 1}. ${sheetName}`);
  });
  
  console.log('\n📄 Sheet Details:');
  console.log('=================\n');
  
  // Analyze each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`\n📌 Sheet ${index + 1}: "${sheetName}"`);
    console.log(`   Total rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`   Headers: ${data[0].join(', ')}`);
      
      if (data.length > 1) {
        console.log(`   Sample data row: ${data[1].join(', ')}`);
      }
      
      // Show first few rows
      console.log(`   First 3 rows of data:`);
      data.slice(0, Math.min(4, data.length)).forEach((row, rowIndex) => {
        if (rowIndex === 0) {
          console.log(`     Headers: ${row.join(' | ')}`);
        } else {
          console.log(`     Row ${rowIndex}: ${row.join(' | ')}`);
        }
      });
    }
  });
  
  console.log('\n✅ Analysis complete!');
  
} catch (error) {
  console.error('❌ Error reading Excel file:', error.message);
  console.error('Make sure the file exists at:', excelFilePath);
}