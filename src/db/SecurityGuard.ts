import argon2 from 'argon2';
import crypto from 'crypto';

export default class SecurityGuard {
    static async getHash(key: string, salt: string) {
        const rawSalt = Buffer.from(salt);
        const rawHash = await argon2.hash(key, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            hashLength: 64,
            salt: rawSalt,
            raw: true // get raw binary hash
        });

        return Buffer.from(rawHash).toString('base64');
    }

// key should be original master password
    static getEncrypted(key: string, data: any) {
        const iv = crypto.randomBytes(32);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const authTag = cipher.getAuthTag().toString('base64');
        return { iv: iv.toString('base64'), data: encrypted, auth: authTag };
    }

    static getDecrypted(key: string, data: any, iv: string, auth: string) {
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
        decipher.setAuthTag(Buffer.from(auth, 'base64'));
        let decrypted = decipher.update(data, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
// to save master password
