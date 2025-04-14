import _ from 'lodash';
import { safeDate, isProjectActive, isProjectInTesting, isEmptyField } from './dateUtils';
import { 
  ProjectData, 
  FilterOptions, 
  ChartDataItem, 
  ResourceAllocationItem,
  DailyActivityItem,
  TimelineDetailProject,
  DataQualityIssue,
  SelectedDateRange
} from '../types';

/**
 * Processes raw CSV data and returns cleaned data
 */
export const processRawData = (data: any[]): ProjectData[] => {
  // Clean up data - trim whitespace, handle nulls
  return data.map(row => {
    const cleanRow: ProjectData = {};
    Object.keys(row).forEach(key => {
      const cleanKey = key.trim();
      
      // Special handling for boolean fields
      if (cleanKey === 'OH Go-Live Date Confirmed') {
        const value = row[key];
        // Handle various representations of boolean true/false
        if (typeof value === 'boolean') {
          cleanRow[cleanKey] = value;
        } else if (typeof value === 'string') {
          const normalizedValue = value.trim().toLowerCase();
          cleanRow[cleanKey] = normalizedValue === 'true' || normalizedValue === 'yes' || normalizedValue === '1';
        } else if (typeof value === 'number') {
          cleanRow[cleanKey] = value === 1;
        } else {
          cleanRow[cleanKey] = false; // Default to false for null/undefined/etc.
        }
      } else {
        // Regular field handling
        cleanRow[cleanKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
      }
    });
    return cleanRow;
  });
};

/**
 * Extracts filter options from project data
 */
export const extractFilterOptions = (data: ProjectData[]): FilterOptions => {
  const regions = [...new Set(data.map(row => row['OH Region']).filter(Boolean))];
  const projectTypes = [...new Set(data.map(row => row['Project Type']).filter(Boolean))];
  const lobs = [...new Set(data.map(row => row['LOB']).filter(Boolean))];
  const statuses = [...new Set(data.map(row => row['Project Status']).filter(Boolean))];
  
  return {
    regions,
    projectTypes,
    lobs,
    statuses
  };
};

/**
 * Applies filters to data
 */
export const getFilteredData = (csvData: ProjectData[], filters: any): ProjectData[] => {
  if (!csvData.length) return [];
  
  return csvData.filter(row => {
    // If no filters selected for a category, show all
    const regionMatch = filters.region.length === 0 || filters.region.includes(row['OH Region']);
    const projectTypeMatch = filters.projectType.length === 0 || filters.projectType.includes(row['Project Type']);
    const lobMatch = filters.lob.length === 0 || filters.lob.includes(row['LOB']);
    const statusMatch = filters.status.length === 0 || filters.status.includes(row['Project Status']);
    
    return regionMatch && projectTypeMatch && lobMatch && statusMatch;
  });
};

/**
 * Calculate status distribution for charts
 */
export const calculateStatusDistribution = (filteredData: ProjectData[]): ChartDataItem[] => {
  if (!filteredData.length) return [];
  
  const grouped = _.countBy(filteredData, 'Project Status');
  return Object.keys(grouped).map(key => ({
    name: key || 'Unknown',
    value: grouped[key]
  }));
};

/**
 * Calculate project type distribution for charts
 */
export const calculateProjectTypeDistribution = (filteredData: ProjectData[]): ChartDataItem[] => {
  if (!filteredData.length) return [];
  
  const grouped = _.countBy(filteredData, 'Project Type');
  return Object.keys(grouped).map(key => ({
    name: key || 'Unknown',
    value: grouped[key]
  }));
};

/**
 * Calculate LOB distribution for charts
 */
export const calculateLOBDistribution = (filteredData: ProjectData[]): ChartDataItem[] => {
  if (!filteredData.length) return [];
  
  const grouped = _.countBy(filteredData, 'LOB');
  return Object.keys(grouped).map(key => ({
    name: key || 'Unknown',
    value: grouped[key]
  }));
};

/**
 * Calculate resource allocation for charts
 */
export const calculateResourceAllocation = (filteredData: ProjectData[]): ResourceAllocationItem[] => {
  if (!filteredData.length) return [];
  
  // Count projects per specialist (handling multiple specialists per project)
  const specialistCounts: Record<string, number> = {};
  
  filteredData.forEach(row => {
    if (!row['OH Specialist(s)']) return;
    
    const specialists = row['OH Specialist(s)'].split(';');
    specialists.forEach(spec => {
      const specialist = spec.trim();
      if (specialist) {
        specialistCounts[specialist] = (specialistCounts[specialist] || 0) + 1;
      }
    });
  });
  
  return Object.keys(specialistCounts)
    .map(name => ({
      name,
      count: specialistCounts[name]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 specialists
};

/**
 * Calculate project lead allocation for charts
 */
export const calculateProjectLeadAllocation = (filteredData: ProjectData[]): ResourceAllocationItem[] => {
  if (!filteredData.length) return [];
  
  // Count projects per project lead
  const leadCounts: Record<string, number> = {};
  
  filteredData.forEach(row => {
    if (!row['OH Project Lead']) return;
    
    const lead = row['OH Project Lead'].trim();
    if (lead) {
      leadCounts[lead] = (leadCounts[lead] || 0) + 1;
    }
  });
  
  return Object.keys(leadCounts)
    .map(name => ({
      name,
      count: leadCounts[name]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 project leads
};

/**
 * Calculate daily activity for timeline charts
 */
export const calculateDailyActivity = (filteredData: ProjectData[], selectedDateRange: SelectedDateRange): DailyActivityItem[] => {
  if (!filteredData.length || !selectedDateRange.start || !selectedDateRange.end) {
    return [];
  }
  
  try {
    // Create an array of dates within the selected range
    const dateArray: Date[] = [];
    const currentDate = new Date(selectedDateRange.start);
    const endDate = new Date(selectedDateRange.end);
    
    // Validate dates
    if (isNaN(currentDate.getTime()) || isNaN(endDate.getTime())) {
      return [];
    }
    
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate activities for each day
    return dateArray.map(date => {
      const activeProjects = filteredData.filter(project => isProjectActive(project, date));
      const activeTestingProjects = filteredData.filter(project => isProjectInTesting(project, date));
      
      return {
        date,
        dateString: date.toISOString().split('T')[0], // YYYY-MM-DD format
        activeProjects: activeProjects.length,
        activeTestingProjects: activeTestingProjects.length
      };
    });
  } catch (error) {
    console.error("Error calculating daily activity:", error);
    return [];
  }
};

/**
 * Get projects for timeline detail view
 */
export const getTimelineDetailProjects = (filteredData: ProjectData[], selectedDateRange: SelectedDateRange): TimelineDetailProject[] => {
  if (!filteredData.length || !selectedDateRange.start || !selectedDateRange.end) {
    return [];
  }
  
  try {
    // Create a map of dates within the range to check activity
    const dateArray: Date[] = [];
    const currentDate = new Date(selectedDateRange.start);
    const endDate = new Date(selectedDateRange.end);
    
    // Validate dates
    if (isNaN(currentDate.getTime()) || isNaN(endDate.getTime())) {
      return [];
    }
    
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Function to check if a project is active on any date in the range
    const isProjectActiveInRange = (project: ProjectData): boolean => {
      return dateArray.some(date => isProjectActive(project, date));
    };
    
    // Function to check if a project is in testing on any date in the range
    const isProjectInTestingInRange = (project: ProjectData): boolean => {
      return dateArray.some(date => isProjectInTesting(project, date));
    };
    
    // Map projects with their status within the date range
    return filteredData
      .filter(project => project) // Filter out null/undefined projects
      .map(project => {
        const isActive = isProjectActiveInRange(project);
        const isTesting = isProjectInTestingInRange(project);
        
        // Only return projects that are active or in testing
        if (!isActive && !isTesting) return null;
        
        return {
          ...project,
          timelineStatus: isActive ? "Active Project" : (isTesting ? "Active Testing" : "Not Active")
        };
      })
      .filter(Boolean) as TimelineDetailProject[]; // Filter out null results
  } catch (error) {
    console.error("Error calculating timeline detail projects:", error);
    return [];
  }
};

/**
 * Identify data quality issues in the dataset
 */
export const calculateDataQualityIssues = (filteredData: ProjectData[]): DataQualityIssue[] => {
  if (!filteredData.length) return [];
  
  // Projects without Go-live dates (have Kick-off but no go-live dates)
  const missingGoLive = filteredData.filter(row => {
    // Has a Kick-Off date that's not empty
    const hasKickOff = !isEmptyField(row['Kick-Off Date']);
    
    // Both Go-Live dates are missing
    const missingHospitalGoLive = isEmptyField(row['Hospital Go-Live Date']);
    const missingOHGoLive = isEmptyField(row['OH Go-Live Date']);
    
    return hasKickOff && missingHospitalGoLive && missingOHGoLive;
  });
  
  // Projects without Kick-off but have Go-live date
  const missingKickOff = filteredData.filter(row => {
    // Missing Kick-Off date
    const missingKickOff = isEmptyField(row['Kick-Off Date']);
    
    // Has at least one Go-Live date
    const hasHospitalGoLive = !isEmptyField(row['Hospital Go-Live Date']);
    const hasOHGoLive = !isEmptyField(row['OH Go-Live Date']);
    
    return missingKickOff && (hasHospitalGoLive || hasOHGoLive);
  });
  
  // Testing date missing (one date exists but the other doesn't)
  const missingTestingDate = filteredData.filter(row => {
    // Check if Testing Start is present or missing
    const hasTestingStart = !isEmptyField(row['Testing Start']);
    
    // Check if Testing End is present or missing
    const hasTestingEnd = !isEmptyField(row['Testing End']);
    
    // We want cases where exactly one of the dates is missing
    return (hasTestingStart && !hasTestingEnd) || (!hasTestingStart && hasTestingEnd);
  });
  
  // Charter production irregularity
  const charterIrregularity = filteredData.filter(row => {
    return ['04 - In Progress', '05 - Post Go-Live', '06 - Complete'].includes(row['Project Status'] || '') &&
      (isEmptyField(row['Charter Status']) || 
      (row['Charter Status'] !== 'Signed' && row['Charter Status'] !== 'Not Required'));
  });
  
  return [
    {
      id: 'missingGoLive',
      title: 'Projects Without Go-Live Dates',
      description: 'Projects that have a Kick-off date but no Hospital or OH Go-live date',
      count: missingGoLive.length,
      data: missingGoLive,
      color: 'bg-red-100 text-red-800',
      iconColor: 'text-red-500'
    },
    {
      id: 'missingKickOff',
      title: 'Projects Without Kick-Off Date',
      description: 'Projects that have a Go-live date but missing Kick-off date',
      count: missingKickOff.length,
      data: missingKickOff,
      color: 'bg-purple-100 text-purple-800',
      iconColor: 'text-purple-500'
    },
    {
      id: 'missingTestingDate',
      title: 'Testing Date Missing',
      description: 'Projects with only one of Testing Start or Testing End date',
      count: missingTestingDate.length,
      data: missingTestingDate,
      color: 'bg-yellow-100 text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    {
      id: 'charterIrregularity',
      title: 'Charter Production Irregularity',
      description: 'Active or completed projects without Signed or Not Required charter status',
      count: charterIrregularity.length,
      data: charterIrregularity,
      color: 'bg-orange-100 text-orange-800',
      iconColor: 'text-orange-500'
    }
  ];
};

/**
 * Checks if a project's OH Go-Live date is confirmed
 */
export const isGoLiveDateConfirmed = (project: ProjectData): boolean => {
  if (!project) return false;

  const confirmedValue = project['OH Go-Live Date Confirmed'];
  
  if (typeof confirmedValue === 'boolean') {
    return confirmedValue;
  }
  
  if (typeof confirmedValue === 'string') {
    const normalizedValue = confirmedValue.trim().toLowerCase();
    return normalizedValue === 'true' || normalizedValue === 'yes' || normalizedValue === '1';
  }
  
  if (typeof confirmedValue === 'number') {
    return confirmedValue === 1;
  }
  
  return false;
};