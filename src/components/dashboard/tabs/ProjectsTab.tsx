import React from 'react';
import { ProjectData } from '../../../types';

interface ProjectsTabProps {
  filteredData: ProjectData[];
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ filteredData }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Project List</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOB</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialist</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kick-Off</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Go-Live</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OH Go-Live</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.slice(0, 50).map((project, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-2 px-4 text-sm">{project['Project Short Name']}</td>
                <td className="py-2 px-4 text-sm">{project['Facility Name']}</td>
                <td className="py-2 px-4 text-sm">{project['Project Status']}</td>
                <td className="py-2 px-4 text-sm">{project['Project Type']}</td>
                <td className="py-2 px-4 text-sm">{project['LOB']}</td>
                <td className="py-2 px-4 text-sm">{project['OH Region']}</td>
                <td className="py-2 px-4 text-sm">{project['OH Specialist(s)']}</td>
                <td className="py-2 px-4 text-sm">{project['Kick-Off Date']}</td>
                <td className="py-2 px-4 text-sm">
                  {project['Hospital Go-Live Date'] || <span className="text-gray-400">Not Set</span>}
                </td>
                <td className="py-2 px-4 text-sm">
                  {project['OH Go-Live Date'] || <span className="text-gray-400">Not Set</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length > 50 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Showing 50 of {filteredData.length} projects. Use filters to narrow down results.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsTab;