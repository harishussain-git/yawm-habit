import { NextRequest } from "next/server";

type HabitStatusNotificationBody = {
  actorName?: string;
  partnerUserId?: string;
  habitTitle?: string;
  status?: "yes" | "no";
};

const YES_MESSAGES = [
  "{actorName} completed {habitTitle}. Your turn — keep going for Allah.",
  "{actorName} marked {habitTitle} Yes. Small deeds, done regularly.",
  "{actorName} completed {habitTitle}. MashaAllah — stay consistent.",
  "{actorName} marked {habitTitle} Yes. Your brother is moving. Your turn.",
];

function buildNotificationBody(actorName: string, habitTitle: string, status: "yes" | "no") {
  if (status === "no") {
    return `${actorName} marked ${habitTitle} No. A gentle reminder for both of you.`;
  }

  const message = YES_MESSAGES[Math.floor(Math.random() * YES_MESSAGES.length)];
  return message.replace("{actorName}", actorName).replace("{habitTitle}", habitTitle);
}

function parseResponseBody(responseText: string) {
  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

export async function POST(request: NextRequest) {
  const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
  const oneSignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!oneSignalAppId || !oneSignalRestApiKey) {
    console.warn("OneSignal env missing", {
      hasAppId: Boolean(process.env.ONESIGNAL_APP_ID),
      hasRestKey: Boolean(process.env.ONESIGNAL_REST_API_KEY),
    });
    return Response.json(
      {
        error: "Missing OneSignal env",
        hasAppId: Boolean(process.env.ONESIGNAL_APP_ID),
        hasRestKey: Boolean(process.env.ONESIGNAL_REST_API_KEY),
      },
      { status: 500 },
    );
  }

  let body: HabitStatusNotificationBody;

  try {
    body = (await request.json()) as HabitStatusNotificationBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { actorName, partnerUserId, habitTitle, status } = body;

  if (!actorName || !partnerUserId || !habitTitle || (status !== "yes" && status !== "no")) {
    return Response.json({ error: "Missing notification fields." }, { status: 400 });
  }

  const message = buildNotificationBody(actorName, habitTitle, status);

  console.info("Sending OneSignal habit notification", {
    hasAppId: Boolean(process.env.ONESIGNAL_APP_ID),
    hasRestKey: Boolean(process.env.ONESIGNAL_REST_API_KEY),
    partnerUserId,
    actorName,
    habitTitle,
    status,
  });

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_aliases: {
          external_id: [partnerUserId],
        },
        target_channel: "push",
        headings: {
          en: "Yawm Habit",
        },
        contents: {
          en: message,
        },
      }),
    });

    const responseText = await response.text();
    const responseBody = parseResponseBody(responseText);

    console.info("OneSignal habit notification response", {
      hasAppId: Boolean(process.env.ONESIGNAL_APP_ID),
      hasRestKey: Boolean(process.env.ONESIGNAL_REST_API_KEY),
      partnerUserId,
      oneSignalStatus: response.status,
      oneSignalResponseBody: responseBody,
    });

    if (!response.ok) {
      return Response.json(
        {
          error: "OneSignal request failed",
          status: response.status,
          details: responseBody,
        },
        { status: response.status },
      );
    }

    return Response.json({
      ok: true,
      status: response.status,
      details: responseBody,
    });
  } catch (error) {
    console.warn("OneSignal habit notification fetch threw", {
      hasAppId: Boolean(process.env.ONESIGNAL_APP_ID),
      hasRestKey: Boolean(process.env.ONESIGNAL_REST_API_KEY),
      partnerUserId,
      message: error instanceof Error ? error.message : "Unknown fetch error.",
    });

    return Response.json(
      {
        error: "OneSignal fetch failed",
        details: error instanceof Error ? error.message : "Unknown fetch error.",
      },
      { status: 500 },
    );
  }
}
