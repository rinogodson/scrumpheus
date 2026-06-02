export default {
  async fetch(request, env) {
    // LATE TODO: change this to the domain name when pushing
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/auth" && request.method === "POST") {
      const { code } = await request.json();

      const tokenResponse = await fetch(
        "https://hackatime.hackclub.com/oauth/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: env.CLIENT_ID,
            client_secret: env.CLIENT_SECRET,
            // LATE TODO: change this to the domain name when pushing
            redirect_uri: "http://localhost:5173/auth/callback",
            grant_type: "authorization_code",
            code: code,
          }),
        },
      );

      const data = await tokenResponse.json();

      // gemme the toke back!
      return new Response(JSON.stringify(data), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    if (url.pathname === "/api/user" && request.method === "GET") {
      const authHeader = request.headers.get("Authorization");

      const userResponse = await fetch(
        "https://hackatime.hackclub.com/api/v1/users/current",
        {
          headers: { Authorization: authHeader },
        },
      );

      const userData = await userResponse.json();
      return new Response(JSON.stringify(userData), {
        // LATE TODO: change this to the domain name when pushing
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
