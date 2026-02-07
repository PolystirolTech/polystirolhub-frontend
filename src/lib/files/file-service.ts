export interface FileItem {
	filename: string;
	url: string;
	size?: number; // Optional as per API description "List of files with URLs, sizes, and timestamps" implies it might be there
	timestamp?: string;
}

export interface UploadResponse {
	filename: string;
	url: string;
}

class FileService {
	/**
	 * Upload a file to the server
	 */
	async uploadFile(file: File): Promise<UploadResponse> {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch(`${baseUrl}/api/v1/files/upload`, {
				method: 'POST',
				credentials: 'include', // Important for admin token in cookies
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.detail || 'Failed to upload file');
			}

			return await response.json();
		} catch (error) {
			console.error('File upload failed:', error);
			throw error;
		}
	}

	/**
	 * Get list of uploaded files
	 */
	async getFiles(): Promise<FileItem[]> {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

		try {
			const response = await fetch(`${baseUrl}/api/v1/files/`, {
				method: 'GET',
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error('Failed to fetch files');
			}

			return await response.json();
		} catch (error) {
			console.error('Failed to get files:', error);
			throw error;
		}
	}

	/**
	 * Delete a file
	 */
	async deleteFile(filename: string): Promise<void> {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

		try {
			const response = await fetch(`${baseUrl}/api/v1/files/${filename}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.detail || 'Failed to delete file');
			}
		} catch (error) {
			console.error('Failed to delete file:', error);
			throw error;
		}
	}
}

export const fileService = new FileService();
