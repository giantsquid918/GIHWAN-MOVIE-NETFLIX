const TMDB_API_BASE = "https://api.themoviedb.org/3";

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDB_API_KEY is not configured.");
    return response.status(500).json({ error: "Movie service is not configured." });
  }

  try {
    const pages = await Promise.all(
      [1, 2, 3].map(async (page) => {
        const params = new URLSearchParams({
          api_key: apiKey,
          language: "ko-KR",
          region: "KR",
          page: String(page),
        });
        const result = await fetch(
          `${TMDB_API_BASE}/movie/now_playing?${params.toString()}`,
        );

        if (!result.ok) {
          throw new Error(`TMDB request failed (${result.status}).`);
        }

        return result.json();
      }),
    );

    response.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return response.status(200).json({
      results: pages.flatMap((page) => page.results || []),
    });
  } catch (error) {
    console.error("Failed to fetch now-playing movies from TMDB:", error);
    return response.status(502).json({ error: "Unable to fetch movies." });
  }
};
