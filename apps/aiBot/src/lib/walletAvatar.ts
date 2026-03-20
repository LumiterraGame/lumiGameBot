const WALLET_AVATARS = [
  "/asset/img/avatarIcon/avatar-1.png",
  "/asset/img/avatarIcon/avatar-2.png",
  "/asset/img/avatarIcon/avatar-3.png",
  "/asset/img/avatarIcon/avatar-4.png",
  "/asset/img/avatarIcon/avatar-5.png",
  "/asset/img/avatarIcon/avatar-6.png"
];

export function getWalletAvatar(address: string) {
  const normalized = address.toLowerCase();
  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(index);
    hash |= 0;
  }

  return WALLET_AVATARS[Math.abs(hash) % WALLET_AVATARS.length];
}
