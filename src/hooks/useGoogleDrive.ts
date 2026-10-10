import { useState, useCallback } from 'react';
import { googleDriveService } from '../services/googleDriveService';
import { galleryService } from '../services/galleryService';
import { useAuth } from '../contexts/AuthContext';

export function useGoogleDrive() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const signIn = useCallback(async () => {
    try {
      setLoading(true);
      await googleDriveService.signIn();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Google Drive sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const listFiles = useCallback(async (folderId: string) => {
    try {
      setLoading(true);
      return await googleDriveService.listFiles(folderId);
    } catch (error) {
      console.error('Failed to list files:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (fileId: string, fileName: string) => {
    try {
      const isDuplicate = await galleryService.checkDuplicateByDriveId(fileId);
      if (isDuplicate) {
        console.log(`Skipping duplicate: ${fileName}`);
        return null;
      }

      return await googleDriveService.downloadAndUploadFile(
        fileId,
        fileName,
        user?.email || 'unknown'
      );
    } catch (error) {
      console.error(`Failed to download file ${fileName}:`, error);
      throw error;
    }
  }, [user]);

  return {
    isAuthenticated,
    loading,
    signIn,
    listFiles,
    downloadFile,
  };
}
