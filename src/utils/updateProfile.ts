import { config } from "dotenv";

config();

const url = `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`;
const token = process.env.WHATSAPP_TOKEN as string;

async function updateAbout() {
  const res = await fetch(`${url}/whatsapp_business_profile`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      about: "🤖 I'm dconco AI — helping you 24/7 until dconco takes over."
    })
  });

  const data = await res.json();
  console.log(data);
}

async function updateName() {
  const res = await fetch(`${url}/whatsapp_business_profile`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      name: "dconco AI"
    })
  });

  const data = await res.json();
  console.log(data);
}

async function verifyName() {
  const res = await fetch(`${url}/register`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			messaging_product: "whatsapp",
			cc: "234",
			phone_number: "09064772574",
			method: "sms",
			pin: process.env.WHATSAPP_2FA_PIN || "123456",
			cert: "CmYKIgi5lOafwuaLAxIGZW50OndhIglkY29uY28gQUlQ4aikxgYaQETWzbLyU02VDQ5Rnh0hHmu1gZHdvia6QuH4zaoqkCxYSx6QyXGgtF545hd67k4UzYcZbg5q2oDHSeJ/Nt5GJAsSMG0bVsDy+emt8VqzsJuoZCmTXuPiXsD3KV4tKexLOtxe00n0Cm7IpuDRIVFiJ8CLxQ=="
		})
  });

  const data = await res.json();
  console.log(data);
}

// Uncomment to run
// verifyName();
// updateName();
// updateAbout();