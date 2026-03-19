export default async function handler(req, res) {
  try {

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzQ7fHVzvAclAadfbi-DDvi2MF416wyvaSGrXFz8_JZ7lKtppQ77T0_nrEHd_Gapuir/exec",
      {
        method: "POST",
        body: JSON.stringify(req.body),
      }
    );

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(text);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}