// import React, { useState, useEffect } from 'react';
// import { Card, Button, Input, Modal, Avatar } from '../../../components/shared';
// import { Search, Eye, Mail, Phone, User, CheckCircle, Plus, Pencil } from 'lucide-react';
// import { API_BASE_URL, getAuthHeaders } from '../../../config';

// const StudentManagement = () => {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [students, setStudents] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [showViewModal, setShowViewModal] = useState(false);

//     const [showAddModal, setShowAddModal] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [editData, setEditData] = useState(null);
//     const [parents, setParents] = useState([]);

//     const [formData, setFormData] = useState({
//         studentName: '',
//         studentClass: '',
//         parentName: '',
//         email: '',
//         phone: ''
//     });

//     const fetchStudents = async () => {
//         const res = await fetch(`${API_BASE_URL}/api/admin/all-students`, {
//             headers: getAuthHeaders()
//         });
//         const data = await res.json();

//         if (!Array.isArray(data)) {
//             console.error("Students fetch error:", data);
//             return;
//         }

//         const formatted = data.map(s => ({
//             id: s._id,
//             studentName: s.name,
//             studentClass: s.class,
//             parentName: s.parent_name || "N/A",
//             parentId: s.parent_id || "",
//             email: s.email || "-",
//             phone: s.phone || "-",
//             status: "active",
//             joinedDate: s.created_at
//                 ? new Date(s.created_at).toLocaleDateString()
//                 : "N/A",
//         }));

//         setStudents(formatted);
//     };

//     const fetchParents = async () => {
//         const res = await fetch(`${API_BASE_URL}/api/admin/all-users`, {
//             headers: getAuthHeaders()
//         });
//         const data = await res.json();

//         if (!Array.isArray(data)) {
//             console.error("Parents fetch error:", data);
//             return;
//         }

//         const onlyParents = data.filter(u => u.role === "parent");
//         setParents(onlyParents);
//     };

//     useEffect(() => {
//         fetchStudents();
//         fetchParents();
//     }, []);

//     const handleAddStudent = async () => {
//         const selectedParentObj = parents.find(p => p._id === formData.parentName);
//         try {
//             const response = await fetch(`${API_BASE_URL}/api/admin/add-student`, {
//                 method: "POST",
//                 headers: getAuthHeaders(),
//                 body: JSON.stringify({
//                     name: formData.studentName,
//                     class: formData.studentClass,
//                     parentName: selectedParentObj ? selectedParentObj.name : "",
//                     parent_id: formData.parentName,
//                     email: formData.email,
//                     phone: formData.phone
//                 })
//             });

//             if (response.ok) {
//                 alert("Student added ✅");
//                 fetchStudents();
//                 setShowAddModal(false);
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Server error");
//         }
//     };

//     const handleUpdateStudent = async () => {
//         const selectedParentObj = parents.find(p => p._id === editData.parentId || p.name === editData.parentName);
//         try {
//             const res = await fetch(`${API_BASE_URL}/api/admin/edit-student/${editData.id}`, {
//                 method: "PUT",
//                 headers: getAuthHeaders(),
//                 body: JSON.stringify({
//                     name: editData.studentName,
//                     class: editData.studentClass,
//                     parentName: selectedParentObj ? selectedParentObj.name : editData.parentName,
//                     parent_id: editData.parentId,
//                     email: editData.email,
//                     phone: editData.phone
//                 })
//             });

//             if (res.ok) {
//                 alert("Student updated ✅");
//                 fetchStudents();
//                 setShowEditModal(false);
//             } else {
//                 alert("Update failed ❌");
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Server error");
//         }
//     };

//     const handleParentChange = (e) => {
//         const parentId = e.target.value;
//         const selectedParent = parents.find(p => p._id === parentId);

//         if (selectedParent) {
//             setFormData({
//                 ...formData,
//                 parentName: parentId,
//                 email: selectedParent.email || '',
//                 phone: selectedParent.phone || ''
//             });
//         } else {
//             setFormData({ ...formData, parentName: '', email: '', phone: '' });
//         }
//     };

//     const filteredStudents = students.filter(student =>
//         student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         student.parentName.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     const stats = {
//         total: students.length,
//         active: students.filter(s => s.status === 'active').length,
//         pending: students.filter(s => s.status === 'pending').length,
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                 <div>
//                     <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">Student Management</h1>
//                     <p className="text-text/60">View and manage students</p>
//                 </div>
//                 <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
//                     Add Student
//                 </Button>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//                     <p className="text-sm text-blue-700 mb-1">Total Students</p>
//                     <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
//                 </Card>
//                 <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//                     <p className="text-sm text-green-700 mb-1">Active</p>
//                     <p className="text-3xl font-bold text-green-900">{stats.active}</p>
//                 </Card>
//                 <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//                     <p className="text-sm text-yellow-700 mb-1">Pending</p>
//                     <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
//                 </Card>
//             </div>

//             {/* Search */}
//             <Card>
//                 <Input
//                     placeholder="Search by student or parent..."
//                     icon={Search}
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//             </Card>

//             {/* Table */}
//             <Card>
//                 <div className="overflow-x-auto w-full">
//                     <table className="w-full min-w-[600px]">
//                         <thead>
//                             <tr className="border-b border-gray-200">
//                                 <th className="text-left py-4 px-4 font-semibold">Student</th>
//                                 <th className="text-left py-4 px-4 font-semibold hidden sm:table-cell">Parent</th>
//                                 <th className="text-left py-4 px-4 font-semibold hidden md:table-cell">Contact</th>
//                                 <th className="text-left py-4 px-4 font-semibold hidden sm:table-cell">Class</th>
//                                 <th className="text-left py-4 px-4 font-semibold">Status</th>
//                                 <th className="text-right py-4 px-4 font-semibold">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filteredStudents.map(student => (
//                                 <tr key={student.id} className="border-b hover:bg-gray-50">
//                                     <td className="py-4 px-4">
//                                         <div className="flex items-center gap-3">
//                                             <Avatar />
//                                             <div>
//                                                 <p className="font-semibold">{student.studentName}</p>
//                                                 <p className="text-sm text-text/60">Joined: {student.joinedDate}</p>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="py-4 px-4 hidden sm:table-cell">{student.parentName}</td>
//                                     <td className="py-4 px-4 hidden md:table-cell">
//                                         <div className="text-sm">
//                                             <p className="flex items-center gap-1">
//                                                 <Mail size={14} className="shrink-0" />
//                                                 <span className="truncate max-w-[120px]">{student.email}</span>
//                                             </p>
//                                             <p className="flex items-center gap-1">
//                                                 <Phone size={14} className="shrink-0" /> {student.phone}
//                                             </p>
//                                         </div>
//                                     </td>
//                                     <td className="py-4 px-4 hidden sm:table-cell">{student.studentClass}</td>
//                                     <td className="py-4 px-4">
//                                         <span className={`
//                                             px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1
//                                             ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
//                                         `}>
//                                             <CheckCircle size={12} />
//                                             {student.status}
//                                         </span>
//                                     </td>
//                                     <td className="py-4 px-4 text-right space-x-2">
//                                         <button
//                                             onClick={() => { setEditData(student); setShowEditModal(true); }}
//                                             className="p-2 hover:bg-indigo-50 rounded-lg">
//                                             <Pencil size={16} className="text-indigo-600" />
//                                         </button>
//                                         <button
//                                             onClick={() => { setSelectedStudent(student); setShowViewModal(true); }}
//                                             className="p-2 hover:bg-blue-50 rounded-lg">
//                                             <Eye size={18} className="text-blue-600" />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             {/* Add Modal */}
//             {showAddModal && (
//                 <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student" size="md">
//                     <div className="space-y-4">
//                         <Input label="Student Name" icon={User} value={formData.studentName}
//                             onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} />
//                         <Input label="Class" placeholder="e.g. UKG-A" value={formData.studentClass}
//                             onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })} />
//                         <div className="space-y-2">
//                             <label className="text-sm font-medium text-gray-700">Parent</label>
//                             <div className="relative">
//                                 <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
//                                 <select
//                                     className="w-full border rounded-full py-3 pl-12 pr-4 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                                     value={formData.parentName}
//                                     onChange={handleParentChange}>
//                                     <option value="">Select Parent</option>
//                                     {parents.map((p) => (
//                                         <option key={p._id} value={p._id}>{p.name}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>
//                         <Input label="Email" icon={Mail} value={formData.email}
//                             onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
//                         <Input label="Phone" icon={Phone} value={formData.phone}
//                             onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
//                         <div className="flex gap-3 mt-6">
//                             <Button variant="primary" className="flex-1" onClick={handleAddStudent}>Add Student</Button>
//                             <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
//                         </div>
//                     </div>
//                 </Modal>
//             )}

//             {/* Edit Modal */}
//             {editData && (
//                 <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Student" size="md">
//                     <div className="space-y-4">
//                         <Input label="Student Name" value={editData.studentName}
//                             onChange={(e) => setEditData({ ...editData, studentName: e.target.value })} />
//                         <Input label="Class" value={editData.studentClass}
//                             onChange={(e) => setEditData({ ...editData, studentClass: e.target.value })} />
//                         <select
//                             className="w-full border rounded-lg p-2"
//                             value={editData.parentId || ""}
//                             onChange={(e) => setEditData({ ...editData, parentId: e.target.value })}>
//                             <option value="">Select Parent</option>
//                             {parents.map(p => (
//                                 <option key={p._id} value={p._id}>{p.name}</option>
//                             ))}
//                         </select>
//                         <Input label="Email" value={editData.email}
//                             onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
//                         <Input label="Phone" value={editData.phone}
//                             onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
//                         <div className="flex gap-3 mt-6">
//                             <Button variant="primary" className="flex-1" onClick={handleUpdateStudent}>Save Changes</Button>
//                             <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
//                         </div>
//                     </div>
//                 </Modal>
//             )}

//             {/* View Modal */}
//             {selectedStudent && (
//                 <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Student Details">
//                     <div className="space-y-3">
//                         <p><b>Student:</b> {selectedStudent.studentName}</p>
//                         <p><b>Class:</b> {selectedStudent.studentClass}</p>
//                         <p><b>Parent:</b> {selectedStudent.parentName}</p>
//                         <p><b>Email:</b> {selectedStudent.email}</p>
//                         <p><b>Phone:</b> {selectedStudent.phone}</p>
//                     </div>
//                 </Modal>
//             )}
//         </div>
//     );
// };

// export default StudentManagement;


import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Modal, Avatar } from '../../../components/shared';
import { Search, Eye, Mail, Phone, User, CheckCircle, Plus, Pencil, Upload, Camera, X, Loader } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders, API_ENDPOINTS } from '../../../config';

const StudentManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [parents, setParents] = useState([]);

    // Photo state
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(''); // '', 'adding', 'registering_face', 'done', 'error'
    const fileInputRef = useRef(null);
    const [editPhotoFile, setEditPhotoFile] = useState(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const editFileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        studentName: '',
        studentClass: '',
        parentName: '',
        email: '',
        phone: '',
        rollNumber: ''
    });

    const fetchStudents = async () => {
        const res = await fetch(`${API_BASE_URL}/api/admin/all-students`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();

        if (!Array.isArray(data)) {
            console.error("Students fetch error:", data);
            return;
        }

        const formatted = data.map(s => ({
            id: s._id,
            studentName: s.name,
            studentClass: s.class,
            parentName: s.parent_name || "N/A",
            parentId: s.parent_id || "",
            email: s.email || "-",
            phone: s.phone || "-",
            rollNumber: s.roll_number || "-",
            faceRegistered: s.face_registered || false,
            status: "active",
            joinedDate: s.created_at
                ? new Date(s.created_at).toLocaleDateString()
                : "N/A",
        }));

        setStudents(formatted);
    };

    const fetchParents = async () => {
        const res = await fetch(`${API_BASE_URL}/api/admin/all-users`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();

        if (!Array.isArray(data)) {
            console.error("Parents fetch error:", data);
            return;
        }

        const onlyParents = data.filter(u => u.role === "parent");
        setParents(onlyParents);
    };

    useEffect(() => {
        fetchStudents();
        fetchParents();
    }, []);

    // ─── Photo file select handler ───────────────────────────────────────────
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPG, PNG, etc.)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setPhotoFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Edit Modal Photo Handler ─────────────────────────────────────────────
    const handleEditPhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPG, PNG, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }
        setEditPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setEditPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveEditPhoto = () => {
        setEditPhotoFile(null);
        setEditPhotoPreview(null);
        if (editFileInputRef.current) editFileInputRef.current.value = '';
    };
    // ─── Convert image file to base64 ────────────────────────────────────────
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // includes data:image/...;base64,
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // ─── Main Add Student handler ─────────────────────────────────────────────
    const handleAddStudent = async () => {
        if (!formData.studentName.trim()) {
            alert('Student name is required');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('adding');

        try {
            const selectedParentObj = parents.find(p => p._id === formData.parentName);

            // STEP 1: Add student to DB
            const response = await fetch(`${API_BASE_URL}/api/admin/add-student`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: formData.studentName,
                    class: formData.studentClass,
                    parentName: selectedParentObj ? selectedParentObj.name : "",
                    parent_id: formData.parentName,
                    email: formData.email,
                    phone: formData.phone,
                    rollNumber: formData.rollNumber
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.msg || `Server error: ${response.status}`);
            }

            // STEP 2: Register face in MongoDB GridFS (only if photo selected)
            if (photoFile) {
                setSubmitStatus('registering_face');

                const base64Image = await fileToBase64(photoFile);

                const faceResponse = await fetch(API_ENDPOINTS.REGISTER_FACE, {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        name: formData.studentName,
                        image: base64Image
                    })
                });

                const faceResult = await faceResponse.json();

                if (faceResult.status === 'error') {
                    // Student add hua but face failed - warn user
                    setSubmitStatus('done');
                    await fetchStudents();
                    resetAddForm();
                    alert(`✅ Student added successfully!\n\n⚠️ Face registration failed: ${faceResult.message}\n\nYou can re-register the face later.`);
                    return;
                }
            }

            setSubmitStatus('done');
            await fetchStudents();
            resetAddForm();

            if (photoFile) {
                alert("✅ Student added and face registered successfully!");
            } else {
                alert("✅ Student added successfully!\n\nNote: No photo added — face recognition won't work for this student.");
            }

        } catch (err) {
            console.error(err);
            setSubmitStatus('error');
            alert(`❌ Could not add student: ${err.message}`);
        } finally {
            setIsSubmitting(false);
            setSubmitStatus('');
        }
    };

    const resetAddForm = () => {
        setFormData({ studentName: '', studentClass: '', parentName: '', email: '', phone: '', rollNumber: '' });
        setPhotoFile(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowAddModal(false);
    };

    // ─── Update student handler ───────────────────────────────────────────────
    // const handleUpdateStudent = async () => {
    //     const selectedParentObj = parents.find(p => p._id === editData.parentId || p.name === editData.parentName);
    //     try {
    //         const res = await fetch(`${API_BASE_URL}/api/admin/edit-student/${editData.id}`, {
    //             method: "PUT",
    //             headers: getAuthHeaders(),
    //             body: JSON.stringify({
    //                 name: editData.studentName,
    //                 class: editData.studentClass,
    //                 parentName: selectedParentObj ? selectedParentObj.name : editData.parentName,
    //                 parent_id: editData.parentId,
    //                 email: editData.email,
    //                 phone: editData.phone
    //             })
    //         });

    //         if (res.ok) {
    //             alert("Student updated ✅");
    //             fetchStudents();
    //             setShowEditModal(false);
    //         } else {
    //             alert("Update failed ❌");
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         alert("Server error");
    //     }
    // };

    // ─── Update student handler (with face registration) ──────────────────────
    const handleUpdateStudent = async () => {
        const selectedParentObj = parents.find(p => p._id === editData.parentId || p.name === editData.parentName);
        setIsEditSubmitting(true);
        try {
            // STEP 1: Student info update karo
            const res = await fetch(`${API_BASE_URL}/api/admin/edit-student/${editData.id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: editData.studentName,
                    class: editData.studentClass,
                    parentName: selectedParentObj ? selectedParentObj.name : editData.parentName,
                    parent_id: editData.parentId,
                    email: editData.email,
                    phone: editData.phone
                })
            });

            if (!res.ok) {
                alert("Update failed ❌");
                return;
            }

            // STEP 2: Agar naya photo select hua hai toh face register karo
            if (editPhotoFile) {
                const base64Image = await fileToBase64(editPhotoFile);
                const faceResponse = await fetch(API_ENDPOINTS.REGISTER_FACE, {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        name: editData.studentName,
                        image: base64Image
                    })
                });
                const faceResult = await faceResponse.json();
                if (faceResult.status === 'error') {
                    alert(`✅ Student updated!\n\n⚠️ Face registration failed: ${faceResult.message}`);
                } else {
                    alert("✅ Student updated and face registered successfully!");
                }
            } else {
                alert("✅ Student updated successfully!");
            }

            fetchStudents();
            setShowEditModal(false);
            setEditPhotoFile(null);
            setEditPhotoPreview(null);

        } catch (err) {
            console.error(err);
            alert("Server error");
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const handleParentChange = (e) => {
        const parentId = e.target.value;
        const selectedParent = parents.find(p => p._id === parentId);

        if (selectedParent) {
            setFormData({
                ...formData,
                parentName: parentId,
                email: selectedParent.email || '',
                phone: selectedParent.phone || ''
            });
        } else {
            setFormData({ ...formData, parentName: '', email: '', phone: '' });
        }
    };

    const filteredStudents = students.filter(student =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
        faceRegistered: students.filter(s => s.faceRegistered).length,
    };

    // ─── Status message for submit button ────────────────────────────────────
    const getSubmitLabel = () => {
        if (submitStatus === 'adding') return 'Adding Student...';
        if (submitStatus === 'registering_face') return 'Registering Face...';
        return 'Add Student';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">Student Management</h1>
                    <p className="text-text/60">View and manage students</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                    Add Student
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <p className="text-sm text-green-700 mb-1">Active</p>
                    <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <p className="text-sm text-purple-700 mb-1">Face Registered</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.faceRegistered}</p>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <Input
                    placeholder="Search by student or parent..."
                    icon={Search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-4 px-4 font-semibold">Student</th>
                                <th className="text-left py-4 px-4 font-semibold hidden sm:table-cell">Parent</th>
                                <th className="text-left py-4 px-4 font-semibold hidden md:table-cell">Contact</th>
                                <th className="text-left py-4 px-4 font-semibold hidden sm:table-cell">Class</th>
                                <th className="text-left py-4 px-4 font-semibold">Face</th>
                                <th className="text-right py-4 px-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar />
                                            <div>
                                                <p className="font-semibold">{student.studentName}</p>
                                                <p className="text-sm text-text/60">Joined: {student.joinedDate}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 hidden sm:table-cell">{student.parentName}</td>
                                    <td className="py-4 px-4 hidden md:table-cell">
                                        <div className="text-sm">
                                            <p className="flex items-center gap-1">
                                                <Mail size={14} className="shrink-0" />
                                                <span className="truncate max-w-[120px]">{student.email}</span>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Phone size={14} className="shrink-0" /> {student.phone}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 hidden sm:table-cell">{student.studentClass}</td>
                                    <td className="py-4 px-4">
                                        {student.faceRegistered ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                                <CheckCircle size={12} /> Registered
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 flex items-center gap-1 w-fit">
                                                <Camera size={12} /> Not set
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right space-x-2">
                                        <button
                                            onClick={() => { setEditData(student); setShowEditModal(true); }}
                                            className="p-2 hover:bg-indigo-50 rounded-lg">
                                            <Pencil size={16} className="text-indigo-600" />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedStudent(student); setShowViewModal(true); }}
                                            className="p-2 hover:bg-blue-50 rounded-lg">
                                            <Eye size={18} className="text-blue-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ── ADD STUDENT MODAL ───────────────────────────────────────────── */}
            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => !isSubmitting && resetAddForm()} title="Add New Student" size="md">
                    <div className="space-y-4">
                        <Input label="Student Name *" icon={User} value={formData.studentName}
                            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} />

                        <Input label="Class" placeholder="e.g. UKG-A" value={formData.studentClass}
                            onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })} />

                        <Input label="Roll Number" placeholder="e.g. 12" value={formData.rollNumber}
                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Parent</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <select
                                    className="w-full border rounded-full py-3 pl-12 pr-4 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={formData.parentName}
                                    onChange={handleParentChange}>
                                    <option value="">Select Parent</option>
                                    {parents.map((p) => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Input label="Parent Phone" icon={Phone} value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

                        <Input label="Email" icon={Mail} value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                        {/* ── PHOTO UPLOAD SECTION ── */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Camera size={16} className="text-gray-500" />
                                Student Photo
                                <span className="text-xs text-gray-400">(Required for face recognition)</span>
                            </label>

                            {!photoPreview ? (
                                // Upload button
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                    <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 font-medium">Click to upload photo</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG — Max 5MB</p>
                                </div>
                            ) : (
                                // Preview
                                <div className="relative border-2 border-green-300 rounded-xl overflow-hidden bg-green-50">
                                    <img
                                        src={photoPreview}
                                        alt="Student preview"
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{photoFile?.name}</p>
                                                <p className="text-xs text-gray-400">{(photoFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemovePhoto}
                                            className="p-1 hover:bg-red-100 rounded-full">
                                            <X size={18} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoSelect}
                            />
                        </div>

                        {/* Status message while submitting */}
                        {isSubmitting && (
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                                <Loader size={18} className="text-blue-600 animate-spin" />
                                <div>
                                    <p className="text-sm font-medium text-blue-700">{getSubmitLabel()}</p>
                                    <p className="text-xs text-blue-500">
                                        {submitStatus === 'adding' && 'Saving student info to database...'}
                                        {submitStatus === 'registering_face' && 'Processing face and saving to MongoDB...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleAddStudent}
                                disabled={isSubmitting}>
                                {isSubmitting ? getSubmitLabel() : 'Add Student'}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={resetAddForm}
                                disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {editData && (
                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Student" size="md">
                    <div className="space-y-4">
                        <Input label="Student Name" value={editData.studentName}
                            onChange={(e) => setEditData({ ...editData, studentName: e.target.value })} />
                        <Input label="Class" value={editData.studentClass}
                            onChange={(e) => setEditData({ ...editData, studentClass: e.target.value })} />
                        <select
                            className="w-full border rounded-lg p-2"
                            value={editData.parentId || ""}
                            onChange={(e) => setEditData({ ...editData, parentId: e.target.value })}>
                            <option value="">Select Parent</option>
                            {parents.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                        <Input label="Email" value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                        <Input label="Phone" value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />

                        {/* ── FACE PHOTO UPDATE SECTION ── */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Camera size={16} className="text-gray-500" />
                                Update Face Photo
                                {editData.faceRegistered
                                    ? <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✅ Already registered</span>
                                    : <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">⚠️ Not set</span>
                                }
                            </label>

                            {!editPhotoPreview ? (
                                <div
                                    onClick={() => editFileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                    <Upload size={24} className="mx-auto text-gray-400 mb-1" />
                                    <p className="text-sm text-gray-600 font-medium">
                                        {editData.faceRegistered ? 'Click to update photo' : 'Click to upload photo'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG — Max 5MB</p>
                                </div>
                            ) : (
                                <div className="relative border rounded-xl p-3 bg-gray-50">
                                    <img src={editPhotoPreview} alt="preview"
                                        className="w-24 h-24 object-cover rounded-lg mx-auto" />
                                    <button
                                        onClick={handleRemoveEditPhoto}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                        <X size={14} />
                                    </button>
                                    <p className="text-xs text-center text-gray-500 mt-2">{editPhotoFile?.name}</p>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={editFileInputRef}
                                onChange={handleEditPhotoSelect}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="primary" className="flex-1" onClick={handleUpdateStudent}>Save Changes</Button>
                            <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* View Modal */}
            {selectedStudent && (
                <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Student Details">
                    <div className="space-y-3">
                        <p><b>Student:</b> {selectedStudent.studentName}</p>
                        <p><b>Class:</b> {selectedStudent.studentClass}</p>
                        <p><b>Parent:</b> {selectedStudent.parentName}</p>
                        <p><b>Email:</b> {selectedStudent.email}</p>
                        <p><b>Phone:</b> {selectedStudent.phone}</p>
                        <p><b>Face Recognition:</b>{' '}
                            {selectedStudent.faceRegistered
                                ? <span className="text-green-600 font-semibold">✅ Registered</span>
                                : <span className="text-gray-400">❌ Not registered</span>
                            }
                        </p>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default StudentManagement;
