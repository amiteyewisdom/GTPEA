import type { ImportType } from "./types";

export function getImportTemplate(type: ImportType): string {
  const templates: Record<string, string[][]> = {
    employees: [
      ["Employee No", "First Name", "Last Name", "Email", "Department", "Position", "Join Date", "Salary", "Phone"],
      ["EMP-001", "John", "Smith", "john.smith@example.com", "operations", "Analyst", "2024-01-15", "5000", "0240000000"],
    ],
    savings: [
      ["Employee No", "Amount", "Date (YYYY-MM-DD or DD/MM/YYYY)", "Type", "Account Number"],
      ["EMP-001", "500", "01/06/2024", "monthly", ""],
    ],
    loans: [
      ["Reference", "Employee No", "Product", "Amount Requested", "Interest Rate", "Term Months", "Monthly Repayment", "Status", "Purpose"],
      ["LN-001", "EMP-001", "Normal Loan", "10000", "0.02", "12", "850", "pending", "Emergency"],
    ],
    "gtpea-employees": [
      ["StaffID", "FullName", "Department", "StaffAccountNumber", "PhoneNumber"],
      ["P0770", "Sarah Yaa Agyeiwaa Abodi-Klenn", "Retail", "P0770", "0240000000"],
    ],
    "gtpea-savings": [
      ["StaffID", "FullName", "StaffSavingAccountNumber", "FacilityAccountNumber", "Balance", "Reference"],
      ["P0770", "Sarah Yaa Agyeiwaa Abodi-Klenn", "63101001P0770", "63101001", "21100", "Savings"],
    ],
    "gtpea-quick-cash": [
      ["StaffID", "FullName", "StaffQuickCashAccountNumber", "FacilityAccountNumber", "Balance", "Reference"],
      ["P0821", "Benjamin Kissi", "62131001P0821", "62131001", "510", "Quick-Cash"],
    ],
    "gtpea-hire-purchase": [
      ["StaffID", "FullName", "SavingsAccountNumber", "FacilityAccountNumber", "Balance", "Reference", "Item Description"],
      ["0767", "Franklina Ohene-Mensah", "621210010767", "62121001", "2967.25", "Hire Purchase", "SAMSUNG A56+HEAD - 128GB"],
    ],
    "gtpea-normal-loans": [
      ["StaffID", "FullName", "NLAccountNumber", "FacilityAccountNumber", "Balance", "Reference"],
      ["P0774", "ANSAH ESINAM PHYLLIS", "62101001P0774", "62101001", "11343.14", "Normal Loan"],
    ],
    "gtpea-lands": [
      ["StaffID", "FullName", "SavingsAccountNumber", "FacilityAccountNumber", "Balance", "Reference", "Item"],
      ["P0770", "Sarah Yaa Agyeiwaa Abodi-Klenn", "62141001P0770", "62141001", "31642.96", "Lands", "Kopodor Land"],
    ],
    "master_excel_upload": [
      ["Note", "Use the GTPEA Final Template New.xlsx file for master upload"],
    ],
  };

  const template = templates[type];
  if (!template) {
    return "No template available for this import type.";
  }

  return template.map((row) => row.join(",")).join("\n");
}
