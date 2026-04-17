import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/Card';

export default function PDFUploader({ onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (file) => {
        setError('');

        // Check if file exists
        if (!file) return;

        // Check file type
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            return;
        }

        setFile(file);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError('');

        try {
            // Call the upload complete callback (which will trigger Gemini extraction)
            await onUploadComplete(file);
        } catch (err) {
            setError(err.message || 'Failed to process PDF');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setError('');
    };

    return (
        <Card title="Upload Medical Report" subtitle="Upload a PDF of your latest medical test results">
            <div className="space-y-4">
                {/* Drop Zone */}
                <motion.div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.01 }}
                    className={`
            border-2 border-dashed rounded-lg p-8
            transition-smooth cursor-pointer
            ${isDragging ? 'border-primary bg-primary/10' : 'border-surface-light hover:border-primary/50'}
            ${file ? 'bg-primary/5' : ''}
          `}
                >
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="pdf-upload"
                    />

                    {!file ? (
                        <label htmlFor="pdf-upload" className="flex flex-col items-center gap-4 cursor-pointer">
                            <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div className="text-center">
                                <p className="text-white font-medium mb-1">
                                    Drop your PDF here or click to browse
                                </p>
                                <p className="text-sm text-gray-400">
                                    Maximum file size: 10MB
                                </p>
                            </div>
                        </label>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                    <p className="text-white font-medium">{file.name}</p>
                                    <p className="text-sm text-gray-400">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="text-red-400 hover:text-red-300 transition-smooth"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{error}</span>
                    </motion.div>
                )}

                {/* Upload Button */}
                {file && !isUploading && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleUpload}
                        className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold w-full hover:shadow-lg hover:shadow-primary/30 transition-smooth"
                    >
                        Extract Biomarkers
                    </motion.button>
                )}

                {/* Loading State */}
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-3 py-4"
                    >
                        <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-white">Processing PDF...</span>
                    </motion.div>
                )}
            </div>
        </Card>
    );
}
