import type { Contributor } from "../types/contributor";

interface GitHubContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

const cache = new Map<string, Contributor[]>();

export async function fetchContributors(owner: string, repository: string): Promise<Contributor[]> {
  const cacheKey = `${owner}/${repository}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repository}/contributors?per_page=100`,
    { headers: { Accept: "application/vnd.github+json" } },
  );

  if (!response.ok) {
    throw new Error(`GitHub API retornou ${response.status} ao carregar contribuidores.`);
  }

  const payload = (await response.json()) as GitHubContributor[];
  const contributors = payload
    .filter((item) => item.type === "User" && item.avatar_url && !item.login.endsWith("[bot]"))
    .map((item) => ({
      id: item.id,
      login: item.login,
      avatarUrl: item.avatar_url,
      profileUrl: item.html_url,
      contributions: item.contributions,
    }));

  cache.set(cacheKey, contributors);
  return contributors;
}
