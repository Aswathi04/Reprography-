// Filename: components/OrderForm.jsx

'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

const costs = {
    paperSize: { 'A4': 0.10, 'A3': 0.20 },
    color: { 'bw': 0.05, 'color': 0.25 }
};

export default function OrderForm() {
    const [files, setFiles] = useState([]); 
    const [options, setOptions] = useState({
        quantity: 1,
        paperSize: 'A4',
        color: 'bw',
    });
    const [totalCost, setTotalCost] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Please select one or more files to begin.');

    useEffect(() => {
        if (files.length === 0) {
            setTotalCost(0);
            return;
        }
        const costPerFile = costs.paperSize[options.paperSize] + costs.color[options.color];
        const total = costPerFile * options.quantity * files.length;
        setTotalCost(total);
    }, [files, options]);

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setStatusMessage('Processing files...');
        
        const processedFiles = await Promise.all(
            selectedFiles.map(async (file) => {
                if (file.type.startsWith('image/')) {
                    try {
                        const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
                        const compressed = await imageCompression(file, compressionOptions);
                        // imageCompression may return a Blob without a name — wrap it into a File with original filename
                        if (typeof File !== 'undefined' && !(compressed instanceof File)) {
                            try {
                                return new File([compressed], file.name, { type: compressed.type || file.type });
                            } catch (err) {
                                // Some environments may not support File constructor; fallback to blob but keep a reference to original name
                                compressed._originalName = file.name;
                                return compressed;
                            }
                        }
                        return compressed;
                    } catch (error) {
                        console.error("Compression error:", error);
                        return file;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            setStatusMessage('Please select files before submitting.');
            return;
        }
        
        setIsUploading(true);
        setStatusMessage(`Submitting ${files.length} order(s)...`);

        const formData = new FormData();
        files.forEach((file, idx) => {
            // If compression returned a Blob without a name, convert to File to preserve the original name
            let fileToAppend = file;
            if (typeof File !== 'undefined' && !(file instanceof File)) {
                // Try to infer an extension and name
                const ext = file.type ? file.type.split('/').pop() : 'bin';
                const name = files[idx] && files[idx].name ? files[idx].name : `upload-${Date.now()}.${ext}`;
                try {
                    fileToAppend = new File([file], name, { type: file.type || 'application/octet-stream' });
                } catch (err) {
                    // In environments where File constructor is unavailable, fallback to blob
                    console.warn('File constructor unavailable, appending Blob instead', err);
                    fileToAppend = file;
                }
            }
            // Use original filename if available, otherwise the File object will carry its own name
            formData.append('files', fileToAppend, fileToAppend.name || `upload-${idx}`);
        });
        formData.append('options', JSON.stringify(options));
        formData.append('totalCost', totalCost);

        try {
            const response = await fetch('/api/create-order', { method: 'POST', body: formData });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong.');
            }

            setStatusMessage(`${result.successfulOrders} order(s) submitted successfully!`);
            
            setFiles([]);
            setOptions({ quantity: 1, paperSize: 'A4', color: 'bw' });

            setTimeout(() => setStatusMessage('Please select one or more files to begin.'), 5000);

        } catch (error) {
            setStatusMessage(`Error: ${error.message}`);
            console.error('Submission Error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
            <div>
                <label htmlFor="file-upload" className="block text-lg font-semibold text-gray-800">1. Upload Your Document(s)</label>
                <input id="file-upload" name="file-upload" type="file" onChange={handleFileChange} required multiple className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer" />
                
                {files.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 border rounded-md">
                        <h3 className="font-semibold text-sm text-gray-700">Selected Files:</h3>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                            {files.map(file => <li key={file.name}>{file.name}</li>)}
                        </ul>
                    </div>
                )}
            </div>
            
            <hr />

            <div>
                 <label className="block text-lg font-semibold text-gray-800">2. Choose Your Options (for all files)</label>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" name="quantity" id="quantity" value={options.quantity} onChange={handleOptionChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="paperSize" className="block text-sm font-medium text-gray-700">Paper Size</label>
                        <select id="paperSize" name="paperSize" value={options.paperSize} onChange={handleOptionChange} className="mt-1 block w-full rounded-md border--gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option>A4</option>
                            <option>A3</option>
                        </select>
                    </div>
                    <div>
                        <p className="block text-sm font-medium text-gray-700">Color Options</p>
                        <div className="mt-2 flex space-x-4">
                            <label className="flex items-center"><input type="radio" name="color" value="bw" checked={options.color === 'bw'} onChange={handleOptionChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" /> <span className="ml-2">B&W</span></label>
                            <label className="flex items-center"><input type="radio" name="color" value="color" checked={options.color === 'color'} onChange={handleOptionChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" /> <span className="ml-2">Color</span></label>
                        </div>
                    </div>
                </div>
            </div>
            
            <hr />

            <div className="pt-2">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold text-gray-800">3. Final Cost</p>
                        <p className="text-sm text-gray-500">{statusMessage}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                        <button type="submit" disabled={isUploading || files.length === 0} className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isUploading ? 'Processing...' : `Submit ${files.length} Order(s)`}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}