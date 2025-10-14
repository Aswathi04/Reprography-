// Filename: app/api/create-order/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  // Prefer server-side env vars but fall back to NEXT_PUBLIC if present
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    return NextResponse.json({ error: 'Supabase not configured on the server.' }, { status: 500 });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { userId } = auth();
    const formData = await request.formData();
    const options = JSON.parse(formData.get('options') || '{}');
    
    // --- MODIFIED: Get all files from the form data ---
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'At least one file is required.' }, { status: 400 });
    }

    // --- MODIFIED: Process all files in parallel ---

    const orderCreationPromises = files.map(async (file) => {
      // Determine a reliable filename: prefer file.name, then client-provided fallback, else generate one
      const originalName = file.name || file._originalName || '';
      const extFromName = originalName && originalName.includes('.') ? originalName.split('.').pop() : null;
      const extFromType = file.type ? file.type.split('/').pop() : 'bin';
      const fileExtension = extFromName || extFromType || 'bin';
      const fileName = originalName || `upload-${Date.now()}.${fileExtension}`;
      const uniqueFileName = `${userId || 'guest'}/${uuidv4()}.${fileExtension}`;

      // Convert incoming File/Blob to Buffer for Supabase Node upload
      let uploadBody;
      try {
        // Web File/Blob exposes arrayBuffer()
        const arrayBuffer = await file.arrayBuffer();
        uploadBody = Buffer.from(arrayBuffer);
      } catch (err) {
        // As a fallback, try using the raw file object if supported by the client
        console.warn('Failed to convert file to Buffer, falling back to raw file object', err);
        uploadBody = file;
      }

      // 1. Upload file
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('print_files')
        .upload(uniqueFileName, uploadBody, { contentType: file.type || 'application/octet-stream' });

      if (uploadError) {
        // Log full error for server debugging
        console.error('Supabase Upload Error for file:', fileName, uploadError);

        // Return a detailed error to the client so it's easier to debug (but not secret keys)
        // Include status/message when available
        const detail = uploadError.message || JSON.stringify(uploadError);
        return NextResponse.json({ error: `Could not upload the file: ${fileName}. ${detail}` }, { status: 502 });
      }

      // 2. Insert order into database
      const orderData = {
        user_id: userId,
        guest_session_id: !userId ? uuidv4() : null,
        file_name: fileName,
        file_path: uniqueFileName,
        options: options,
        // Calculate cost per file on the backend
        total_cost: (costs.paperSize[options.paperSize] + costs.color[options.color]) * options.quantity,
        status: 'pending',
      };

      const { error: insertError } = await supabaseAdmin
        .from('orders')
        .insert([orderData]);
      
      if (insertError) {
        console.error('Supabase Insert Error for file:', fileName, insertError);
        // Attempt to delete the orphaned file from storage
        await supabaseAdmin.storage.from('print_files').remove([uniqueFileName]);
        throw new Error(`Could not save order for file: ${fileName}`);
      }
    });

    // Wait for all uploads and inserts to complete
    await Promise.all(orderCreationPromises);
    
    return NextResponse.json({ success: true, successfulOrders: files.length }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add costs constant to backend for validation/calculation
const costs = {
    paperSize: { 'A4': 0.10, 'A3': 0.20 },
    color: { 'bw': 0.05, 'color': 0.25 }
};