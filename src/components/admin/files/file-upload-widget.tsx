'use client';

import { useState } from 'react';
import { fileService } from '@/lib/files/file-service';

interface FileUploadWidgetProps {
	onUploadSuccess?: () => void;
}

export function FileUploadWidget({ onUploadSuccess }: FileUploadWidgetProps) {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
			setError(null);
			setSuccessMessage(null);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setIsUploading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			await fileService.uploadFile(file);
			setSuccessMessage(`File "${file.name}" uploaded successfully!`);
			setFile(null);
			// Reset input
			const fileInput = document.getElementById('file-upload') as HTMLInputElement;
			if (fileInput) fileInput.value = '';

			if (onUploadSuccess) {
				onUploadSuccess();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed');
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-6 rounded-xl">
			<h3 className="text-xl font-bold text-white mb-4">Загрузка файла</h3>

			<div className="space-y-4">
				<div className="flex flex-col gap-2">
					<label htmlFor="file-upload" className="text-sm text-white/70">
						Выберите файл
					</label>
					<input
						id="file-upload"
						type="file"
						onChange={handleFileChange}
						disabled={isUploading}
						className="block w-full text-sm text-white/70
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary file:text-white
                            hover:file:bg-primary/80
                            cursor-pointer"
					/>
				</div>

				{error && (
					<div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
						{error}
					</div>
				)}

				{successMessage && (
					<div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
						{successMessage}
					</div>
				)}

				<button
					onClick={handleUpload}
					disabled={!file || isUploading}
					className={`px-4 py-2 rounded-lg font-medium transition-all w-full sm:w-auto
                        ${
													!file || isUploading
														? 'bg-white/10 text-white/40 cursor-not-allowed'
														: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
												}`}
				>
					{isUploading ? 'Загрузка...' : 'Загрузить файл'}
				</button>
			</div>
		</div>
	);
}
