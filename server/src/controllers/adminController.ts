import { Request, Response, NextFunction } from 'express';
import { vehicleRepository } from '../repositories/vehicleRepository.ts';
import { brandRepository } from '../repositories/brandRepository.ts';
import { categoryRepository } from '../repositories/categoryRepository.ts';
import { serviceRepository } from '../repositories/serviceRepository.ts';
import { dealerRepository } from '../repositories/dealerRepository.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { bookingRepository } from '../repositories/bookingRepository.ts';
import { contactRepository } from '../repositories/contactRepository.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export const adminController = {
  async getDashboardStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [vehiclesResult, brands, categories, services, dealers, users, bookings, contacts] =
        await Promise.all([
          vehicleRepository.findAll({ limit: 100 }),
          brandRepository.findAll(),
          categoryRepository.findAll(),
          serviceRepository.findAll({}),
          dealerRepository.findAll({}),
          userRepository.findAll(),
          bookingRepository.findAll({}),
          contactRepository.findAll(),
        ]);

      const vehicles = vehiclesResult.data;
      const totalFleetValuationUsd = vehicles.reduce((sum, v) => sum + (v.priceUsd || 0), 0);
      const totalFleetHorsepower = vehicles.reduce((sum, v) => sum + (v.telemetry?.outputHp || 0), 0);
      const certifiedVehiclesCount = vehicles.filter((v) => v.isCertified).length;

      const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
      const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed').length;
      const completedBookings = bookings.filter((b) => b.status === 'Completed').length;
      const cancelledBookings = bookings.filter((b) => b.status === 'Cancelled').length;

      const unreadContacts = contacts.filter((c) => c.status === 'unread').length;

      const stats = {
        catalog: {
          totalVehicles: vehicles.length,
          totalValuationUsd: totalFleetValuationUsd,
          totalHorsepower: totalFleetHorsepower,
          certifiedCount: certifiedVehiclesCount,
          brandsCount: brands.length,
          categoriesCount: categories.length,
        },
        operations: {
          servicesCount: services.length,
          dealersCount: dealers.length,
          totalBookings: bookings.length,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
        },
        users: {
          totalUsers: users.length,
          adminCount: users.filter((u) => u.role === 'admin').length,
          memberCount: users.filter((u) => u.role !== 'admin').length,
        },
        communications: {
          totalInquiries: contacts.length,
          unreadInquiries: unreadContacts,
        },
        recentBookings: bookings.slice(0, 5),
        recentInquiries: contacts.slice(0, 5),
        systemHealth: {
          status: 'operational',
          databaseEngine: 'PostgreSQL (Drizzle ORM)',
          architecture: 'Tier-1 High Availability',
          timestamp: new Date().toISOString(),
        },
      };

      return sendSuccess({
        res,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  },
};
