// Project data and filter types
export interface ProjectData {
  [key: string]: any;
  'Project Short Name'?: string;
  'Facility Name'?: string;
  'Project Status'?: string;
  'Project Type'?: string;
  'LOB'?: string;
  'OH Region'?: string;
  'OH Specialist(s)'?: string;
  'OH Project Lead'?: string;
  'Kick-Off Date'?: string;
  'Testing Start'?: string;
  'Testing End'?: string;
  'Hospital Go-Live Date'?: string;
  'OH Go-Live Date'?: string;
  'Charter Status'?: string;
}

export interface FilterOptions {
  regions: string[];
  projectTypes: string[];
  lobs: string[];
  statuses: string[];
}

export interface Filters {
  region: string[];
  projectType: string[];
  lob: string[];
  status: string[];
}

export interface DateRange {
  min: Date | null;
  max: Date | null;
}

export interface SelectedDateRange {
  start: Date | null;
  end: Date | null;
}

// Chart data types
export interface ChartDataItem {
  name: string;
  value: number;
}

export interface ResourceAllocationItem {
  name: string;
  count: number;
  [key: string]: number | string;
}

export interface DailyActivityItem {
  date: Date;
  dateString: string;
  activeProjects: number;
  activeTestingProjects: number;
}

export interface TimelineDetailProject extends ProjectData {
  timelineStatus: string;
}

// Data quality types
export interface DataQualityIssue {
  id: string;
  title: string;
  description: string;
  count: number;
  data: ProjectData[];
  color: string;
  iconColor: string;
}

// UI component types
export interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label: string;
}