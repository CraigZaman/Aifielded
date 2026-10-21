import { once } from "node:events";
import { createConnection } from "node:net";
import { createInterface } from "node:readline";

export function localSmtpPort() {
  const value = process.env.LOCAL_SMTP_PORT;
  if (!value) return null;
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : null;
}

export async function sendLocalEmail(input: { to: string; subject: string; text: string }) {
  const port = localSmtpPort();
  const sender = process.env.LOCAL_SMTP_FROM || "fielded@local.test";
  if (!port || !/^[^\s<>@]+@[^\s<>@]+$/.test(sender) || !/^[^\s<>@]+@[^\s<>@]+$/.test(input.to)) {
    throw new Error("Local SMTP is not configured with valid addresses.");
  }

  const socket = createConnection({ host: "127.0.0.1", port });
  socket.setTimeout(12000, () => socket.destroy(new Error("Local SMTP timed out.")));
  const lineReader = createInterface({ input: socket, crlfDelay: Infinity });
  const lines = lineReader[Symbol.asyncIterator]();

  async function expectCode(expected: number) {
    for (;;) {
      const line = await lines.next();
      if (line.done) throw new Error("Local SMTP disconnected.");
      if (!/^\d{3}[ -]/.test(line.value)) throw new Error("Invalid local SMTP response.");
      if (line.value[3] === " ") {
        const code = Number(line.value.slice(0, 3));
        if (code !== expected) throw new Error(`Local SMTP returned ${code}.`);
        return;
      }
    }
  }

  async function command(value: string, expected: number) {
    socket.write(`${value}\r\n`);
    await expectCode(expected);
  }

  try {
    await once(socket, "connect");
    await expectCode(220);
    await command("EHLO fielded.local", 250);
    await command(`MAIL FROM:<${sender}>`, 250);
    await command(`RCPT TO:<${input.to}>`, 250);
    await command("DATA", 354);
    const subject = Buffer.from(input.subject, "utf8").toString("base64");
    const body = Buffer.from(input.text, "utf8").toString("base64").match(/.{1,76}/g)?.join("\r\n") || "";
    socket.write(`From: Fielded Local <${sender}>\r\nTo: <${input.to}>\r\nSubject: =?UTF-8?B?${subject}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${body}\r\n.\r\n`);
    await expectCode(250);
    socket.write("QUIT\r\n");
  } finally {
    lineReader.close();
    socket.destroy();
  }
}
