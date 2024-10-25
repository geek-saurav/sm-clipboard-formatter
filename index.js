import clipboardy from 'clipboardy';
import _ from 'lodash';
import csv from 'csv-parser';
import { createObjectCsvStringifier } from 'csv-writer';

const formatCsv = (data) => {
  const rows = [];
  const headers = Object.keys(data[0]);

  data.forEach((row) => {
    const formattedRow = {};
    headers.forEach((header) => {
      formattedRow[header] = _.trim(row[header]);
    });
    rows.push(formattedRow);
  });

  const csvStringifier = createObjectCsvStringifier({ header: headers });
  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(rows);
};

const formatClipboardContent = async (options = {}) => {
  try {
    let clipboardContent = await clipboardy.read();
    
    // Remove special characters if the option is set
    if (options.removeSpecialChars) {
      clipboardContent = clipboardContent.replace(/[^\w\s,.]/g, '');
    }

    let formattedContent;

    // Check if the content is JSON
    try {
      const jsonData = JSON.parse(clipboardContent);
      formattedContent = JSON.stringify(jsonData, null, 2); // Pretty print JSON
    } catch (e) {
      // Check if the content is CSV
      const isCsv = clipboardContent.split('\n').every(line => line.split(',').length > 1);
      if (isCsv) {
        const rows = [];
        clipboardContent
          .split('\n')
          .slice(1) // Skip header
          .forEach((line) => {
            const columns = line.split(',');
            rows.push({ col1: columns[0], col2: columns[1] }); // Adjust based on your CSV structure
          });
        formattedContent = formatCsv(rows);
      } else {
        // If not JSON or CSV, proceed to trim whitespace
        formattedContent = _.trim(clipboardContent);
      }
    }

    // Write the formatted content back to the clipboard
    await clipboardy.write(formattedContent);
    console.log('Clipboard content formatted successfully!');
  } catch (error) {
    console.error('Error formatting clipboard content:', error);
  }
};

// Execute the formatter with options
const options = { removeSpecialChars: true }; // Customize options here
formatClipboardContent(options);