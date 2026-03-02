'use client';

import { motion } from 'framer-motion';
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function EmployeesPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your team members</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </motion.div>
      <div className="stats-card text-center py-12">
        <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Management</h3>
        <p className="text-gray-600">Coming soon</p>
      </div>
    </div>
  );
}
