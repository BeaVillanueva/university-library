const SCRIPT_SECRET_PROPERTY = "MAIL_SECRET";

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return jsonResponse({
    ok: true,
    message: "CVSU Library mailer is ready. Use POST to send email.",
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(SCRIPT_SECRET_PROPERTY) || "";

    if (expectedSecret && body.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const html = String(body.html || "");
    const text = String(body.text || "");
    const name = String(body.name || "CVSU Imus Library").trim();

    if (!to || !subject || (!html && !text)) {
      return jsonResponse({ ok: false, error: "Missing required email fields" });
    }

    MailApp.sendEmail({
      to,
      subject,
      body: text || html.replace(/<[^>]+>/g, " "),
      htmlBody: html || undefined,
      name,
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}
