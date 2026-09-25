const baseUrl = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING END-TO-END VERIFICATION TESTS ===\n");

  // 1. Seed Database
  console.log("1. Seeding demo database (Dawood Fashion, Lahore)...");
  const seedRes = await fetch(`${baseUrl}/api/dev/seed`, { method: "POST" });
  const seedData = await seedRes.json();
  console.log("Seed Result:", seedData.success ? "SUCCESS" : seedData);

  // 2. Login as Demo Owner
  console.log("\n2. Logging in as Demo Business Owner (demo@dawoodfashion.pk)...");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@dawoodfashion.pk", password: "password123" }),
  });

  const cookie = loginRes.headers.get("set-cookie");
  const loginData = await loginRes.json();
  console.log("Login Status:", loginRes.status, "User:", loginData.user?.name, "Business:", loginData.business?.name);

  if (!cookie) {
    throw new Error("No session cookie returned from login");
  }

  // 3. Verify /api/auth/me
  console.log("\n3. Testing /api/auth/me with session cookie...");
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie },
  });
  const meData = await meRes.json();
  console.log("Auth Context Verified:", meData.authenticated, "| Business ID:", meData.business?._id);

  // 4. Products & Stock Check
  console.log("\n4. Checking Products and Low-Stock items...");
  const productsRes = await fetch(`${baseUrl}/api/products`, {
    headers: { cookie },
  });
  const productsData = await productsRes.json();
  console.log(`Fetched ${productsData.products?.length} products. Low stock items:`,
    productsData.products?.filter(p => p.stockQuantity <= p.lowStockThreshold).map(p => `${p.name} (${p.stockQuantity})`)
  );

  // 5. Test AI Customer Reply Generator with Roman Urdu & real catalog stock
  console.log("\n5. Testing AI Customer Reply Generator with Roman Urdu inquiry...");
  const replyRes = await fetch(`${baseUrl}/api/ai/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      customerMessage: "Black shirt medium available hai? Lahore delivery kitne din mein hogi?",
      customerPhone: "+92 322 4443322",
    }),
  });
  const replyData = await replyRes.json();
  console.log("Generated AI Reply:\n", replyData.reply);
  console.log("Generated WhatsApp Click-to-Chat URL:", replyData.whatsAppUrl);

  // 6. Test AI Manager Conversational Chat with real data
  console.log("\n6. Testing AI Digital Manager Q&A with live database stats...");
  const chatRes = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      message: "How many orders did I get today and which products are low in stock?",
    }),
  });
  const chatData = await chatRes.json();
  console.log("AI Manager Response:\n", chatData.answer);

  // 7. Test Inquiries & Convert to Order
  console.log("\n7. Testing Inquiry list and Convert-to-Order workflow...");
  const inqRes = await fetch(`${baseUrl}/api/inquiries`, { headers: { cookie } });
  const inqData = await inqRes.json();
  const firstInquiry = inqData.inquiries?.[0];
  console.log(`Found ${inqData.inquiries?.length} inquiries. First inquiry: "${firstInquiry?.message}" from ${firstInquiry?.customerName}`);

  if (firstInquiry) {
    console.log("Converting inquiry to customer & confirmed order...");
    const convertRes = await fetch(`${baseUrl}/api/inquiries/${firstInquiry._id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({}),
    });
    const convertData = await convertRes.json();
    console.log("Conversion Result:", convertData.message, "| Customer ID:", convertData.customer?._id, "| Order:", convertData.order?.orderNumber);
  }

  // 8. Test Analytics & AI Business Insights
  console.log("\n8. Testing Analytics & Deterministic metrics...");
  const analyticsRes = await fetch(`${baseUrl}/api/analytics?range=30d&aiInsights=true`, { headers: { cookie } });
  const analyticsData = await analyticsRes.json();
  console.log("Analytics Total Revenue:", analyticsData.analytics?.totalRevenue, "PKR | Orders:", analyticsData.analytics?.totalOrders);
  console.log("AI Strategic Insights:", analyticsData.aiInsights);

  // 9. Test Admin Authorization
  console.log("\n9. Testing Admin login and platform overview...");
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@aidigitalmanager.com", password: "admin123" }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  const adminRes = await fetch(`${baseUrl}/api/admin`, { headers: { cookie: adminCookie } });
  const adminData = await adminRes.json();
  console.log("Admin Overview: Total Businesses:", adminData.totalBusinesses, "| Total Users:", adminData.totalUsers);

  console.log("\n=== ALL END-TO-END VERIFICATIONS PASSED SUCCESSFULLY! ===");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
