// src/server/lib/apiResponse.ts
import { NextResponse } from 'next/server';

export const successResponse = (data: any, status = 200) => {
  return NextResponse.json({ success: true, data }, { status });
};

export const errorResponse = (message: string, status = 400) => {
  return NextResponse.json({ success: false, error: message }, { status });
};