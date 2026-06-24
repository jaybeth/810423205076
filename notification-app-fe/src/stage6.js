const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJqYXliZXRocHJhZ2F0aGVlc0BnbWFpbC5jb20iLCJleHAiOjE3ODIyODE1NDAsImlhdCI6MTc4MjI4MDY0MCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjU5MTAxZWQ1LWQ1YWQtNDlhYS04YjI5LTA2ZjA0YTNmMjBhNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImpheWJldGggcHJhZ2F0aGVlc3dhcmFyIiwic3ViIjoiNDQyOTg3ZDMtMjkxMC00YzE0LWE0M2YtNGQzMzkxZWFjOGFhIn0sImVtYWlsIjoiamF5YmV0aHByYWdhdGhlZXNAZ21haWwuY29tIiwibmFtZSI6ImpheWJldGggcHJhZ2F0aGVlc3dhcmFyIiwicm9sbE5vIjoiODEwNDIzMjA1MDc2IiwiYWNjZXNzQ29kZSI6IlFXSnVGZiIsImNsaWVudElEIjoiNDQyOTg3ZDMtMjkxMC00YzE0LWE0M2YtNGQzMzkxZWFjOGFhIiwiY2xpZW50U2VjcmV0Ijoic3pEc0RWUUtFRWd4ZVB2RCJ9.bvjlV8TTjHP-cyez0ikNwbe4EFWfDGmwjpO91D8CU3g";

async function getTopNotifications() {
  try {
    const response = await fetch(
      "http://4.224.186.213/evaluation-service/notifications",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    console.log("API Response:");
    console.log(data);

    // notifications array extract
    const notifications = data.notifications || [];

    const priority = {
      Placement: 3,
      Result: 2,
      Event: 1,
    };

    const sorted = notifications.sort((a, b) => {
      // Type Priority
      if (priority[b.Type] !== priority[a.Type]) {
        return priority[b.Type] - priority[a.Type];
      }

      // Latest first
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    const top10 = sorted.slice(0, 10);

    console.log("\n===== TOP 10 NOTIFICATIONS =====");
    console.table(top10);

  } catch (error) {
    console.error("Error:", error);
  }
}

getTopNotifications();