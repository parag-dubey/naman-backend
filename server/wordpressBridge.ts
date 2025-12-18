import { log } from "console";

// ✅ 1. Credentials Configuration
const WORDPRESS_SITE_URL = "https://namandarshan.com";
// Dhyan dein: Username wahi hona chahiye jo WordPress login me use karte hain (bina space wala)
// Agar "user" galat ho, toh yaha apna WordPress wala Email likh dena.
const APP_USERNAME = "user"; 
const APP_PASSWORD = "3T5w FIGG I9KY A8Mu N34w BgHE"; // Aapka Password

export async function createWordPressLead(data: { 
  name: string;
  phone: string;
  email: string; // ✅ Email field add kiya
  service: string; 
}) {
  try {
    // URL: App Leads folder
    const apiUrl = `${WORDPRESS_SITE_URL}/wp-json/wp/v2/app_leads`;

    // Auth Header
    const authHeader = 'Basic ' + Buffer.from(`${APP_USERNAME}:${APP_PASSWORD}`).toString('base64');

    // ✅ Data Format: Ab isme Email bhi dikhega
    const postBody = {
      // Title me Naam aur Number
      title: `New Lead: ${data.name} - ${data.phone}`, 
      
      status: 'publish', 
      
      // Content box me saari details
      content: `
        <h3>🚀 New Booking Request from App</h3>
        <ul>
          <li><strong>Name:</strong> ${data.name}</li>
          <li><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></li>
          <li><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></li> <li><strong>Service Details:</strong> ${data.service}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <hr>
        <p><em>Sent via Senior Mobile Expert App</em></p>
      `
    };

    console.log(`📤 Sending Lead to WordPress: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ WordPress Error:", errorText);
      return null;
    }

    const json = await response.json();
    console.log(`✅ Success! Lead sent to App Leads. ID: ${json.id}`);
    return json;

  } catch (error) {
    console.error("⚠️ Failed to send to WordPress:", error);
    return null;
  }
}