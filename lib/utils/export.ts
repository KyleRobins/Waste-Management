import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadTemplate = (type: string) => {
  let template;
  
  switch (type) {
    case 'waste-records':
      template = [
        {
          date: 'YYYY-MM-DD',
          type: 'Paper/Plastic/Metal/Glass/Organic/Electronic',
          quantity: '100',
          location: 'Collection Point A',
          supplier_id: 'UUID of supplier',
        }
      ];
      break;
    case 'suppliers':
      template = [
        {
          name: 'Company Name',
          contact_person: 'Contact Person Name',
          email: 'email@example.com',
          phone: '+1234567890',
          location: 'Company Address',
          status: 'active/inactive'
        }
      ];
      break;
    case 'customers':
      template = [
        {
          name: 'Company Name',
          contact_person: 'Contact Person Name',
          email: 'email@example.com',
          phone: '+1234567890',
          status: 'active/inactive'
        }
      ];
      break;
    case 'products':
      template = [
        {
          name: 'Product Name',
          category: 'Category Name',
          price: '100.00',
          stock: '50',
          source_type: 'Recycled/Reprocessed/Upcycled',
          process_date: 'YYYY-MM-DD',
          supplier_id: 'UUID of supplier'
        }
      ];
      break;
    case 'employees':
      template = [
        {
          name: 'Full Name',
          email: 'email@example.com',
          phone: '+1234567890',
          department: 'Department Name',
          position: 'Job Position',
          status: 'active/inactive'
        }
      ];
      break;
    default:
      template = [];
  }

  exportToCSV(template, `${type}-template`);
};