import { CloudUpload, File, X } from 'lucide-react';
import React, { useRef, useState } from 'react'

const DownloadButton = ({newDocFile, setNewDocFile}) => {

    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
        const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
          setDragActive(true);
        } else if (e.type === "dragleave") {
          setDragActive(false);
        }
      };
    
      const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          setNewDocFile(e.dataTransfer.files[0]);
        }
      };
    
      const handleButtonClick = () => {
        fileInputRef.current?.click();
      };
    
      const handleRemoveFile = () => {
        setNewDocFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
  return (
    <div
        className={`border-2 border-dashed rounded-lg text-center transition-colors
                    ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-blue-400 bg-white'
                  }`
                  }
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Check file size (max 10MB)
                                if (file.size > 10 * 1024 * 1024) {
                                  alert("File size must be less than 10MB");
                                  e.target.value = '';
                                  return;
                                }
                                setNewDocFile(file);
                              } else {
                                setNewDocFile(null);
                              }
                            }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                  />
    
                  {!newDocFile ? (
                    <div className="flex items-center justify-center p-3 gap-2">
                      <CloudUpload className="w-6 h-6 text-gray-400" />
                      <button
                        type="button"
                        onClick={handleButtonClick}
                        className="hover:text-blue-700 font-medium text-gray-400"
                      >
                        Choose or upload from local storage
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <File className="w-8 h-8 text-blue-600" />
                      <span className="text-gray-700 font-medium">{newDocFile.name}</span>
                      <span className="text-gray-500 text-sm">
                        ({(newDocFile.size / 1024).toFixed(2)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  )}
                          </div>
  )
}

export default DownloadButton