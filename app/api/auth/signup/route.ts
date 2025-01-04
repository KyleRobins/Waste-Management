import { handleAuth } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    const response = await fetch(
      `${process.env.AUTH0_ISSUER_BASE_URL}/dbconnections/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          email,
          password,
          connection: "Username-Password-Authentication",
          given_name: firstName,
          family_name: lastName,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
