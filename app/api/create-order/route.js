// Filename: app/api/create-order/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

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
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${userId || 'guest'}/${uuidv4()}.${fileExtension}`;

      // 1. Upload file
      const { error: uploadError } = await supabaseAdmin.storage
        .from('print_files')
        .upload(uniqueFileName, file);

      if (uploadError) {
        console.error('Supabase Upload Error for file:', fileName, uploadError);
        throw new Error(`Could not upload the file: ${fileName}`);
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