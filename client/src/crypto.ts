export const GENERATE_ALGORITHM: RsaHashedKeyGenParams = {
  name: "RSA-PSS",
  modulusLength: 512,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
}

export const IMPORT_ALGORITHM: RsaHashedImportParams = {
  name: GENERATE_ALGORITHM.name,
  hash: GENERATE_ALGORITHM.hash,
}

export const ALGORITHM_IDENTIFIER: AlgorithmIdentifier = {
  name: GENERATE_ALGORITHM.name,
  // @ts-ignore
  saltLength: 4,
}

const USAGES: KeyUsage[] = ["sign", "verify"]

const EXTRACTABLE = true

const FORMAT: "raw" | "pkcs8" | "spki" | "jwk" = "jwk"

export let keys: CryptoKeyPair

export const generateRSAKeypair = (): Promise<CryptoKeyPair> => {
  return crypto.subtle.generateKey(
    GENERATE_ALGORITHM,
    EXTRACTABLE,
    USAGES,
  )
}

export const importRSAKey = async (json: string): Promise<CryptoKey> => {
  const jwk: JsonWebKey = JSON.parse(String(json))

  return await crypto.subtle.importKey(
    FORMAT, 
    jwk, 
    IMPORT_ALGORITHM, 
    EXTRACTABLE, 
    jwk.key_ops as KeyUsage[],
  )
}

export const exportRSAKey = async (key: CryptoKey): Promise<string> => {
  const jwk = await crypto.subtle.exportKey(FORMAT, key)

  return JSON.stringify(jwk)
}

export const cryptoTask = (async () => {
  if (!localStorage.privateKey || !localStorage.publicKey) {
    keys = await generateRSAKeypair()

    localStorage.privateKey = await exportRSAKey(keys.privateKey)
    localStorage.publicKey = await exportRSAKey(keys.publicKey)
  } else {
    keys = {
      privateKey: await importRSAKey(localStorage.privateKey),
      publicKey: await importRSAKey(localStorage.publicKey)
    }
  }
})().catch(console.trace)
