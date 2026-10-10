import { supabase } from '../lib/supabase';

export interface GalleryPhoto {
  id: string;
  image_url: string;
  title: string;
  description: string;
  uploaded_at: string;
  display_order: number;
  is_featured: boolean;
  google_drive_file_id?: string;
  imported_by?: string;
  import_source: string;
  town?: string | null;
  service_type?: string | null;
}

export const galleryService = {
  async getAllPhotos(): Promise<GalleryPhoto[]> {
    const { data, error } = await supabase
      .from('holiday_gallery_photos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPhotosByTown(townSlug: string, minCount = 3): Promise<GalleryPhoto[]> {
    const { data: townPhotos, error } = await supabase
      .from('holiday_gallery_photos')
      .select('*')
      .eq('town', townSlug)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true });

    if (error) throw error;
    const photos = townPhotos || [];

    if (photos.length >= minCount) return photos;

    const existingIds = photos.map(p => p.id);
    const needed = minCount - photos.length;
    const hashCode = townSlug.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

    const { data: pool } = await supabase
      .from('holiday_gallery_photos')
      .select('*')
      .order('display_order', { ascending: true });

    if (pool) {
      const available = pool.filter(p => !existingIds.includes(p.id));
      const offset = Math.abs(hashCode) % Math.max(available.length, 1);
      for (let i = 0; i < needed && i < available.length; i++) {
        photos.push(available[(offset + i) % available.length]);
      }
    }

    return photos;
  },

  async addPhoto(photo: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
    const { data, error } = await supabase
      .from('holiday_gallery_photos')
      .insert(photo)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePhoto(id: string, updates: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
    const { data, error } = await supabase
      .from('holiday_gallery_photos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePhoto(id: string): Promise<void> {
    const { error } = await supabase
      .from('holiday_gallery_photos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async checkDuplicateByDriveId(driveId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('holiday_gallery_photos')
      .select('id')
      .eq('google_drive_file_id', driveId)
      .maybeSingle();

    return !!data && !error;
  },
};
