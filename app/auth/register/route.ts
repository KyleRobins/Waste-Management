import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const formData = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          phone: formData.phone,
          location: formData.location,
          role: formData.role,
        },
      },
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (data.user) {
      const profile = {
        user_id: data.user.id,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
      };

      const { error: profileError } = await supabase
        .from(formData.role === 'supplier' ? 'suppliers' : 'customers')
        .insert({
          ...profile,
          name: formData.email.split('@')[0],
          contact_person: formData.email.split('@')[0],
        });

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}