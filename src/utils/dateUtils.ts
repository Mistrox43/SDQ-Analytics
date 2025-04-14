/**
 * Creates a Date object safely from a string, returning null if invalid
 */
export const safeDate = (dateString: string | null | undefined): Date | null => {
  try {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
};

/**
 * Checks if a project is active on a given date
 */
export const isProjectActive = (project: any, date: Date): boolean => {
  if (!project || !date) return false;
  
  const kickOffDate = safeDate(project['Kick-Off Date']);
  const hospitalGoLiveDate = safeDate(project['Hospital Go-Live Date']);
  const ohGoLiveDate = safeDate(project['OH Go-Live Date']);
  
  // If we don't have a kick-off date, we can't determine if it's active
  if (!kickOffDate) return false;
  
  // Determine the end date (the later of Hospital Go-Live or OH Go-Live)
  let endDate = null;
  if (hospitalGoLiveDate && ohGoLiveDate) {
    endDate = hospitalGoLiveDate > ohGoLiveDate ? hospitalGoLiveDate : ohGoLiveDate;
  } else if (hospitalGoLiveDate) {
    endDate = hospitalGoLiveDate;
  } else if (ohGoLiveDate) {
    endDate = ohGoLiveDate;
  }
  
  // If we don't have an end date, assume it's still active if kick-off is in the past
  if (!endDate) {
    return kickOffDate <= date;
  }
  
  // Check if date is between kick-off and end date
  return kickOffDate <= date && date <= endDate;
};

/**
 * Checks if a project is in testing on a given date
 */
export const isProjectInTesting = (project: any, date: Date): boolean => {
  if (!project || !date) return false;
  
  const testingStart = safeDate(project['Testing Start']);
  const testingEnd = safeDate(project['Testing End']);
  
  if (!testingStart || !testingEnd) return false;
  
  return testingStart <= date && date <= testingEnd;
};

/**
 * Helper function for checking if a field is empty
 */
export const isEmptyField = (field: any): boolean => {
  if (!field) return true;
  const str = String(field).trim();
  return str === '' || str === 'null' || str === 'undefined' || str === 'N/A';
};