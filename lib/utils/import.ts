import Papa from 'papaparse';
import { z } from 'zod';

const baseSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  status: z.enum(['active', 'inactive'])
});

export const schemas = {
  'waste-records': z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    type: z.enum(['Paper', 'Plastic', 'Metal', 'Glass', 'Organic', 'Electronic']),
    quantity: z.string(),
    location: z.string(),
    supplier_id: z.string().uuid()
  }),
  
  suppliers: baseSchema.extend({
    name: z.string().min(2),
    contact_person: z.string().min(2),
    location: z.string()
  }),
  
  customers: baseSchema.extend({
    name: z.string().min(2),
    contact_person: z.string().min(2)
  }),
  
  products: z.object({
    name: z.string().min(2),
    category: z.string(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    stock: z.string().regex(/^\d+$/),
    source_type: z.enum(['Recycled', 'Reprocessed', 'Upcycled']),
    process_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    supplier_id: z.string().uuid()
  }),
  
  employees: baseSchema.extend({
    name: z.string().min(2),
    department: z.string(),
    position: z.string()
  })
};

export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
};

export const validateData = (data: any[], type: keyof typeof schemas) => {
  const schema = schemas[type];
  const validationResults = data.map((item, index) => {
    try {
      schema.parse(item);
      return { index, valid: true };
    } catch (error) {
      return { index, valid: false, errors: error.errors };
    }
  });

  return {
    isValid: validationResults.every(r => r.valid),
    results: validationResults
  };
};