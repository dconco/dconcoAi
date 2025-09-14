import { config } from "dotenv";

config();

const url = `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/whatsapp_business_profile`;
const token = process.env.WHATSAPP_TOKEN as string;

async function updateAbout() {
  const res = await fetch(url, {
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
  const res = await fetch(url, {
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

// updateName();
// updateAbout();