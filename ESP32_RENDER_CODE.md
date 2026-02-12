# ESP32 Gateway Code for Render (HTTPS)

Replace your current `uploadToBackend()` function with this:

```cpp
#include <WiFiClientSecure.h>

void uploadToBackend(uint8_t* img, size_t len) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ No home WiFi");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure(); // Skip certificate validation (for testing)

  // Replace with your actual Render URL (without https://)
  const char* serverHost = "agrieye-backend.onrender.com";
  const int serverPort = 443; // HTTPS port

  if (!client.connect(serverHost, serverPort)){
    Serial.println("❌ Backend connection failed");
    return;
  }

  const char* boundary = "----ESP32Boundary";

  String header = "";
  
  // Add deviceId field
  header += "--" + String(boundary) + "\r\n";
  header += "Content-Disposition: form-data; name=\"deviceId\"\r\n\r\n";
  header += String(deviceId) + "\r\n";
  
  // Add crop field
  header += "--" + String(boundary) + "\r\n";
  header += "Content-Disposition: form-data; name=\"crop\"\r\n\r\n";
  header += String(cropType) + "\r\n";
  
  // Add image field
  header += "--" + String(boundary) + "\r\n";
  header += "Content-Disposition: form-data; name=\"image\"; filename=\"leaf.jpg\"\r\n";
  header += "Content-Type: image/jpeg\r\n\r\n";
  
  String footer = "\r\n--" + String(boundary) + "--\r\n";
  
  int contentLength = header.length() + len + footer.length();

  client.println("POST /api/upload HTTP/1.1");
  client.print("Host: ");
  client.println(serverHost);
  client.print("Content-Type: multipart/form-data; boundary=");
  client.println(boundary);
  client.print("Content-Length: ");
  client.println(contentLength);
  client.println();

  client.print(header);
  client.write(img, len);
  client.print(footer);

  delay(10);

  while (client.connected() && !client.available()) delay(1);

  while (client.available()) {
    Serial.write(client.read());
  }

  client.stop();

  Serial.println("\n✅ Uploaded to backend");
}
```

**Key Changes:**
1. Changed `WiFiClient` to `WiFiClientSecure` for HTTPS
2. Changed port from `8000` to `443` (HTTPS)
3. Changed IP address to Render hostname
4. Added `client.setInsecure()` for testing (use proper cert in production)
