export const GENERATE_ALGORITHM: RsaHashedKeyGenParams = {
  name: "RSA-PSS",
  modulusLength: 512,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: 'SHA-256',
}

export const IMPORT_ALGORITHM: RsaHashedImportParams = {
  name: "RSASSA-PKCS1-v1_5",
  hash: GENERATE_ALGORITHM.hash,
}

export const ALGORITHM_IDENTIFIER: AlgorithmIdentifier = {
  name: "RSASSA-PKCS1-v1_5",
  // @ts-ignore
  saltLength: 4,
}

export const ab2str = (buffer: ArrayBuffer): string => {
  return String.fromCharCode.apply(null, new Uint8Array(buffer))
}

export const str2ab = (string: string): ArrayBuffer => {
  const buf = new ArrayBuffer(string.length)
  const bufView = new Uint8Array(buf)

  for (let i = 0, strLen = string.length; i < strLen; i++) {
    bufView[i] = string.charCodeAt(i)
  }
  
  return buf
}

export let keys: CryptoKeyPair

export const generateRSAKeypair = (): Promise<CryptoKeyPair> => {
  return crypto.subtle.generateKey(
    GENERATE_ALGORITHM,
    true,
    ["sign", "verify"],
  )
}

export const importRSAKey = async (
  base64: string, 
  format: "pkcs8" | "spki",
  usages: KeyUsage[],
): Promise<CryptoKey> => {
  const keyBuffer = str2ab(atob(base64))

  return await crypto.subtle.importKey(
    format, 
    keyBuffer, 
    IMPORT_ALGORITHM, 
    true, 
    usages,
  )
}

export const exportRSAKey = async (
  key: CryptoKey, 
  format:  "pkcs8" | "spki",
): Promise<string> => {
  const keyBuffer = await crypto.subtle.exportKey(format, key)

  const base64 = btoa(ab2str(keyBuffer))

  return base64
}

export const cryptoTask = async () => {
  try {
    if (!localStorage.privateKey || !localStorage.publicKey) {
      const generatedKeys = await generateRSAKeypair()
  
      localStorage.privateKey = await exportRSAKey(generatedKeys.privateKey, "pkcs8")
      localStorage.publicKey = await exportRSAKey(generatedKeys.publicKey, "spki")
    }
  
    keys = {
      privateKey: await importRSAKey(localStorage.privateKey, "pkcs8", ["sign"]),
      publicKey: await importRSAKey(localStorage.publicKey, "spki", ["verify"])
    }
  } catch (error) {
    console.error(error)
  }
}
