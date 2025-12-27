'use client';

import { useEffect, useState } from 'react';
import { fileService, FileItem } from '@/lib/files/file-service';

interface FileListWidgetProps {
	refreshTrigger?: number; // Prop to trigger refresh from parent
}

export function FileListWidget({ refreshTrigger = 0 }: FileListWidgetProps) {
	const [files, setFiles] = useState<FileItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // Filename being deleted

	const loadFiles = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await fileService.getFiles();
			setFiles(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load files');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadFiles();
	}, [refreshTrigger]);

	const handleDelete = async (filename: string) => {
		if (!confirm(`Are you sure you want to delete ${filename}?`)) {
			return;
		}

		setDeleteLoading(filename);
		try {
			await fileService.deleteFile(filename);
			// Refresh list
			await loadFiles();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Delete failed');
		} finally {
			setDeleteLoading(null);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		// You could add a toast notification here
	};

	if (isLoading && files.length === 0) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-6 rounded-xl min-h-[200px] flex items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
			</div>
		);
	}

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-6 rounded-xl">
			<h3 className="text-xl font-bold text-white mb-4">Список файлов ({files.length})</h3>

			{error && (
				<div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm mb-4">
					{error}
				</div>
			)}

			{files.length === 0 ? (
				<p className="text-white/60 text-center py-8">Нет загруженных файлов</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="border-b border-white/10">
								<th className="pb-3 text-sm font-medium text-white/60">Имя файла</th>
								<th className="pb-3 text-sm font-medium text-white/60">URL</th>
								<th className="pb-3 text-sm font-medium text-white/60 text-right">Действия</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{files.map((file) => (
								<tr key={file.filename} className="group hover:bg-white/5 transition-colors">
									<td
										className="py-3 pr-4 text-sm text-white font-medium max-w-[200px] truncate"
										title={file.filename}
									>
										{file.filename}
									</td>
									<td className="py-3 pr-4 text-sm text-white/70 max-w-[300px] truncate">
										<button
											onClick={() => copyToClipboard(file.url)}
											className="hover:text-primary transition-colors flex items-center gap-2"
											title="Click to copy URL"
										>
											<span className="truncate">{file.url}</span>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
												/>
											</svg>
										</button>
									</td>
									<td className="py-3 text-right">
										<button
											onClick={() => handleDelete(file.filename)}
											disabled={deleteLoading === file.filename}
											className="text-red-400 hover:text-red-300 transition-colors text-sm disabled:opacity-50"
										>
											{deleteLoading === file.filename ? 'Удаление...' : 'Удалить'}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
