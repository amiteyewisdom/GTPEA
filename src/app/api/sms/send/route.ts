import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required." },
        { status: 400 }
      );
    }

    const authKey = process.env.NALO_SMS_AUTH_KEY;
    const senderId = process.env.NALO_SMS_SENDER_ID || "GTP";

    if (!authKey) {
      return NextResponse.json(
        { error: "SMS authentication key not configured." },
        { status: 500 }
      );
    }

    // Format phone number to international format (Ghana: +233)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith("0")) {
      formattedPhone = "233" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("233")) {
      formattedPhone = "233" + phoneNumber;
    }

    // Build URL with query parameters
    const baseUrl = "https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/";
    const params = new URLSearchParams({
      key: authKey,
      type: "0",
      destination: formattedPhone,
      dlr: "1",
      source: senderId,
      message: message,
    });

    const url = `${baseUrl}?${params.toString()}`;

    // Send SMS using axios
    const response = await axios.get(url);

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
      data: response.data,
    });
  } catch (err: any) {
    console.error("[/api/sms/send] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}
