export function getUserAvatarUrl(userCode?: string, avatarUrl?: string | null) {
  if (avatarUrl) {
    return avatarUrl;
  }

  if (userCode === "haris") {
    return "/avatars/haris.webp";
  }

  if (userCode === "hashim") {
    return "/avatars/hashim.webp";
  }

  return null;
}
