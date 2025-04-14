import { useState, useRef, useEffect } from 'react';
import { 
  FilterOptions, 
  Filters, 
  ProjectData,
  DateRange,
  SelectedDateRange
} from '../types';

/**
 * Custom hook to handle CSV data loading and processing using Web Worker
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

  // Create web worker ref to avoid recreating it on each render
  const workerRef = useRef<Worker | null>(null);

  // Set up worker on component mount
  useEffect(() => {
    // Create the worker
    workerRef.current = new Worker(new URL('../workers/csvWorker.ts', import.meta.url), { type: 'module' });

    // Set up the message handler
    workerRef.current.onmessage = (event) => {
      const { status, data, error: workerError } = event.data;

      if (status === 'success') {
        setCsvData(data.csvData);
        setFilterOptions(data.filterOptions);
        setDateRange(data.dateRange);

        // Initialize selected date range to the last 3 months by default
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        
        // Make sure we're within the actual data range
        const minDate = data.dateRange.min;
        const maxDate = data.dateRange.max;
        const finalStartDate = startDate > minDate ? startDate : minDate;
        const finalEndDate = endDate < maxDate ? endDate : maxDate;
        
        setSelectedDateRange({
          start: finalStartDate,
          end: finalEndDate
        });
        
        // Reset filters
        setFilters({
          region: [],
          projectType: [],
          lob: [],
          status: []
        });

        setIsLoading(false);
      } else if (status === 'error') {
        setError(workerError);
        setIsLoading(false);
      }
    };

    // Clean up the worker when the component unmounts
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  /**
   * Handle file upload and CSV parsing via web worker
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    if (workerRef.current) {
      // Send the file to the worker for processing
      workerRef.current.postMessage({
        operation: 'parse',
        file
      });
    } else {
      setError('Web worker initialization failed');
      setIsLoading(false);
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