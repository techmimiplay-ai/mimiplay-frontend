import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportChatHistory = {
  // Export chat sessions as CSV
  toCSV: (sessions, filename = 'chat-history') => {
    try {
      const headers = [
        'Date',
        'Student Name',
        'Session ID',
        'Total Questions',
        'Duration (minutes)',
        'Started At',
        'Ended At',
        'Questions & Answers'
      ];

      const rows = sessions.map(session => {
        const duration = calculateDuration(session.started_at, session.updated_at);
        const qaText = session.messages ? 
          session.messages.map((msg, idx) => 
            `Q${idx + 1}: ${msg.question || 'N/A'} | A${idx + 1}: ${msg.answer || 'N/A'}`
          ).join(' || ') : 'No messages';

        return [
          session.date || 'N/A',
          session.student_name || 'Unknown',
          session.session_id || 'N/A',
          session.total_messages || 0,
          duration,
          formatDateTime(session.started_at),
          formatDateTime(session.updated_at),
          qaText
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(cell => 
            typeof cell === 'string' && cell.includes(',') 
              ? `"${cell.replace(/"/g, '""')}"` 
              : cell
          ).join(',')
        )
      ].join('\n');

      downloadFile(csvContent, `${filename}.csv`, 'text/csv');
      return true;
    } catch (error) {
      console.error('CSV export error:', error);
      return false;
    }
  },

  // Export chat sessions as PDF
  toPDF: (sessions, filename = 'chat-history', options = {}) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Chat History Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Total Sessions: ${sessions.length}`, pageWidth / 2, 38, { align: 'center' });

      // Summary table
      const summaryData = [
        ['Total Sessions', sessions.length],
        ['Total Questions', sessions.reduce((sum, s) => sum + (s.total_messages || 0), 0)],
        ['Date Range', getDateRange(sessions)],
        ['Students Involved', getUniqueStudents(sessions).length]
      ];

      doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 }
      });

      // Sessions table
      const tableData = sessions.map(session => [
        session.date || 'N/A',
        session.student_name || 'Unknown',
        session.total_messages || 0,
        calculateDuration(session.started_at, session.updated_at),
        formatDateTime(session.started_at)
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Student', 'Questions', 'Duration', 'Started At']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 9 }
      });

      // Detailed conversations (if requested)
      if (options.includeConversations) {
        sessions.forEach((session, sessionIndex) => {
          if (session.messages && session.messages.length > 0) {
            doc.addPage();
            
            // Session header
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text(`Session ${sessionIndex + 1}: ${session.student_name}`, 20, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Date: ${session.date} | Questions: ${session.total_messages}`, 20, 30);

            // Messages
            let yPosition = 45;
            session.messages.forEach((msg, msgIndex) => {
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }

              // Question
              doc.setFontSize(10);
              doc.setTextColor(59, 130, 246);
              doc.text(`Q${msgIndex + 1}:`, 20, yPosition);
              
              doc.setTextColor(40, 40, 40);
              const questionLines = doc.splitTextToSize(msg.question || 'No question', 160);
              doc.text(questionLines, 35, yPosition);
              yPosition += questionLines.length * 5 + 3;

              // Answer
              doc.setTextColor(34, 197, 94);
              doc.text(`A${msgIndex + 1}:`, 20, yPosition);
              
              doc.setTextColor(40, 40, 40);
              const answerLines = doc.splitTextToSize(msg.answer || 'No answer', 160);
              doc.text(answerLines, 35, yPosition);
              yPosition += answerLines.length * 5 + 8;
            });
          }
        });
      }

      doc.save(`${filename}.pdf`);
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      return false;
    }
  },

  // Export detailed conversation as PDF
  toDetailedPDF: (session, filename = 'chat-session') => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(`Chat Session: ${session.student_name}`, pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${session.date}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Duration: ${calculateDuration(session.started_at, session.updated_at)}`, pageWidth / 2, 38, { align: 'center' });
      doc.text(`Total Questions: ${session.total_messages}`, pageWidth / 2, 46, { align: 'center' });

      // Conversation
      let yPosition = 60;
      
      if (session.messages && session.messages.length > 0) {
        session.messages.forEach((msg, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          // Question box
          doc.setFillColor(239, 246, 255);
          doc.rect(15, yPosition - 5, pageWidth - 30, 0, 'F');
          
          doc.setFontSize(10);
          doc.setTextColor(59, 130, 246);
          doc.text(`Question ${index + 1} (${msg.time || 'N/A'}):`, 20, yPosition);
          
          doc.setTextColor(40, 40, 40);
          const questionLines = doc.splitTextToSize(msg.question || 'No question recorded', pageWidth - 50);
          doc.text(questionLines, 20, yPosition + 8);
          yPosition += questionLines.length * 5 + 15;

          // Answer box
          doc.setFillColor(240, 253, 244);
          doc.rect(15, yPosition - 5, pageWidth - 30, 0, 'F');
          
          doc.setTextColor(34, 197, 94);
          doc.text('Alexi\'s Response:', 20, yPosition);
          
          doc.setTextColor(40, 40, 40);
          const answerLines = doc.splitTextToSize(msg.answer || 'No answer recorded', pageWidth - 50);
          doc.text(answerLines, 20, yPosition + 8);
          yPosition += answerLines.length * 5 + 20;
        });
      } else {
        doc.setTextColor(100, 100, 100);
        doc.text('No messages found in this session', pageWidth / 2, yPosition, { align: 'center' });
      }

      doc.save(`${filename}-${session.date}.pdf`);
      return true;
    } catch (error) {
      console.error('Detailed PDF export error:', error);
      return false;
    }
  }
};

// Helper functions
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A';
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  } catch {
    return 'N/A';
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

const getDateRange = (sessions) => {
  if (sessions.length === 0) return 'N/A';
  
  const dates = sessions
    .map(s => s.date)
    .filter(Boolean)
    .sort();
  
  if (dates.length === 0) return 'N/A';
  if (dates.length === 1) return dates[0];
  
  return `${dates[0]} to ${dates[dates.length - 1]}`;
};

const getUniqueStudents = (sessions) => {
  const students = new Set();
  sessions.forEach(session => {
    if (session.student_name) {
      students.add(session.student_name);
    }
  });
  return Array.from(students);
};