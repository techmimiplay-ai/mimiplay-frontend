// import React, { useState } from 'react';
// import { Button, Card } from '../../../components/shared';
// import { Download, TrendingUp, TrendingDown, BarChart3, Mail } from 'lucide-react';
// import { motion } from 'framer-motion';

// const ReportsTab = () => {
//   const [dateRange, setDateRange] = useState({
//     start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     end: new Date().toISOString().split('T')[0]
//   });

//   const [filterActivity, setFilterActivity] = useState('all');

//   const classStats = {
//     avgScore: 4.1,
//     totalActivities: 156,
//     totalStars: 1847,
//     avgAttendance: 94,
//     improvement: '+12%'
//   };

//   const topPerformers = [
//     { rank: 1, name: 'Priya Patel', score: 4.8, stars: 289, trend: 'up' },
//     { rank: 2, name: 'Rohan Kumar', score: 4.6, stars: 267, trend: 'up' },
//     { rank: 3, name: 'Sara Ali', score: 4.5, stars: 245, trend: 'stable' },
//   ];

//   const needsAttention = [
//     { name: 'Amit Verma', score: 3.2, subject: 'Phonics', improvement: 'needed' },
//     { name: 'Neha Sharma', score: 3.5, subject: 'Reading', improvement: 'needed' },
//   ];

//   const activityBreakdown = [
//     { activity: 'Alphabets', avgScore: 4.5, completed: 45, percentage: 95 },
//     { activity: 'Phonics', avgScore: 4.0, completed: 38, percentage: 80 },
//     { activity: 'Objects', avgScore: 4.2, completed: 42, percentage: 85 },
//     { activity: 'Colors', avgScore: 4.6, completed: 31, percentage: 92 },
//   ];

//   const weeklyProgress = [
//     { day: 'Mon', activities: 23, avgScore: 4.1 },
//     { day: 'Tue', activities: 28, avgScore: 4.3 },
//     { day: 'Wed', activities: 25, avgScore: 4.0 },
//     { day: 'Thu', activities: 31, avgScore: 4.4 },
//     { day: 'Fri', activities: 27, avgScore: 4.2 },
//   ];

//   const downloadReport = () => {
//     alert('Downloading PDF report... (Feature coming soon)');
//   };

//   const emailParents = () => {
//     alert('Sending reports to parents... (Feature coming soon)');
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold text-text mb-2">Reports & Analytics</h1>
//           <p className="text-text/60">Track class performance and progress</p>
//         </div>
//         <div className="flex gap-3">
//           <Button variant="outline" icon={Mail} onClick={emailParents}>
//             Email Parents
//           </Button>
//           <Button variant="primary" icon={Download} onClick={downloadReport}>
//             Download Report
//           </Button>
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <div className="grid grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-semibold text-text mb-2">Start Date</label>
//             <input
//               type="date"
//               value={dateRange.start}
//               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//               className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-text mb-2">End Date</label>
//             <input
//               type="date"
//               value={dateRange.end}
//               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//               className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-text mb-2">Activity Filter</label>
//             <select
//               value={filterActivity}
//               onChange={(e) => setFilterActivity(e.target.value)}
//               className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
//             >
//               <option value="all">All Activities</option>
//               <option value="alphabets">Alphabets</option>
//               <option value="phonics">Phonics</option>
//               <option value="objects">Objects</option>
//               <option value="colors">Colors</option>
//             </select>
//           </div>
//         </div>
//       </Card>

//       {/* Class Overview Stats */}
//       <div className="grid grid-cols-5 gap-4">
//         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
//           <div className="flex items-center gap-2 mb-2">
//             <BarChart3 size={20} className="text-purple-700" />
//             <p className="text-sm text-purple-700 font-semibold">Class Average</p>
//           </div>
//           <p className="text-4xl font-bold text-purple-900 mb-1">
//             ⭐ {classStats.avgScore}/5
//           </p>
//           <div className="flex items-center gap-1 text-green-600">
//             <TrendingUp size={14} />
//             <span className="text-xs font-semibold">{classStats.improvement}</span>
//           </div>
//         </Card>

//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//           <p className="text-sm text-blue-700 font-semibold mb-2">Total Activities</p>
//           <p className="text-4xl font-bold text-blue-900">{classStats.totalActivities}</p>
//           <p className="text-xs text-blue-700 mt-1">This period</p>
//         </Card>

//         <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//           <p className="text-sm text-yellow-700 font-semibold mb-2">Stars Earned</p>
//           <p className="text-4xl font-bold text-yellow-900">{classStats.totalStars}</p>
//           <p className="text-xs text-yellow-700 mt-1">Collective effort</p>
//         </Card>

//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//           <p className="text-sm text-green-700 font-semibold mb-2">Avg Attendance</p>
//           <p className="text-4xl font-bold text-green-900">{classStats.avgAttendance}%</p>
//           <p className="text-xs text-green-700 mt-1">Excellent!</p>
//         </Card>

//         <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
//           <p className="text-sm text-pink-700 font-semibold mb-2">Engagement</p>
//           <p className="text-4xl font-bold text-pink-900">High</p>
//           <p className="text-xs text-pink-700 mt-1">Keep it up!</p>
//         </Card>
//       </div>

//       {/* Charts Row */}
//       <div className="grid grid-cols-2 gap-6">
//         {/* Weekly Progress Chart */}
//         <Card>
//           <h2 className="text-xl font-bold text-text mb-4">Weekly Progress</h2>
//           <div className="space-y-3">
//             {weeklyProgress.map((day, index) => (
//               <motion.div
//                 key={day.day}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm font-semibold text-text">{day.day}</span>
//                   <span className="text-sm text-text/60">{day.activities} activities · {day.avgScore}/5 ⭐</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${(day.avgScore / 5) * 100}%` }}
//                     transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
//                     className={`h-full rounded-full ${
//                       day.avgScore >= 4.5 ? 'bg-green-500' :
//                       day.avgScore >= 4.0 ? 'bg-blue-500' :
//                       day.avgScore >= 3.5 ? 'bg-yellow-500' : 'bg-red-500'
//                     }`}
//                   />
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </Card>

//         {/* Activity Breakdown */}
//         <Card>
//           <h2 className="text-xl font-bold text-text mb-4">Activity Breakdown</h2>
//           <div className="space-y-4">
//             {activityBreakdown.map((item, index) => (
//               <motion.div
//                 key={item.activity}
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="bg-gray-50 rounded-2xl p-4"
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="font-semibold text-text">{item.activity}</h3>
//                   <span className="text-2xl">⭐ {item.avgScore}/5</span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm text-text/60 mb-2">
//                   <span>{item.completed} completed</span>
//                   <span>{item.percentage}% success rate</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${item.percentage}%` }}
//                     transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
//                     className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
//                   />
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </Card>
//       </div>

//       {/* Top Performers & Needs Attention */}
//       <div className="grid grid-cols-2 gap-6">
//         {/* Top Performers */}
//         <Card>
//           <div className="flex items-center gap-2 mb-4">
//             <div className="text-3xl">🏆</div>
//             <h2 className="text-xl font-bold text-text">Top Performers</h2>
//           </div>
//           <div className="space-y-3">
//             {topPerformers.map((student) => (
//               <div key={student.rank} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
//                 <div className="flex items-center gap-4">
//                   <div className={`
//                     w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl
//                     ${student.rank === 1 ? 'bg-yellow-500' :
//                       student.rank === 2 ? 'bg-gray-400' :
//                       'bg-orange-600'}
//                   `}>
//                     {student.rank}
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-text">{student.name}</h3>
//                     <p className="text-sm text-text/60">Score: {student.score}/5 · {student.stars} stars</p>
//                   </div>
//                 </div>
//                 <div className="text-2xl">
//                   {student.trend === 'up' ? '📈' : '➡️'}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Needs Attention */}
//         <Card>
//           <div className="flex items-center gap-2 mb-4">
//             <div className="text-3xl">⚠️</div>
//             <h2 className="text-xl font-bold text-text">Needs Attention</h2>
//           </div>
//           <div className="space-y-3">
//             {needsAttention.map((student, index) => (
//               <div key={index} className="p-4 bg-red-50 rounded-2xl border-2 border-red-100">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="font-semibold text-text">{student.name}</h3>
//                   <span className="text-2xl">⭐ {student.score}/5</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <p className="text-sm text-red-700">Struggling with: <strong>{student.subject}</strong></p>
//                   <Button size="sm" variant="outline">
//                     View Details
//                   </Button>
//                 </div>
//               </div>
//             ))}
//             {needsAttention.length === 0 && (
//               <div className="text-center py-8 text-text/60">
//                 <p className="text-2xl mb-2">🎉</p>
//                 <p>All students are doing great!</p>
//               </div>
//             )}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ReportsTab;


import React, { useState } from 'react';
import { Button, Card } from '../../../components/shared';
import { Download, TrendingUp, TrendingDown, BarChart3, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const ReportsTab = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [filterActivity, setFilterActivity] = useState('all');

  const classStats = {
    avgScore: 4.1,
    totalActivities: 156,
    totalStars: 1847,
    avgAttendance: 94,
    improvement: '+12%'
  };

  const topPerformers = [
    { rank: 1, name: 'Priya Patel', score: 4.8, stars: 289, trend: 'up' },
    { rank: 2, name: 'Rohan Kumar', score: 4.6, stars: 267, trend: 'up' },
    { rank: 3, name: 'Sara Ali', score: 4.5, stars: 245, trend: 'stable' },
  ];

  const needsAttention = [
    { name: 'Amit Verma', score: 3.2, subject: 'Phonics', improvement: 'needed' },
    { name: 'Neha Sharma', score: 3.5, subject: 'Reading', improvement: 'needed' },
  ];

  const activityBreakdown = [
    { activity: 'Alphabets', avgScore: 4.5, completed: 45, percentage: 95 },
    { activity: 'Phonics', avgScore: 4.0, completed: 38, percentage: 80 },
    { activity: 'Objects', avgScore: 4.2, completed: 42, percentage: 85 },
    { activity: 'Colors', avgScore: 4.6, completed: 31, percentage: 92 },
  ];

  const weeklyProgress = [
    { day: 'Mon', activities: 23, avgScore: 4.1 },
    { day: 'Tue', activities: 28, avgScore: 4.3 },
    { day: 'Wed', activities: 25, avgScore: 4.0 },
    { day: 'Thu', activities: 31, avgScore: 4.4 },
    { day: 'Fri', activities: 27, avgScore: 4.2 },
  ];

  const downloadReport = () => {
    alert('Downloading PDF report... (Feature coming soon)');
  };

  const emailParents = () => {
    alert('Sending reports to parents... (Feature coming soon)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-2">Reports & Analytics</h1>
          <p className="text-text/60">Track class performance and progress</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" icon={Mail} onClick={emailParents} className="w-full sm:w-auto">
            Email Parents
          </Button>
          <Button variant="primary" icon={Download} onClick={downloadReport} className="w-full sm:w-auto">
            Download Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-text mb-2">Activity Filter</label>
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
            >
              <option value="all">All Activities</option>
              <option value="alphabets">Alphabets</option>
              <option value="phonics">Phonics</option>
              <option value="objects">Objects</option>
              <option value="colors">Colors</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Class Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={20} className="text-purple-700" />
            <p className="text-sm text-purple-700 font-semibold">Class Average</p>
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-purple-900 mb-1">
            ⭐ {classStats.avgScore}/5
          </p>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp size={14} />
            <span className="text-xs font-semibold">{classStats.improvement}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 font-semibold mb-2">Total Activities</p>
          <p className="text-3xl lg:text-4xl font-bold text-blue-900">{classStats.totalActivities}</p>
          <p className="text-xs text-blue-700 mt-1">This period</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-yellow-700 font-semibold mb-2">Stars Earned</p>
          <p className="text-3xl lg:text-4xl font-bold text-yellow-900">{classStats.totalStars}</p>
          <p className="text-xs text-yellow-700 mt-1">Collective effort</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-700 font-semibold mb-2">Avg Attendance</p>
          <p className="text-3xl lg:text-4xl font-bold text-green-900">{classStats.avgAttendance}%</p>
          <p className="text-xs text-green-700 mt-1">Excellent!</p>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <p className="text-sm text-pink-700 font-semibold mb-2">Engagement</p>
          <p className="text-3xl lg:text-4xl font-bold text-pink-900">High</p>
          <p className="text-xs text-pink-700 mt-1">Keep it up!</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">Weekly Progress</h2>
          <div className="space-y-3">
            {weeklyProgress.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text">{day.day}</span>
                  <span className="text-xs sm:text-sm text-text/60">{day.activities} activities · {day.avgScore}/5 ⭐</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(day.avgScore / 5) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      day.avgScore >= 4.5 ? 'bg-green-500' :
                      day.avgScore >= 4.0 ? 'bg-blue-500' :
                      day.avgScore >= 3.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Activity Breakdown */}
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">Activity Breakdown</h2>
          <div className="space-y-4">
            {activityBreakdown.map((item, index) => (
              <motion.div
                key={item.activity}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text">{item.activity}</h3>
                  <span className="text-xl md:text-2xl">⭐ {item.avgScore}/5</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-text/60 mb-2">
                  <span>{item.completed} completed</span>
                  <span>{item.percentage}% success rate</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performers & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl md:text-3xl">🏆</div>
            <h2 className="text-xl font-bold text-text">Top Performers</h2>
          </div>
          <div className="space-y-3">
            {topPerformers.map((student) => (
              <div key={student.rank} className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white text-lg md:text-xl
                    ${student.rank === 1 ? 'bg-yellow-500' :
                      student.rank === 2 ? 'bg-gray-400' :
                      'bg-orange-600'}
                  `}>
                    {student.rank}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-text">{student.name}</h3>
                    <p className="text-xs md:text-sm text-text/60">Score: {student.score}/5 · {student.stars} stars</p>
                  </div>
                </div>
                <div className="text-xl md:text-2xl">
                  {student.trend === 'up' ? '📈' : '➡️'}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Needs Attention */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl md:text-3xl">⚠️</div>
            <h2 className="text-xl font-bold text-text">Needs Attention</h2>
          </div>
          <div className="space-y-3">
            {needsAttention.map((student, index) => (
              <div key={index} className="p-3 md:p-4 bg-red-50 rounded-2xl border-2 border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text">{student.name}</h3>
                  <span className="text-xl md:text-2xl">⭐ {student.score}/5</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs md:text-sm text-red-700">Struggling with: <strong>{student.subject}</strong></p>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {needsAttention.length === 0 && (
              <div className="text-center py-8 text-text/60">
                <p className="text-2xl mb-2">🎉</p>
                <p>All students are doing great!</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsTab;