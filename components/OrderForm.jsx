// Filename: components/OrderForm.jsx

'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

const costs = {
    paperSize: { 'A4': 0.10, 'A3': 0.20 },
    color: { 'bw': 0.05, 'color': 0.25 }
};

export default function OrderForm() {
    // --- MODIFIED STATE: Use an array for files ---
    const [files, setFiles] = useState([]); 
    const [options, setOptions] = useState({
        quantity: 1,
        paperSize: 'A4',
        color: 'bw',
    });
    const [totalCost, setTotalCost] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Please select one or more files to begin.');

    // --- MODIFIED COST CALCULATION: Cost is per file ---
    useEffect(() => {
        if (files.length === 0) {
            setTotalCost(0);
            return;
        }
        const costPerFile = costs.paperSize[options.paperSize] + costs.color[options.color];
        const total = costPerFile * options.quantity * files.length;
        setTotalCost(total);
    }, [files, options]);

    // --- MODIFIED FILE HANDLER: Process multiple files ---
    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setStatusMessage('Processing files...');
        
        const processedFiles = await Promise.all(
            selectedFiles.map(async (file) => {
                if (file.type.startsWith('image/')) {
                    try {
                        const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
                        return await imageCompression(file, compressionOptions);
                    } catch (error) {
                        console.error("Compression error:", error);
                        return file; // Fallback to original file
                    }
                }
                return file;
            })
        );
        
        setFiles(processedFiles);
        setStatusMessage(`${processedFiles.length} file(s) are ready.`);
    };

    const handleOptionChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'quantity' ? (parseInt(value, 10) || 1) : value;
        setOptions(prev => ({ ...prev, [name]: newValue }));
    };

    // --- MODIFIED SUBMIT HANDLER: Send multiple files ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            setStatusMessage('Please select files before submitting.');
            return;
        }
        
        setIsUploading(true);
        setStatusMessage(`Submitting ${files.length} order(s)...`);

        const formData = new FormData();
        files.forEach((file) => {
            // Append each file with the same key name, using `[]` to denote an array
            formData.append('files', file); 
        });
        formData.append('options', JSON.stringify(options));
        formData.append('totalCost', totalCost);

        try {
            const response = await fetch('/api/create-order', { method: 'POST', body: formData });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong.');
            }