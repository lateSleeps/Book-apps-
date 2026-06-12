import { db } from '../../db';
import { handleDbError } from '../lib/errors';
import type {
  ServiceCategory,
  ServiceFlow,
  ServiceItem,
  ServicePriceType,
  ServiceQuestion,
  QuestionType,
} from '@/features/dashboard/components/settings/types/services.types';

// ── Slugify ───────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'category';
}

// ── DB row shapes ─────────────────────────────────────────────────────────────

// Only columns this domain reads/writes. No select(*).

interface ServiceCategoryRow {
  id: string;
  name: string;
  description: string;
  // DB column is `icon` (customer app: categories(id, name, slug, description, icon, color))
  icon: string;
  color: string;
  blob_color: string;
  is_active: boolean;
  sort_order: number;
}

/**
 * Service questions stored as jsonb in services.service_questions.
 * Using camelCase internally (owner-written data) for trivial mapping.
 */
interface ServiceQuestionJson {
  id: string;
  serviceId: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  sortOrder: number;
  isActive: boolean;
}

interface ServiceItemRow {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  price_type: string;
  service_flow: string;
  requires_specialist: boolean;
  is_active: boolean;
  sort_order: number;
  service_questions: ServiceQuestionJson[] | null;
}

// ── Column lists ──────────────────────────────────────────────────────────────

const CATEGORY_COLUMNS = [
  'id',
  'name',
  'description',
  'icon',
  'color',
  'blob_color',
  'is_active',
  'sort_order',
].join(', ');

const SERVICE_COLUMNS = [
  'id',
  'category_id',
  'name',
  'description',
  'price',
  'duration',
  'price_type',
  'service_flow',
  'requires_specialist',
  'is_active',
  'sort_order',
  'service_questions',
].join(', ');

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToCategory(row: ServiceCategoryRow): ServiceCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    iconName: row.icon,
    color: row.color,
    blobColor: row.blob_color,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

function rowToQuestion(q: ServiceQuestionJson, serviceId: string): ServiceQuestion {
  return {
    id: q.id,
    serviceId,
    label: q.label,
    type: q.type as QuestionType,
    required: q.required,
    options: q.options ?? [],
    sortOrder: q.sortOrder,
    isActive: q.isActive,
  };
}

function rowToService(row: ServiceItemRow): ServiceItem {
  const questions = (row.service_questions ?? []).map((q) => rowToQuestion(q, row.id));
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description ?? '',
    price: row.price,
    duration: row.duration,
    priceType: row.price_type as ServicePriceType,
    serviceFlow: row.service_flow as ServiceFlow,
    requiresSpecialist: row.requires_specialist,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    questions,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getCategories(salonId: string): Promise<ServiceCategory[]> {
  const { data, error } = await db
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .eq('salon_id', salonId)
    .order('sort_order', { ascending: true });

  if (error) throw handleDbError(error);
  return (data as unknown as ServiceCategoryRow[]).map(rowToCategory);
}

export async function getServices(salonId: string): Promise<ServiceItem[]> {
  const { data, error } = await db
    .from('services')
    .select(SERVICE_COLUMNS)
    .eq('salon_id', salonId)
    .order('sort_order', { ascending: true });

  if (error) throw handleDbError(error);
  return (data as unknown as ServiceItemRow[]).map(rowToService);
}

// ── Category mutations ────────────────────────────────────────────────────────

export async function createCategory(
  salonId: string,
  draft: Omit<ServiceCategory, 'id' | 'sortOrder'>,
  sortOrder: number
): Promise<ServiceCategory> {
  const slug = slugify(draft.name);

  const { data, error } = await db
    .from('categories')
    .insert({
      salon_id: salonId,
      name: draft.name,
      description: draft.description,
      slug,
      icon: draft.iconName,
      color: draft.color,
      blob_color: draft.blobColor,
      is_active: draft.isActive,
      sort_order: sortOrder,
    })
    .select(CATEGORY_COLUMNS)
    .single();

  if (error) throw handleDbError(error);
  return rowToCategory(data as unknown as ServiceCategoryRow);
}

export async function updateCategory(
  salonId: string,
  id: string,
  patch: Partial<Omit<ServiceCategory, 'id'>>
): Promise<void> {
  // Never update slug — customer app uses it in URLs.
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.iconName !== undefined) update.icon = patch.iconName;
  if (patch.color !== undefined) update.color = patch.color;
  if (patch.blobColor !== undefined) update.blob_color = patch.blobColor;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder;

  if (Object.keys(update).length === 0) return;

  const { error } = await db.from('categories').update(update).eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

export async function deleteCategory(salonId: string, id: string): Promise<void> {
  // Cascade: delete services first (cannot assume DB CASCADE is configured).
  const { error: svcError } = await db
    .from('services')
    .delete()
    .eq('category_id', id)
    .eq('salon_id', salonId);

  if (svcError) throw handleDbError(svcError);

  const { error } = await db.from('categories').delete().eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

// ── Service mutations ─────────────────────────────────────────────────────────

export async function createService(
  salonId: string,
  draft: Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>,
  sortOrder: number
): Promise<ServiceItem> {
  const { data, error } = await db
    .from('services')
    .insert({
      salon_id: salonId,
      category_id: draft.categoryId,
      name: draft.name,
      description: draft.description,
      price: draft.price,
      duration: draft.duration,
      price_type: draft.priceType,
      service_flow: draft.serviceFlow,
      requires_specialist: draft.requiresSpecialist,
      is_active: draft.isActive,
      sort_order: sortOrder,
      service_questions: [],
    })
    .select(SERVICE_COLUMNS)
    .single();

  if (error) throw handleDbError(error);
  return rowToService(data as unknown as ServiceItemRow);
}

export async function updateService(
  salonId: string,
  id: string,
  patch: Partial<Omit<ServiceItem, 'id'>>
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.categoryId !== undefined) update.category_id = patch.categoryId;
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.price !== undefined) update.price = patch.price;
  if (patch.duration !== undefined) update.duration = patch.duration;
  if (patch.priceType !== undefined) update.price_type = patch.priceType;
  if (patch.serviceFlow !== undefined) update.service_flow = patch.serviceFlow;
  if (patch.requiresSpecialist !== undefined) update.requires_specialist = patch.requiresSpecialist;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder;
  if (patch.questions !== undefined) {
    // Map ServiceQuestion[] → ServiceQuestionJson[] for jsonb storage.
    update.service_questions = patch.questions.map(
      (q): ServiceQuestionJson => ({
        id: q.id,
        serviceId: q.serviceId,
        label: q.label,
        type: q.type,
        required: q.required,
        options: q.options,
        sortOrder: q.sortOrder,
        isActive: q.isActive,
      })
    );
  }

  if (Object.keys(update).length === 0) return;

  const { error } = await db.from('services').update(update).eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

export async function deleteService(salonId: string, id: string): Promise<void> {
  const { error } = await db.from('services').delete().eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}
