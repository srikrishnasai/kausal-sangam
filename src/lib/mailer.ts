export type Email = {
  to: string;
  subject: string;
  /** Plain text. No HTML templates until there is a reason for them. */
  body: string;
};

type Transport = (email: Email) => Promise<void>;

/** Addresses that provably cannot receive mail. Sending to these only earns bounces. */
const UNDELIVERABLE = /@(example\.(com|org|net)|test|invalid|localhost)$/i;

const toConsole: Transport = async (email) => {
  console.log(
    [
      "",
      "┌─ email ───────────────────────────────────────────",
      `│ To:      ${email.to}`,
      `│ Subject: ${email.subject}`,
      "├───────────────────────────────────────────────────",
      email.body
        .split("\n")
        .map((line) => `│ ${line}`)
        .join("\n"),
      "└───────────────────────────────────────────────────",
      "",
    ].join("\n"),
  );
};

const toResend =
  (apiKey: string, from: string): Transport =>
  async (email) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [email.to], subject: email.subject, text: email.body }),
    });

    if (!response.ok) {
      throw new Error(`Resend returned ${response.status}: ${await response.text()}`);
    }
  };

/**
 * No provider configured means the console — which is the right default here,
 * not a fallback. Every seeded account uses an @example.com address, so a real
 * transport would bounce on every send.
 */
function transport(): { send: Transport; live: boolean } {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (apiKey && from) return { send: toResend(apiKey, from), live: true };
  return { send: toConsole, live: false };
}

/**
 * Never throws. A swap request must still be created when the mail server is
 * down, so delivery failure is logged and swallowed rather than surfaced to the
 * person who submitted the form.
 */
export async function sendEmail(email: Email): Promise<void> {
  const { send, live } = transport();

  if (live && UNDELIVERABLE.test(email.to)) {
    console.warn(`[mailer] ${email.to} cannot receive mail — logging instead of sending.`);
    await toConsole(email);
    return;
  }

  try {
    await send(email);
  } catch (error) {
    console.error(`[mailer] failed to send "${email.subject}" to ${email.to}:`, error);
  }
}

/** Absolute base for links in emails — relative URLs are useless in an inbox. */
export function appUrl(path = "/"): string {
  const base = process.env.APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}
