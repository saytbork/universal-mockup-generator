export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // Placeholder endpoint for magic link verification if needed by clients.
  return res.status(200).json({ ok: true });
}
