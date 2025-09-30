import React from 'react'

const Dashboard = () => {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Video Projects</h3>
          <p className="text-gray-600">You have 0 video projects.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Analytics</h3>
          <p className="text-gray-600">Your videos have 0 views.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Account Status</h3>
          <p className="text-gray-600">You are on the free plan.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard