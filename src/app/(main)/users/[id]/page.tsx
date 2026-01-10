"use client";

import { Eye, Plus, Search, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
}

interface HistoryItem {
  date: string;
  request?: string;
  payment?: string;
  status: string;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

const PatientManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: ''
  });

  const prescriptionHistory: HistoryItem[] = [
    { date: '08/15/2025', request: 'Prescription Request #12345', status: 'Completed' },
    { date: '08/15/2025', request: 'Prescription Request #12345', status: 'Pending' },
    { date: '08/15/2025', request: 'Prescription Request #12345', status: 'Completed' }
  ];

  const paymentHistory: HistoryItem[] = [
    { date: '08/15/2025', payment: 'Payment #98765', status: 'Completed' },
    { date: '08/15/2025', payment: 'Prescription Request #12345', status: 'Failed' },
    { date: '08/15/2025', payment: 'Prescription Request #12345', status: 'Refunded' }
  ];

  const allPatients: Patient[] = [
    { id: '#R78578', name: 'Jane Cooper', phone: '(406) 555-0120', email: 'deanne.curtis@example.com', status: 'Active' },
    { id: '#R78578', name: 'Jane Cooper', phone: '(406) 555-0120', email: 'deanne.curtis@example.com', status: 'Inactive' },
    { id: '#R78578', name: 'Jane Cooper', phone: '(406) 555-0120', email: 'deanne.curtis@example.com', status: 'Active' },
    { id: '#R78578', name: 'Jane Cooper', phone: '(406) 555-0120', email: 'deanne.curtis@example.com', status: 'Active' },
    { id: '#R78578', name: 'Jane Cooper', phone: '(406) 555-0120', email: 'deanne.curtis@example.com', status: 'Inactive' },
    { id: '#R78578', name: 'Jane Cooper', phone: '(406) 555-0120', email: 'deanne.curtis@example.com', status: 'Active' }
  ];

  const openModal = (): void => {
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'example@demo.com',
      phone: '01287456887698',
      gender: 'Male',
      dob: '20/08/1988'
    });
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  const handleSubmit = (): void => {
    console.log('Form submitted:', formData);
    closeModal();
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Patient Profile Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <Image
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
              alt="Profile"
              width={1000}
              height={1000}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">First Name</p>
                <p className="text-base font-medium text-gray-900">John</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Name</p>
                <p className="text-base font-medium text-gray-900">Doe</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                <p className="text-base font-medium text-gray-900">Male</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="text-base font-medium text-gray-900">demo@demogmail.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="text-base font-medium text-gray-900">706-455-5214</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">DOB</p>
                <p className="text-base font-medium text-gray-900">12/07/2025</p>
              </div>
            </div>
          </div>
          <Button
            onClick={openModal}
            className=" text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Prescription History */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Prescription History</h2>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Request</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {prescriptionHistory.map((item, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-900">{item.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{item.request}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((item, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-900">{item.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{item.payment}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Patients Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Patients</h2>
          <Button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} />
            Add New
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Type Something"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Status: All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPatients.map((patient, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-900">{patient.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{patient.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{patient.phone}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{patient.email}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye size={18} className="text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Trash2 size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">Showing 1 to 10 of 10 entries</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
              Prev
            </button>
            <button className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded">01</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">02</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">03</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">04</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">05</button>
            <span className="px-2 text-gray-600">...</span>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">24</button>
          </div>
        </div>
      </div>

      {/* Modal with smooth animation */}
      {isModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/40 bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Patient info</h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">Enter the details below to add a new user to the system.</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="text"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default PatientManagement;