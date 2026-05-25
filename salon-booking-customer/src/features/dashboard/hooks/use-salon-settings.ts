import { useState, useCallback, useEffect } from 'react';
import type {
  SalonSettings,
  SalonProfile,
  ServiceCategory,
  Service,
  StaffMember,
  AddOnProduct,
} from '@/features/dashboard/types/settings.types';
import { mockSalonSettings } from '@/features/dashboard/mocks/settings-mock';

interface UseSalonSettingsReturn {
  settings: SalonSettings | null;
  loading: boolean;
  error: string | null;

  // Profile methods
  updateProfile: (profile: SalonProfile) => Promise<void>;

  // Service Category methods
  addServiceCategory: (category: Omit<ServiceCategory, 'id'>) => Promise<ServiceCategory>;
  updateServiceCategory: (id: string, category: Omit<ServiceCategory, 'id'>) => Promise<void>;
  deleteServiceCategory: (id: string) => Promise<void>;

  // Service methods
  addService: (service: Omit<Service, 'id'>) => Promise<Service>;
  updateService: (id: string, service: Omit<Service, 'id'>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Staff methods
  addStaffMember: (staff: Omit<StaffMember, 'id'>) => Promise<StaffMember>;
  updateStaffMember: (id: string, staff: Omit<StaffMember, 'id'>) => Promise<void>;
  deleteStaffMember: (id: string) => Promise<void>;

  // Add-on methods
  addAddOn: (addOn: Omit<AddOnProduct, 'id'>) => Promise<AddOnProduct>;
  updateAddOn: (id: string, addOn: Omit<AddOnProduct, 'id'>) => Promise<void>;
  deleteAddOn: (id: string) => Promise<void>;
}

export function useSalonSettings(): UseSalonSettingsReturn {
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data from mock (in future, from API)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSettings(mockSalonSettings);
        setError(null);
      } catch (err) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Profile methods
  const updateProfile = useCallback(async (profile: SalonProfile) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSettings((prev) => prev ? { ...prev, profile } : null);
    } catch (err) {
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Service Category methods
  const addServiceCategory = useCallback(
    async (category: Omit<ServiceCategory, 'id'>) => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newCategory: ServiceCategory = {
          ...category,
          id: `cat-${Date.now()}`,
        };
        setSettings((prev) =>
          prev
            ? { ...prev, serviceCategories: [...prev.serviceCategories, newCategory] }
            : null
        );
        return newCategory;
      } catch (err) {
        setError('Failed to add category');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateServiceCategory = useCallback(
    async (id: string, category: Omit<ServiceCategory, 'id'>) => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                serviceCategories: prev.serviceCategories.map((c) =>
                  c.id === id ? { ...c, ...category } : c
                ),
              }
            : null
        );
      } catch (err) {
        setError('Failed to update category');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteServiceCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              serviceCategories: prev.serviceCategories.filter((c) => c.id !== id),
            }
          : null
      );
    } catch (err) {
      setError('Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Service methods
  const addService = useCallback(
    async (service: Omit<Service, 'id'>) => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newService: Service = {
          ...service,
          id: `svc-${Date.now()}`,
        };
        setSettings((prev) =>
          prev ? { ...prev, services: [...prev.services, newService] } : null
        );
        return newService;
      } catch (err) {
        setError('Failed to add service');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateService = useCallback(
    async (id: string, service: Omit<Service, 'id'>) => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                services: prev.services.map((s) =>
                  s.id === id ? { ...s, ...service } : s
                ),
              }
            : null
        );
      } catch (err) {
        setError('Failed to update service');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteService = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              services: prev.services.filter((s) => s.id !== id),
            }
          : null
      );
    } catch (err) {
      setError('Failed to delete service');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Staff methods
  const addStaffMember = useCallback(
    async (staff: Omit<StaffMember, 'id'>) => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newStaff: StaffMember = {
          ...staff,
          id: `staff-${Date.now()}`,
        };
        setSettings((prev) => (prev ? { ...prev, staff: [...prev.staff, newStaff] } : null));
        return newStaff;
      } catch (err) {
        setError('Failed to add staff member');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateStaffMember = useCallback(
    async (id: string, staff: Omit<StaffMember, 'id'>) => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                staff: prev.staff.map((s) => (s.id === id ? { ...s, ...staff } : s)),
              }
            : null
        );
      } catch (err) {
        setError('Failed to update staff member');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteStaffMember = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              staff: prev.staff.filter((s) => s.id !== id),
            }
          : null
      );
    } catch (err) {
      setError('Failed to delete staff member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add-on methods
  const addAddOn = useCallback(
    async (addOn: Omit<AddOnProduct, 'id'>) => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newAddOn: AddOnProduct = {
          ...addOn,
          id: `addon-${Date.now()}`,
        };
        setSettings((prev) => (prev ? { ...prev, addOns: [...prev.addOns, newAddOn] } : null));
        return newAddOn;
      } catch (err) {
        setError('Failed to add add-on');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAddOn = useCallback(
    async (id: string, addOn: Omit<AddOnProduct, 'id'>) => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                addOns: prev.addOns.map((a) => (a.id === id ? { ...a, ...addOn } : a)),
              }
            : null
        );
      } catch (err) {
        setError('Failed to update add-on');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteAddOn = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              addOns: prev.addOns.filter((a) => a.id !== id),
            }
          : null
      );
    } catch (err) {
      setError('Failed to delete add-on');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    updateProfile,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    addService,
    updateService,
    deleteService,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    addAddOn,
    updateAddOn,
    deleteAddOn,
  };
}
