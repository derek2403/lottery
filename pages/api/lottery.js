import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'lottery.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Read existing data
      const jsonData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      const newRecord = req.body;
      
      // Keep only last 10 records
      if (jsonData.records.length >= 10) {
        jsonData.records.shift(); // Remove oldest record
      }
      
      jsonData.records.push({
        id: jsonData.records.length + 1,
        ...newRecord,
        date: new Date().toISOString()
      });

      // Write back to file
      fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));
      
      res.status(200).json({ success: true, data: jsonData.records });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const jsonData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      res.status(200).json({ success: true, data: jsonData.records });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
} 