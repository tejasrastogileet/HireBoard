export async function getStreamToken(req, res) {
  // Token endpoint deprecated — video calls removed from the app
  return res.status(410).json({ message: "Stream token endpoint removed - video feature deprecated" });
}
