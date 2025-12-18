const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Images folder setup
app.use("/images", express.static(path.join(__dirname, "public/images")));

// --- 🔴 WORDPRESS CONFIGURATION (Aapki file se liya gaya) 🔴 ---
const WP_URL = "https://namandarshan.com/wp-json/wp/v2/app_leads"; 
const WP_USERNAME = "user"; 
const WP_PASSWORD = "3T5w FIGG I9KY A8Mu N34w BgHE"; 

// --- DATA ---
const servicesData = [
  { id: "1", name: "Rudrabhishek Puja", description: "Lord Shiva ka divine abhishek.", basePrice: 2100, temple: "Mahakaleshwar, Ujjain", image: "/images/rudra.webp" },
  { id: "2", name: "Satyanarayan Katha", description: "Ghar me shanti ke liye katha.", basePrice: 1100, temple: "Home Service", image: "/images/satyanarayan.webp" },
  { id: "3", name: "Maha Ganpati Puja", description: "Vighna nashak puja.", basePrice: 1500, temple: "Siddhivinayak, Mumbai", image: "/images/mahaganpati.webp" },
  { id: "4", name: "Navgraha Shanti", description: "Grah dosh nivaran.", basePrice: 5100, temple: "Trimbakeshwar, Nashik", image: "/images/navgrah.webp" },
  { id: "5", name: "Kalsarp Dosh Nivaran", description: "Kaal sarp dosh hatane ke liye.", basePrice: 7500, temple: "Omkareshwar, MP", image: "/images/kalsharp.webp" },
  { id: "6", name: "Lakshmi Kubera Puja", description: "Dhan aur samridhi ke liye.", basePrice: 3100, temple: "Mahalakshmi, Kolhapur", image: "/images/laxmikuber.webp" }
];

const templesData = [
  { id: "1", name: "Mahakaleshwar Temple", location: "Ujjain", image: "/images/mahakal.webp" },
  { id: "2", name: "Siddhivinayak Temple", location: "Mumbai", image: "/images/sidhivinayak.webp" },
  { id: "3", name: "Trimbakeshwar Temple", location: "Nashik", image: "/images/iskondelhi.webp" },
];

const getBaseUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
};

const addUrlToData = (data, baseUrl) => {
  return data.map(item => ({
    ...item,
    image: item.image ? `${baseUrl}${item.image}` : null
  }));
};

// --- API ROUTES ---

app.get("/api/services", (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.json(addUrlToData(servicesData, baseUrl));
});

app.get("/api/temples", (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.json(addUrlToData(templesData, baseUrl));
});

// ✅ POST Booking: Receive & Send to WordPress (Aapki Logic)
app.post("/api/bookings", async (req, res) => {
  const data = req.body;
  
  console.log("🔥 New Booking Received:", data);

  try {
    // 1. Authentication Header (Aapke Code se)
    const authHeader = 'Basic ' + Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64');

    // 2. HTML Content Banana (Aapke Code jaisa)
    // Note: App se "userName" aur "userPhone" aa raha hai, unhe yahan map kiya hai.
    const htmlContent = `
        <h3>🚀 New Booking Request from App</h3>
        <ul>
          <li><strong>Name:</strong> ${data.userName}</li>
          <li><strong>Phone:</strong> <a href="tel:${data.userPhone}">${data.userPhone}</a></li>
          <li><strong>Service Name:</strong> ${data.serviceName}</li>
          <li><strong>Temple:</strong> ${data.temple}</li>
          <li><strong>Date:</strong> ${data.date}</li>
          <li><strong>Time:</strong> ${data.time}</li>
          <li><strong>Budget:</strong> ₹${data.userBudgetPrice}</li>
          <li><strong>Booking Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <hr>
        <p><em>Sent via Senior Mobile Expert App</em></p>
    `;

    const wpPayload = {
      title: `New Lead: ${data.userName} - ${data.userPhone}`,
      status: 'publish',
      content: htmlContent
    };

    console.log("📤 Sending Lead to WordPress...", WP_URL);

    // 3. WordPress API Call
    const wpResponse = await fetch(WP_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wpPayload)
    });

    if (!wpResponse.ok) {
        const errorText = await wpResponse.text();
        console.error("❌ WordPress Error:", errorText);
    } else {
        const wpResult = await wpResponse.json();
        console.log(`✅ Success! Lead sent to App Leads. ID: ${wpResult.id}`);
    }

  } catch (err) {
    console.error("⚠️ Failed to send to WordPress:", err.message);
  }

  // App ko success message bhejo
  res.json({ success: true, message: "Processed", data: data });
});

app.get("/", (req, res) => {
  res.send("NamanDarshan API is Running...");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server Started on PORT ${PORT}`);
  });
}

module.exports = app;