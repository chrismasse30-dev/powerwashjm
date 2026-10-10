import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

class GoogleDriveService {
  private isInitialized = false;
  private isSignedIn = false;

  async initialize() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

            console.log('Initializing Google Drive with:', {
              apiKeyPresent: !!apiKey,
              clientIdPresent: !!clientId,
              origin: window.location.origin
            });

            if (!apiKey || !clientId) {
              throw new Error('Google API credentials not configured. Please check your .env file.');
            }

            await window.gapi.client.init({
              apiKey,
              clientId,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES,
            });

            const authInstance = window.gapi.auth2.getAuthInstance();
            this.isSignedIn = authInstance.isSignedIn.get();
            this.isInitialized = true;
            resolve(true);
          } catch (error: any) {
            console.error('Google API initialization failed:', error);
            if (error.details) {
              console.error('Error details:', error.details);
            }
            reject(error);
          }
        });
      };
      script.onerror = (error) => {
        console.error('Failed to load Google API script:', error);
        reject(new Error('Failed to load Google API. Please check your internet connection.'));
      };
      document.body.appendChild(script);
    });
  }

  async signIn() {
    await this.initialize();
    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signIn();
    this.isSignedIn = true;
  }

  async listFiles(folderId: string) {
    try {
      await this.initialize();

      if (!this.isSignedIn) {
        await this.signIn();
      }

      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
        fields: 'files(id, name, thumbnailLink, webContentLink, mimeType, size)',
        pageSize: 100,
      });

      return response.result.files || [];
    } catch (error: any) {
      console.error('Google Drive API Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      if (error?.result?.error?.message) {
        throw new Error(`Google Drive API: ${error.result.error.message}`);
      }
      if (error?.error) {
        throw new Error(`Google API Error: ${error.error}`);
      }
      if (error?.message) {
        throw new Error(error.message);
      }
      throw new Error('Failed to load files from Google Drive. Please check console for details.');
    }
  }

  async downloadAndUploadFile(fileId: string, fileName: string, importedBy: string) {
    const blob = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`,
        },
      }
    ).then((r) => r.blob());

    const fileExt = fileName.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('holiday-gallery')
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('holiday-gallery')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('holiday_gallery_photos')
      .insert({
        image_url: urlData.publicUrl,
        title: fileName,
        google_drive_file_id: fileId,
        imported_by: importedBy,
        import_source: 'google_drive',
        display_order: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  getAuthStatus() {
    return this.isSignedIn;
  }
}

export const googleDriveService = new GoogleDriveService();
