import { useApp } from './AppContext';
export { AppProvider, useApp, INITIAL_FILTER_STATE } from './AppContext';

export function useVehicles() {
  const {
    vehicles,
    selectedVehicleId,
    selectedVehicle,
    setSelectedVehicleId,
    recentlyViewedVehicles,
    recordVehicleView,
    getVehicleById,
    getSimilarVehicles,
  } = useApp();

  return {
    vehicles,
    selectedVehicleId,
    selectedVehicle,
    setSelectedVehicleId,
    recentlyViewedVehicles,
    recordVehicleView,
    getVehicleById,
    getSimilarVehicles,
  };
}

export function useFilters() {
  const {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    filteredVehicles,
    activeFilterCount,
  } = useApp();

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    filteredVehicles,
    activeFilterCount,
  };
}

export function useFavorites() {
  const {
    favorites,
    favoriteVehicles,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  } = useApp();

  return {
    favorites,
    favoriteVehicles,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  };
}

export function useComparison() {
  const {
    comparedIds,
    comparedVehicles,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    isCompared,
    clearComparison,
  } = useApp();

  return {
    comparedIds,
    comparedVehicles,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    isCompared,
    clearComparison,
    count: comparedIds.length,
  };
}

export function useBookings() {
  const { bookings, createBooking, updateBookingStatus, cancelBooking } = useApp();

  return {
    bookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
  };
}

export function useRecentlyViewed() {
  const { recentlyViewedIds, recentlyViewedVehicles, recordVehicleView, clearRecentlyViewed } = useApp();

  return {
    recentlyViewedIds,
    recentlyViewedVehicles,
    recordVehicleView,
    clearRecentlyViewed,
    count: recentlyViewedIds.length,
  };
}

export function useAuth() {
  const {
    session,
    loginAs,
    loginWithCredentials,
    registerUser,
    updateProfile,
    logout,
  } = useApp();

  return {
    session,
    user: session.user,
    role: session.role,
    isAuthenticated: session.isAuthenticated,
    isGuest: session.role === 'guest',
    isMember: session.role === 'member',
    isAdmin: session.role === 'admin',
    loginAs,
    loginWithCredentials,
    registerUser,
    updateProfile,
    logout,
  };
}
