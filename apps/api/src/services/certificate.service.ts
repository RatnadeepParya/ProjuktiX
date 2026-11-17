import { db } from '../config/firebase.js';
import { Certificate } from '@projuktix/types';
import { NotFoundError } from '@projuktix/shared';

export class CertificateService {
  static async verifyCertificate(idOrNumber: string): Promise<Certificate> {
    // Try document ID first
    let doc = await db.collection('certificates').doc(idOrNumber).get();
    if (!doc.exists) {
      // Try certificateNumber
      const snap = await db.collection('certificates').where('certificateNumber', '==', idOrNumber).limit(1).get();
      if (snap.empty) {
        throw new NotFoundError('Certificate', idOrNumber);
      }
      doc = snap.docs[0]!;
    }
    return doc.data() as Certificate;
  }

  static async listUserCertificates(userId: string): Promise<Certificate[]> {
    const snap = await db.collection('certificates').where('userId', '==', userId).orderBy('issuedAt', 'desc').get();
    return snap.docs.map((d) => d.data() as Certificate);
  }
}
