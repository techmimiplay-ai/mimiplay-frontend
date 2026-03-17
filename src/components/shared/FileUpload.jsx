import React, { useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const FileUpload = ({ onFileSelect, accept = 'image/*', label = 'Upload File' }) => {
  const [file, setFile] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileSelect(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {!file ? (
        <motion.div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          whileHover={{ scale: 1.02 }}
          className="border-3 border-dashed border-primary-300 rounded-xl p-6 cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-colors text-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={32} className="mx-auto mb-2 text-primary-600" />
          <p className="font-semibold text-text">{label}</p>
          <p className="text-sm text-text/60">or drag and drop</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border-2 border-green-300 rounded-xl p-4"
        >
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          <div className="flex items-center gap-3">
            <Check size={24} className="text-green-600" />
            <div className="flex-1">
              <p className="font-semibold text-text text-sm">{file.name}</p>
              <p className="text-xs text-text/60">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={clearFile}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-red-600" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
