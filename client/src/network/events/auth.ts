import { ab2str, ALGORITHM_IDENTIFIER, keys } from "../../crypto"

export const signChallenge = async (challenge: string): Promise<string> => {
  return btoa(ab2str(await crypto.subtle.sign(
    ALGORITHM_IDENTIFIER,
    keys.privateKey,
    new TextEncoder().encode(challenge),
  )))
}
