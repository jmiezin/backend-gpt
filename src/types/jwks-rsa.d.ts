// src/types/jwks-rsa.d.ts
declare module "jwks-rsa" {
  import { SecretCallbackLong } from "jsonwebtoken";

  export interface JwksClientOptions {
    cache?: boolean;
    rateLimit?: boolean;
    jwksRequestsPerMinute?: number;
    jwksUri: string;
  }

  // On déclare expressJwtSecret comme une fonction qui retourne un SecretCallbackLong
  export function expressJwtSecret(opts: JwksClientOptions): SecretCallbackLong;

  // … vous pouvez ajouter d’autres signatures si vous en avez besoin
  const jwksRsa: {
    expressJwtSecret(opts: JwksClientOptions): SecretCallbackLong;
  };
  export default jwksRsa;
}