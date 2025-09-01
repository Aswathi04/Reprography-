// Filename: components/OrderForm.jsx

'use client'; // This directive is essential for interactive components

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

// In a real app, these costs might come from a database or API
const costs = {
    paperSize: { 'A4': 0.10, 'A3': 0.20 },
    color: { 'bw': 0.05, 'color': 0.25 }
};

export default function OrderForm() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [options, setOptions] = useState({
        quantity: 1,
        paperSize: 'A4',
        color: 'bw',
    });
    const [totalCost, setTotalCost] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Please select a file to begin.');

    // This hook recalculates the cost whenever the file or options change
    useEffect(() => {
        if (!file) {
            setTotalCost(0);
            return;
        }
        const baseCost = costs.paperSize[options.paperSize];
        const colorCost = costs.color[options.color];
        const total = (baseCost + colorCost) * options.quantity;
        setTotalCost(total);
    }, [file, options]);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setStatusMessage('Processing file...');
        
        // Image compression for optimization
        if (selectedFile.type.startsWith('image/')) {
            try {
                const compressionOptions = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(selectedFile, compressionOptions);
                setFile(compressedFile);
                setStatusMessage('File is ready.');
            } catch (error) {
                console.error("Compression error: ", error);
                setFile(selectedFile); // Fallback to original file
                setStatusMessage('Could not compress image, using original.');
            }
        } else {
            setFile(selectedFile);
            setStatusMessage('File is ready.');
        }

        // Create a URL for previewing the image
        if (selectedFile.type.startsWith('image/')) {
             setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(''); // Don't show a preview for non-image files
        }
    };

    const handleOptionChange = (e) => {
        const { name, value } = e.target;
        // Ensure quantity is a number
// After
const newValue = name === 'quantity' ? (parseInt(value, 10) || 1) : value;
        setOptions(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
        setStatusMessage('Please select a file before submitting.');
        return;
    }
    
    // 1. Set loading state and message
    setIsUploading(true);
    setStatusMessage('Submitting your order...');

    // NOTE: In our next major step, we will add the real backend logic here.
    // For now, we will simulate a successful submission to test the UI.
    setTimeout(() => {
        // 2. On success, update the message and reset the form
        setIsUploading(false);
        setStatusMessage('Order submitted successfully! You will be notified when it is ready.');
        
        // Reset the form for the next order
        setFile(null);
        setPreview('');
        setOptions({ quantity: 1, paperSize: 'A4', color: 'bw' });

        // Optional: clear the success message after a few seconds
        setTimeout(() => setStatusMessage('Please select a file to begin.'), 5000);
    }, 2000); // Simulate a 2-second upload time
};

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
            {/* File Input and Preview Section */}
            <div>
                <label htmlFor="file-upload" className="block text-lg font-semibold text-gray-800">1. Upload Your Document</label>
                <p className="text-sm text-gray-500 mt-1">Images will be compressed to save bandwidth.</p>
                <input id="file-upload" name="file-upload" type="file" onChange={handleFileChange} required className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer" />
                
                {preview && <img src={preview} alt="Image preview" className="mt-4 rounded-md max-h-40 border border-gray-300" />}
                {file && !preview && <p className="mt-4 p-3 bg-gray-100 text-gray-700 rounded-md">Selected file: {file.name}</p>}
            </div>
            
            <hr />

            {/* Printing Options Section */}
            <div>
                 <label className="block text-lg font-semibold text-gray-800">2. Choose Your Options</label>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" name="quantity" id="quantity" value={options.quantity} onChange={handleOptionChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="paperSize" className="block text-sm font-medium text-gray-700">Paper Size</label>
                        <select id="paperSize" name="paperSize" value={options.paperSize} onChange={handleOptionChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
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

            {/* Cost and Submit Section */}
            <div className="pt-2">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold text-gray-800">3. Final Cost</p>
                        <p className="text-sm text-gray-500">{statusMessage}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                        <button type="submit" disabled={isUploading || !file} className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isUploading ? 'Processing...' : 'Submit Order'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}