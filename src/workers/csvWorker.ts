// CSV processing worker
import Papa from 'papaparse';
import { processRawData, extractFilterOptions } from '../utils/dataProcessing';
import { safeDate } from '../utils/dateUtils';

// Handle messages from the main thread
self.onmessage = (event) => {
  const { file, operation } = event.data;
  
  if (operation === 'parse') {
    // Process the CSV file
    const fileReader = new FileReader();
    
    fileReader.onload = (e) => {
      const csv = e.target?.result;
      
      if (typeof csv === 'string') {
        // Parse the CSV
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              // Process the data
              const cleanedData = processRawData(results.data);
              
              // Extract filter options
              const filterOptions = extractFilterOptions(cleanedData);
              
              // Extract date range
              const dates = cleanedData
                .map(row => [
                  row['Kick-Off Date'], 
                  row['Testing Start'], 
                  row['Testing End'], 
                  row['Hospital Go-Live Date'], 
                  row['OH Go-Live Date']
                ])
                .flat()
                .filter(Boolean)
                .map(d => safeDate(d))
                .filter(Boolean) as Date[];
              
              let dateRange = { min: null, max: null };
              
              if (dates.length > 0) {
                const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
                const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
                
                dateRange = {
                  min: minDate,
                  max: maxDate
                };
              }
              
              // Send the processed data back to the main thread
              self.postMessage({
                status: 'success',
                data: {
                  csvData: cleanedData,
                  filterOptions,
                  dateRange
                }
              });
            } catch (error) {
              self.postMessage({
                status: 'error',
                error: `Error processing data: ${error instanceof Error ? error.message : String(error)}`
              });
            }
          },
          error: (error) => {
            self.postMessage({
              status: 'error',
              error: `Error parsing CSV: ${error.message}`
            });
          }
        });
      } else {
        self.postMessage({
          status: 'error',
          error: 'Failed to read file as text'
        });
      }
    };
    
    fileReader.onerror = () => {
      self.postMessage({
        status: 'error',
        error: 'Error reading file'
      });
    };
    
    // Read the file as text
    fileReader.readAsText(file);
  }
};

// TypeScript requires this export
export {};