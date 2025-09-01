// Filename: app/api/create-order/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize a Supabase Admin client.
// This uses the SERVICE_ROLE_KEY for secure, server-side operations.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request) {
  try {
    // Get the user ID from Clerk's session
    const { userId } = auth();
    
    // Parse the form data from the incoming request
    const formData = await request.formData();
    const file = formData.get('file');
    const options = JSON.parse(formData.get('options') || '{}');
    const totalCost = formData.get('totalCost');
    const fileName = formData.get('fileName');

    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    // 1. UPLOAD THE FILE TO SUPABASE STORAGE
    // Generate a unique file path to prevent overwrites
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${userId || 'guest'}/${uuidv4()}.${fileExtension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('print_files')
      .upload(uniqueFileName, file);

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      throw new Error('Could not upload the file.');
    }

    // 2. INSERT THE ORDER INTO THE SUPABASE DATABASE
    const orderData = {
      user_id: userId, // Will be null for guests
      guest_session_id: !userId ? uuidv4() : null, // Create a session ID for guests
      file_name: fileName,
      file_path: uniqueFileName,
      options: options,
      total_cost: totalCost,
      status: 'pending',
    };

    const { data: order, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select()
      .single(); // .single() returns one object instead of an array

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      // Optional: Attempt to delete the uploaded file if the DB insert fails
      await supabaseAdmin.storage.from('print_files').remove([uniqueFileName]);
      throw new Error('Could not save the order to the database.');
    }

    // 3. RETURN A SUCCESS RESPONSE
    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}