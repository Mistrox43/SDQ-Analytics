import { ProjectData, DailyActivityItem } from '../types';
import { safeDate, isProjectActive, isProjectInTesting } from './dateUtils';

/**
 * Processes data in chunks to avoid blocking the main thread
 * @param callback The function to process data in chunks
 */
export const processInChunks = <T, R>(
  items: T[],
  processChunk: (chunk: T[]) => R[],
  chunkSize: number = 500,
  onProgress?: (processed: number, total: number) => void,
  onComplete?: (result: R[]) => void
): Promise<R[]> => {
  return new Promise((resolve) => {
    // Create a copy of the items to work with
    const itemsCopy = [...items];
    const results: R[] = [];
    let processedCount = 0;
    
    // Function to process a single chunk
    const processNextChunk = () => {
      // Get the next chunk
      const chunk = itemsCopy.splice(0, chunkSize);
      
      if (chunk.length === 0) {
        // All done
        if (onComplete) onComplete(results);
        resolve(results);
        return;
      }
      
      // Process this chunk
      const chunkResults = processChunk(chunk);
      results.push(...chunkResults);
      
      // Update progress
      processedCount += chunk.length;
      if (onProgress) onProgress(processedCount, processedCount + itemsCopy.length);
      
      // Schedule the next chunk to avoid blocking the UI
      setTimeout(processNextChunk, 0);
    };
    
    // Start processing
    processNextChunk();
  });
};

/**
 * Calculate daily activity for timeline charts with chunked processing
 */
export const calculateDailyActivityChunked = async (
  filteredData: ProjectData[],
  dateArray: Date[],
  onProgress?: (processed: number, total: number) => void
): Promise<DailyActivityItem[]> => {
  if (!filteredData.length || !dateArray.length) {
    return [];
  }
  
  try {
    // Initialize result object with zeroes for all dates
    const resultMap: Record<string, DailyActivityItem> = {};
    
    dateArray.forEach(date => {
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      resultMap[dateString] = {
        date,
        dateString,
        activeProjects: 0,
        activeTestingProjects: 0
      };
    });
    
    // Function to process each chunk of projects
    const processProjectChunk = (projectChunk: ProjectData[]): any[] => {
      // For each project in the chunk
      projectChunk.forEach(project => {
        // For each date, check if the project is active or in testing
        dateArray.forEach(date => {
          const dateString = date.toISOString().split('T')[0];
          
          if (isProjectActive(project, date)) {
            resultMap[dateString].activeProjects++;
          }
          
          if (isProjectInTesting(project, date)) {
            resultMap[dateString].activeTestingProjects++;
          }
        });
      });
      
      return []; // We're accumulating results in the resultMap
    };
    
    // Process all projects in chunks
    await processInChunks(
      filteredData,
      processProjectChunk,
      100, // Process 100 projects at a time
      onProgress
    );
    
    // Convert the map to an array for the chart
    return Object.values(resultMap);
  } catch (error) {
    console.error("Error calculating daily activity:", error);
    return [];
  }
};