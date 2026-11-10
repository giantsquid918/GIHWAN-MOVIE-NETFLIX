module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const page = Number(new URL(request.url, "http://localhost").searchParams.get("page") || "1");
  if (!Number.isInteger(page) || page < 1 || page > 3) {
    return response.status(400).json({ error: "Invalid page" });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY environment variable is not configured.");
    return response.status(500).json({ error: "Movie service is not configured" });
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    language: "ko-KR",
    region: "KR",
    page: String(page),
  });

  try {
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/movie/now_playing?${params}`,
    );

    if (!tmdbResponse.ok) {
      console.error(`TMDB request failed with status ${tmdbResponse.status}.`);
      return response.status(502).json({ error: "Movie service request failed" });
    }

    const data = await tmdbResponse.json();
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response.status(200).json(data);
  } catch (error) {
    console.error("TMDB request could not be completed:", error);
    return response.status(502).json({ error: "Movie service is unavailable" });
  }
};
