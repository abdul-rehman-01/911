import { desc, eq } from 'drizzle-orm';
import { ContactSubmission } from '../models/index.ts';
import { db, schema } from '../db/index.ts';

const DEMO_CONTACTS: ContactSubmission[] = [
  {
    id: 'contact-demo-1',
    name: 'Julian Vance',
    email: 'julian.vance@vanceholdings.ch',
    phone: '+41 22 555 8820',
    subject: 'Inquiry on Porsche 911 GT3 RS Allocation',
    message: 'Seeking allocation window for Weissach package chassis. Requesting telemetry sheet and direct atelier inspection in Zurich/Stuttgart.',
    inquiryType: 'Allocation Acquisition',
    vehicleOfInterest: 'v-porsche-911-gt3-rs',
    status: 'unread',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'contact-demo-2',
    name: 'Helena Berg',
    email: 'hberg@apexcapital.de',
    phone: '+49 89 2020 4401',
    subject: 'Private Trackside Support for Nürburgring Session',
    message: 'We have reserved the Nordschleife for private manufacturer telemetry benchmarking next month and need the mobile dyno van and track engineers.',
    inquiryType: 'Track Support',
    status: 'unread',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'contact-demo-3',
    name: 'Marcus Sterling',
    email: 'msterling@mayfairmotors.co.uk',
    phone: '+44 20 7946 0912',
    subject: 'Pre-Purchase Dynamometer Certification',
    message: 'Client requires ECU validation and acoustic spectrum dyno run for 2024 Aston Martin Vantage prior to wire transfer settlement.',
    inquiryType: 'Inspection & Certification',
    vehicleOfInterest: 'v-aston-martin-vantage',
    status: 'read',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export class ContactRepository {
  private inMemorySubmissions: ContactSubmission[] = [...DEMO_CONTACTS];

  public async create(data: Omit<ContactSubmission, 'id' | 'createdAt'>): Promise<ContactSubmission> {
    const record: ContactSubmission = {
      id: `contact-${Date.now()}`,
      status: 'unread',
      ...data,
      createdAt: new Date().toISOString(),
    };

    // 1. In-memory log
    this.inMemorySubmissions.unshift(record);

    // 2. PostgreSQL persistence
    if (db) {
      try {
        await db.insert(schema.contactMessages).values({
          id: record.id,
          name: record.name,
          email: record.email,
          phone: record.phone,
          subject: record.subject,
          message: record.message,
          inquiryType: record.inquiryType,
          vehicleOfInterest: record.vehicleOfInterest,
          status: 'unread',
          createdAt: new Date(),
        });
      } catch (err: any) {
        console.warn('[ContactRepository] DB insert failed, held in memory:', err.message);
      }
    }

    return record;
  }

  public async findAll(): Promise<ContactSubmission[]> {
    if (db) {
      try {
        const rows = await db
          .select()
          .from(schema.contactMessages)
          .orderBy(desc(schema.contactMessages.createdAt));

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone || undefined,
            subject: r.subject,
            message: r.message,
            inquiryType: r.inquiryType || undefined,
            vehicleOfInterest: r.vehicleOfInterest || undefined,
            status: (r.status as any) || 'unread',
            createdAt: r.createdAt.toISOString(),
          }));
        }
      } catch (err: any) {
        console.warn('[ContactRepository] DB findAll failed, using memory list:', err.message);
      }
    }

    return [...this.inMemorySubmissions];
  }

  public async updateStatus(id: string, status: 'unread' | 'read' | 'archived'): Promise<ContactSubmission | null> {
    if (db) {
      try {
        await db.update(schema.contactMessages).set({ status }).where(eq(schema.contactMessages.id, id));
      } catch (err: any) {
        console.warn('[ContactRepository] DB update status failed, using memory:', err.message);
      }
    }

    const item = this.inMemorySubmissions.find((s) => s.id === id);
    if (!item) return null;
    item.status = status;
    return { ...item };
  }

  public async delete(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, id));
      } catch (err: any) {
        console.warn('[ContactRepository] DB delete failed, using memory:', err.message);
      }
    }

    const idx = this.inMemorySubmissions.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.inMemorySubmissions.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const contactRepository = new ContactRepository();
