import { useState } from 'react';
import Papa from 'papaparse';
import { safeDate } from '../utils/dateUtils';
import { processRawData, extractFilterOptions } from '../utils/dataProcessing';
import { 
  FilterOptions, 
  Filters, 
  ProjectData,
  DateRange,
  SelectedDateRange
} from '../types';

/**
 * Custom hook to handle CSV data loading and processing
 */
export const useCSVData = () => {
  const [csvData, setCsvData] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ min: null, max: null });
  const [selectedDateRange, setSelectedDateRange] = useState<SelectedDateRange>({ start: null, end: null });
  const [filters, setFilters] = useState<Filters>({
    region: [],
    projectType: [],
    lob: [],
    status: []
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    regions: [],
    projectTypes: [],
    lobs: [],
    statuses: []
  });

  /**
   * Handle file upload and CSV parsing
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results.data);
        setIsLoading(false);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setIsLoading(false);
      }
    });
  };

  /**
   * Process and prepare data after CSV parsing
   */
  const processData = (data: any[]) => {
    // Clean up data
    const cleanedData = processRawData(data);
    setCsvData(cleanedData);
    
    // Extract filter options
    const options = extractFilterOptions(cleanedData);
    setFilterOptions(options);
    
    // Reset filters to empty arrays (select all by default)
    setFilters({
      region: [],
      projectType: [],
      lob: [],
      status: []
    });
    
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
    
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      setDateRange({
        min: minDate,
        max: maxDate
      });
      
      // Initialize selected date range to the last 3 months by default
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      // Make sure we're within the actual data range
      const finalStartDate = startDate > minDate ? startDate : minDate;
      const finalEndDate = endDate < maxDate ? endDate : maxDate;
      
      setSelectedDateRange({
        start: finalStartDate,
        end: finalEndDate
      });
    }
  };

  return {
    csvData,
    isLoading,
    error,
    dateRange,
    selectedDateRange,
    setSelectedDateRange,
    filters,
    setFilters,
    filterOptions,
    handleFileUpload
  };
};