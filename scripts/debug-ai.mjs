const baseUrl = "http://localhost:3000";

async function debug() {
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@dawoodfashion.pk", password: "password123" }),
  });
  const cookie = loginRes.headers.get("set-cookie");

  console.log("--- Testing /api/ai/reply ---");
  const replyRes = await fetch(`${baseUrl}/api/ai/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      customerMessage: "Black shirt medium available hai? Lahore delivery kitne din mein hogi?",
      customerPhone: "+92 322 4443322",
    }),
  });
  console.log("Reply status:", replyRes.status);
  const replyJson = await replyRes.json();
  console.log("Reply json:", replyJson);

  console.log("\n--- Testing /api/ai/chat ---");
  const chatRes = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      message: "How many orders today?",
    }),
  });
  console.log("Chat status:", chatRes.status);
  const chatJson = await chatRes.json();
  console.log("Chat json:", chatJson);

  console.log("\n--- Testing /api/analytics ---");
  const aRes = await fetch(`${baseUrl}/api/analytics?range=today`, { headers: { cookie } });
  console.log("Analytics status:", aRes.status);
  const aJson = await aRes.json();
  console.log("Analytics json:", aJson);
}

debug();
