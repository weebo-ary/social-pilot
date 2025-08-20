"use client";

export default function ConnectLinkedIn() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI
    );
    const state = crypto.randomUUID(); // prevent CSRF
    const scope = encodeURIComponent("openid email profile w_member_social");

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

    window.location.href = authUrl; // redirect user
  };

  return (
    <button
      onClick={handleConnect}
      style={{
        marginTop: "1rem",
        padding: "0.5rem 1rem",
        background: "#0A66C2",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Connect LinkedIn
    </button>
  );
}
