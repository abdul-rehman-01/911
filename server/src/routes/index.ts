import { Router } from 'express';
import healthRoutes from './healthRoutes.ts';
import vehicleRoutes from './vehicleRoutes.ts';
import brandRoutes from './brandRoutes.ts';
import categoryRoutes from './categoryRoutes.ts';
import serviceRoutes from './serviceRoutes.ts';
import dealerRoutes from './dealerRoutes.ts';
import userRoutes from './userRoutes.ts';
import favoriteRoutes from './favoriteRoutes.ts';
import bookingRoutes from './bookingRoutes.ts';
import contactRoutes from './contactRoutes.ts';
import adminRoutes from './adminRoutes.ts';

const apiV1Router = Router();

// Mount individual domain resources
apiV1Router.use('/health', healthRoutes);
apiV1Router.use('/vehicles', vehicleRoutes);
apiV1Router.use('/brands', brandRoutes);
apiV1Router.use('/categories', categoryRoutes);
apiV1Router.use('/services', serviceRoutes);
apiV1Router.use('/dealers', dealerRoutes);
apiV1Router.use('/users', userRoutes);
apiV1Router.use('/users/:userId/favorites', favoriteRoutes);
apiV1Router.use('/bookings', bookingRoutes);
apiV1Router.use('/contact', contactRoutes);
apiV1Router.use('/admin', adminRoutes);

export default apiV1Router;
