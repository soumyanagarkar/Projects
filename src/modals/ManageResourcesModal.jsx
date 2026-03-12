import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiLink, FiFile, FiLoader } from 'react-icons/fi';

const ManageResourcesModal = ({ isOpen, onClose, project, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [newLink, setNewLink] = useState('');
    const [files, setFiles] = useState(null);
    const getAuthToken = () => {
        try {
            const token = localStorage.getItem("token");
            if (token) return token;
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                return parsed?.state?.token;
            }
        } catch (e) {
            console.error("Token parsing error:", e);
        }
        return null;
    };
    const getFullUrl = (url) => {
        if (!url || typeof url !== 'string') return '';
        if (!(url.startsWith('http://') || url.startsWith('https://'))) return '';
        return url;
    };

    if (!isOpen) return null;

    const handleAddLink = async (e) => {
        e.preventDefault();
        const freshToken = getAuthToken();
        if (!freshToken) {
            alert("Your session has expired. Please log in again.");
            return;
        }

        if (!newLink) return;

        setLoading(true);
        try {
            const updatedLinks = [...(project.relatedLinks || []), newLink];
            const response = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${freshToken}`
                },
                body: JSON.stringify({ relatedLinks: updatedLinks })
            });

            if (response.ok) {
                const updatedProject = await response.json();
                onUpdate(updatedProject);
                setNewLink('');
            } else {
                const err = await response.json();
                alert(err.message || "Failed to add link");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadFiles = async (e) => {
        e.preventDefault();
        if (!files || files.length === 0) return;

        setLoading(true);
        const formData = new FormData();
        const freshToken = getAuthToken();
        if (!freshToken) {
            setLoading(false);
            alert("Your session has expired. Please log in again.");
            return;
        }
        for (let i = 0; i < files.length; i++) {
            formData.append('attachments', files[i]);
        }

        try {
            const response = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${freshToken}`
                },
                body: formData
            });

            if (response.ok) {
                const updatedProject = await response.json();
                onUpdate(updatedProject);
                setFiles(null);
                // Reset input
                e.target.reset();
            } else {
                const err = await response.json();
                alert(err.message || "Failed to upload files");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveLink = async (linkToRemove) => {
        if (!window.confirm("Remove this link?")) return;
        setLoading(true);
        const freshToken = getAuthToken();
        try {
            const updatedLinks = project.relatedLinks.filter(l => l !== linkToRemove);
            const response = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${freshToken}`
                },
                body: JSON.stringify({ relatedLinks: updatedLinks })
            });

            if (response.ok) {
                const updatedProject = await response.json();
                onUpdate(updatedProject);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAttachment = async (fileUrl) => {
        if (!window.confirm("Permanently remove this file?")) return;
        setLoading(true);
        const freshToken = getAuthToken();
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${project._id}/attachments/remove`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${freshToken}`
                },
                body: JSON.stringify({ fileUrl })
            });

            if (response.ok) {
                const data = await response.json();
                onUpdate({ ...project, attachments: data.attachments });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Manage Resources</h2>
                        <p className="text-slate-500 text-sm font-medium">Add or remove project links and files</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200">
                        <FiX className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* LINKS SECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <FiLink className="w-4 h-4" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Related Links</h3>
                        </div>

                        <form onSubmit={handleAddLink} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Paste URL here (e.g. drive.google.com/...)"
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                value={newLink}
                                onChange={(e) => setNewLink(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !newLink}
                                className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loading ? <FiLoader className="animate-spin" /> : <FiPlus />}
                                Add
                            </button>
                        </form>

                        <div className="grid gap-2">
                            {project.relatedLinks && project.relatedLinks.map((link, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group transition-all hover:border-slate-200">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border shadow-sm flex-shrink-0">
                                            <FiLink className="w-3 h-3 text-slate-400" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 truncate">{link}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveLink(link)}
                                        className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ATTACHMENTS SECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <FiFile className="w-4 h-4" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Attachments</h3>
                        </div>

                        <form onSubmit={handleUploadFiles} className="space-y-3">
                            <div className="relative">
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    id="workspace-file-upload"
                                    onChange={(e) => setFiles(e.target.files)}
                                />
                                <label
                                    htmlFor="workspace-file-upload"
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all group"
                                >
                                    <FiPlus className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 mb-2" />
                                    <span className="text-sm font-bold text-slate-500 group-hover:text-emerald-700">
                                        {files ? `${files.length} files selected` : "Click to select files"}
                                    </span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !files}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                            >
                                {loading ? <FiLoader className="animate-spin" /> : <FiPlus />}
                                Upload Files to Cloudinary
                            </button>
                        </form>

                        <div className="grid gap-2">
                            {project.attachments && project.attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group transition-all hover:border-slate-200">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border shadow-sm flex-shrink-0">
                                            <FiFile className="w-3 h-3 text-slate-400" />
                                        </div>
                                        {getFullUrl(file) ? (
                                            <a
                                                href={getFullUrl(file)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-slate-600 truncate hover:text-indigo-600 transition-colors"
                                            >
                                                {typeof file === 'string' ? file.split('/').pop().split('?')[0] : `File ${idx + 1}`}
                                            </a>
                                        ) : (
                                            <span
                                                title="Invalid attachment URL. Remove and upload again."
                                                className="text-xs font-bold text-amber-700 truncate"
                                            >
                                                {typeof file === 'string' ? file : `File ${idx + 1}`} (re-upload needed)
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveAttachment(file)}
                                        className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageResourcesModal;
