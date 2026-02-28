import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import {
  UploadCloud, Trash2, FileText, Search, Sparkles, RefreshCw, Loader2,
  X, Eye, MessageSquare, Edit2, Check, Wand2, RotateCcw, Send,
  ShieldAlert, FileImage, FileCode, Tag, Hash, Download,
  ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

// ── File type icon helper ──
const FileIcon = ({ type, size = 32 }) => {
  if (type?.startsWith('image')) return <FileImage size={size} className="text-sky-400" />;
  if (type?.includes('pdf')) return <FileText size={size} className="text-rose-400" />;
  if (type?.includes('text')) return <FileCode size={size} className="text-emerald-400" />;
  return <FileText size={size} className="text-indigo-400" />;
};

// ── Tag color cycling ──
const TAG_COLORS = [
  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'bg-amber-500/10 text-amber-400 border-amber-500/20',
];

const AITag = ({ tag, index }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${TAG_COLORS[index % TAG_COLORS.length]}`}
  >
    <Hash size={8} />
    {tag.trim()}
  </span>
);

// ── File Card ──
const FileCard = ({ file, onSelect, onDelete, onRunAI, isAnalyzing }) => {
  const isImage = file.file_type?.startsWith('image');
  const tags = file.ai_tags ? file.ai_tags.split(',').slice(0, 3) : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(file)}
      className="group relative rounded-xl cursor-pointer card-shine
        bg-white dark:bg-white/[0.03]
        border border-zinc-200/80 dark:border-white/[0.07]
        shadow-light-card dark:shadow-card
        hover:shadow-light-card-hover dark:hover:shadow-card-hover
        hover:border-indigo-300/60 dark:hover:border-indigo-500/30
        hover:-translate-y-0.5
        transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Preview zone */}
      <div className="relative h-40 overflow-hidden bg-zinc-100 dark:bg-white/[0.02] border-b border-zinc-200/50 dark:border-white/[0.05]">
        {isImage ? (
          <img
            src={file.url}
            alt={file.filename}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/60 dark:border-white/[0.08] group-hover:scale-110 transition-transform duration-300">
              <FileIcon type={file.file_type} size={36} />
            </div>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <span className="text-white text-xs font-medium flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
            <Eye size={12} />
            View Details
          </span>
        </div>

        {/* Delete button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-zinc-900/80 dark:bg-black/60 backdrop-blur-sm border border-white/10 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30"
        >
          <Trash2 size={12} />
        </motion.button>
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Filename */}
        <h3
          className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate font-display leading-snug"
          title={file.filename}
        >
          {file.filename}
        </h3>

        {/* AI content */}
        <div className="flex-1">
          {file.is_analyzed ? (
            <div className="space-y-2.5">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, i) => <AITag key={i} tag={tag} index={i} />)}
                </div>
              )}
              {file.summary && (
                <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-3">
                  {file.summary.replace(/\*/g, '').substring(0, 140)}
                  {file.summary.length > 140 ? '…' : ''}
                </p>
              )}
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onRunAI(file.id); }}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold font-mono
                bg-indigo-500/8 dark:bg-indigo-500/8 text-indigo-600 dark:text-indigo-400
                border border-indigo-500/15 dark:border-indigo-500/15
                hover:bg-indigo-500/15 hover:border-indigo-500/30
                disabled:opacity-40 transition-all"
            >
              {isAnalyzing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              {isAnalyzing ? 'Analyzing…' : 'Run AI Analysis'}
            </motion.button>
          )}
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/[0.06]">
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
            {file.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
          </span>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
            {new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Dashboard ──
const Dashboard = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [activeTab, setActiveTab] = useState('details');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renamingLoading, setRenamingLoading] = useState(false);

  const getDownloadUrl = (url) => url ? url.replace('/upload/', '/upload/fl_attachment/') : '';

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files/list');
      setFiles(res.data.files);
    } catch (err) {
      toast.error('Could not load files.');
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  useEffect(() => {
    if (selectedFile) {
      setChatHistory([]);
      setChatInput('');
      setActiveTab('details');
      setIsRenaming(false);
      setRenameValue(selectedFile.filename);
    }
  }, [selectedFile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeTab]);

  const uploadFile = async (file) => {
    setUploading(true);
    const loadingToast = toast.loading(`Uploading ${file.name}…`);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/files/upload', formData);
      await fetchFiles();
      toast.success('File uploaded!', { id: loadingToast });
    } catch {
      toast.error('Upload failed.', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
    e.target.value = null;
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) uploadFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'text/plain': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
  });

  const runAI = async (fileId) => {
    setAnalyzing(fileId);
    const loadingToast = toast.loading('Analyzing with AI…');
    try {
      const res = await api.post(`/files/${fileId}/analyze`);
      const updatedFile = res.data.file;
      setFiles((prev) => prev.map((f) => f.id === fileId ? updatedFile : f));
      if (selectedFile?.id === fileId) setSelectedFile(updatedFile);
      toast.success('Analysis Complete!', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis Failed', { id: loadingToast });
    } finally {
      setAnalyzing(null);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput;
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);
    try {
      const res = await api.post(`/files/${selectedFile.id}/chat`, { question: q });
      setChatHistory((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setChatHistory((prev) => [...prev, { role: 'ai', text: 'Error getting answer.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    try {
      await api.delete(`/files/delete/${fileId}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (selectedFile?.id === fileId) setSelectedFile(null);
      toast.success('Deleted.');
    } catch {
      toast.error('Delete failed.');
    }
  };

  const saveRename = async () => {
    if (!renameValue.trim()) return;
    try {
      const res = await api.put(`/files/${selectedFile.id}/rename`, { filename: renameValue });
      const newName = res.data.file.filename;
      setSelectedFile((prev) => ({ ...prev, filename: newName }));
      setFiles((prev) => prev.map((f) => f.id === selectedFile.id ? { ...f, filename: newName } : f));
      setIsRenaming(false);
      toast.success('Renamed!');
    } catch {
      toast.error('Rename failed.');
    }
  };

  const suggestName = async () => {
    if (!selectedFile.is_analyzed) { toast.error('Run AI Analysis first!'); return; }
    setRenamingLoading(true);
    try {
      const res = await api.post(`/files/${selectedFile.id}/suggest_name`);
      setRenameValue(res.data.suggested_name);
      toast.success('Name suggested!');
    } catch {
      toast.error('Failed to suggest name');
    } finally {
      setRenamingLoading(false);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.filename.toLowerCase().includes(search.toLowerCase()) ||
    f.ai_tags?.toLowerCase().includes(search.toLowerCase()) ||
    f.summary?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div {...getRootProps()} className="relative outline-none min-h-[70vh]">
        <input {...getInputProps()} />

        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/15 backdrop-blur-sm" />
              <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-indigo-400/60 dark:border-indigo-500/60" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 dark:bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-glow-md">
                  <UploadCloud size={36} className="text-indigo-400" />
                </div>
                <p className="font-display font-bold text-xl text-indigo-400">Drop to upload</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Toolbar ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8"
        >
          {/* Left: Title + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
            <div>
              <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-white leading-none">
                Your Files
              </h1>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                {files.length} {files.length === 1 ? 'file' : 'files'} stored
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72 group">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-400 transition-colors"
              />
              <input
                type="text"
                placeholder="Search files, tags, content…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg
                  bg-zinc-100/80 dark:bg-white/[0.04]
                  border border-zinc-200/80 dark:border-white/[0.08]
                  text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400/50 dark:focus:border-indigo-500/40
                  transition-all font-sans"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold
                  text-violet-500 dark:text-violet-400 bg-violet-500/8 dark:bg-violet-500/8
                  border border-violet-500/15 dark:border-violet-500/15
                  hover:bg-violet-500/15 hover:border-violet-500/25 transition-all"
              >
                <ShieldAlert size={14} />
                <span className="hidden sm:inline font-mono">Admin</span>
              </Link>
            )}

            {/* Upload Button */}
            <label className="relative flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer
              bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500
              text-white text-xs font-semibold font-sans
              border border-indigo-500 shadow-glow-sm hover:shadow-glow-md
              transition-all duration-200 group overflow-hidden"
            >
              <input type="file" className="hidden" onChange={handleFileInputChange} disabled={uploading} />
              {uploading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <UploadCloud size={14} className="group-hover:scale-110 transition-transform" />
              )}
              {uploading ? 'Uploading…' : 'Upload File'}
            </label>
          </div>
        </motion.div>

        {/* ── Files Grid ── */}
        <AnimatePresence mode="wait">
          {filteredFiles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-5"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.07] flex items-center justify-center">
                  <UploadCloud size={32} className="text-zinc-300 dark:text-zinc-600" />
                </div>
                <div className="absolute -inset-3 rounded-3xl bg-indigo-500/5 dark:bg-indigo-500/8 border border-indigo-500/10 dark:border-indigo-500/10 -z-10" />
              </div>
              <div className="text-center">
                <p className="font-display font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {search ? 'No files match your search' : 'No files yet'}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                  {search ? 'Try a different query' : 'Drag & drop or click Upload to get started'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10"
            >
              <AnimatePresence>
                {filteredFiles.map((file, i) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <FileCard
                      file={file}
                      onSelect={setSelectedFile}
                      onDelete={deleteFile}
                      onRunAI={runAI}
                      isAnalyzing={analyzing === file.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── File Detail Modal ── */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedFile(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md" />

            {/* Modal Panel */}
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl max-h-[88vh] flex flex-col md:flex-row rounded-2xl overflow-hidden
                bg-white dark:bg-[#0f0f17]
                border border-zinc-200/80 dark:border-white/[0.08]
                shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Left: Preview ── */}
              <div className="w-full md:w-[45%] bg-zinc-100 dark:bg-black/40 flex items-center justify-center p-6 border-r border-zinc-200/60 dark:border-white/[0.06] relative min-h-[260px]">
                {selectedFile.file_type?.startsWith('image') ? (
                  <img
                    src={selectedFile.url}
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
                    alt={selectedFile.filename}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-8 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.08]">
                      <FileIcon type={selectedFile.file_type} size={64} />
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">No preview available</p>
                  </div>
                )}
                {/* Download button */}
                <a
                  href={getDownloadUrl(selectedFile.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-white/80 dark:bg-white/[0.06] backdrop-blur-sm
                    border border-zinc-200/80 dark:border-white/10
                    text-zinc-600 dark:text-zinc-300
                    hover:bg-white dark:hover:bg-white/10
                    transition-all shadow-sm"
                >
                  <Download size={12} />
                  Download
                </a>
              </div>

              {/* ── Right: Info Panel ── */}
              <div className="w-full md:w-[55%] flex flex-col h-[560px] md:h-auto">
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-white/[0.06] shrink-0">
                  {/* Filename / Rename */}
                  {isRenaming ? (
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg
                          bg-zinc-100 dark:bg-white/[0.05]
                          border border-zinc-300 dark:border-white/10
                          text-zinc-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        autoFocus
                      />
                      <button
                        onClick={suggestName}
                        disabled={renamingLoading}
                        className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition"
                      >
                        {renamingLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      </button>
                      <button onClick={saveRename} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setIsRenaming(false)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 group flex-1 min-w-0">
                        <h2
                          className="font-display font-bold text-lg text-zinc-900 dark:text-white line-clamp-1"
                          title={selectedFile.filename}
                        >
                          {selectedFile.filename}
                        </h2>
                        <button
                          onClick={() => setIsRenaming(true)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-400 hover:text-indigo-400 transition"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* File meta */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.07] px-2 py-0.5 rounded uppercase tracking-wider">
                      {selectedFile.file_type?.split('/')[1] || 'FILE'}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                      {new Date(selectedFile.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {selectedFile.is_analyzed && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-500 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse-slow" />
                        Analyzed
                      </span>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-white/[0.04] rounded-lg w-fit border border-zinc-200/60 dark:border-white/[0.06]">
                    {[
                      { id: 'details', icon: Tag, label: 'Details' },
                      { id: 'chat', icon: MessageSquare, label: 'Chat' },
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          activeTab === id
                            ? 'text-zinc-900 dark:text-white'
                            : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        {activeTab === id && (
                          <motion.div
                            layoutId="tab-pill"
                            className="absolute inset-0 rounded-md bg-white dark:bg-white/[0.08] border border-zinc-200 dark:border-white/10 shadow-sm"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <Icon size={12} className="relative z-10" />
                        <span className="relative z-10">{label}</span>
                        {id === 'chat' && selectedFile.is_analyzed && (
                          <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === 'details' ? (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {!selectedFile.is_analyzed ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/8 dark:bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-center">
                              <Sparkles size={28} className="text-indigo-400" />
                            </div>
                            <div className="text-center">
                              <p className="font-display font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No analysis yet</p>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-5">Run AI to extract tags, summaries & enable chat</p>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => runAI(selectedFile.id)}
                              disabled={!!analyzing}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
                                bg-indigo-600 hover:bg-indigo-500 text-white
                                border border-indigo-500 shadow-glow-sm hover:shadow-glow-md
                                disabled:opacity-40 transition-all"
                            >
                              {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                              {analyzing ? 'Analyzing…' : 'Run AI Analysis'}
                            </motion.button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Tags */}
                            {selectedFile.ai_tags && (
                              <div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5 flex items-center gap-1.5">
                                  <Tag size={10} /> AI Tags
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedFile.ai_tags.split(',').map((tag, i) => (
                                    <AITag key={i} tag={tag} index={i} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            {(selectedFile.summary || selectedFile.vision_analysis) && (
                              <div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5 flex items-center gap-1.5">
                                  <Sparkles size={10} /> AI Summary
                                </p>
                                <div className="rounded-xl bg-indigo-500/5 dark:bg-indigo-500/6 border border-indigo-500/12 dark:border-indigo-500/12 p-4">
                                  <div className="prose-obsidian text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                    <ReactMarkdown>{selectedFile.summary || selectedFile.vision_analysis}</ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* OCR */}
                            {selectedFile.ocr_text && (
                              <div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5">Raw Text (OCR)</p>
                                <pre className="text-[11px] text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-white/[0.03] p-3 rounded-lg border border-zinc-200 dark:border-white/[0.06] max-h-32 overflow-y-auto font-mono leading-relaxed whitespace-pre-wrap">
                                  {selectedFile.ocr_text}
                                </pre>
                              </div>
                            )}

                            {/* Re-analyze */}
                            <button
                              onClick={() => runAI(selectedFile.id)}
                              disabled={!!analyzing}
                              className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors font-mono disabled:opacity-40"
                            >
                              <RotateCcw size={11} />
                              Re-run analysis
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="h-full flex flex-col"
                      >
                        {!selectedFile.is_analyzed ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                            <MessageSquare size={32} className="text-zinc-300 dark:text-zinc-700" />
                            <p className="font-display text-sm font-semibold text-zinc-600 dark:text-zinc-400">Run AI analysis first</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">Chat requires AI analysis to be completed</p>
                          </div>
                        ) : (
                          <>
                            {/* Messages */}
                            <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                              {chatHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                                  <div className="w-12 h-12 rounded-xl bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-center">
                                    <MessageSquare size={20} className="text-indigo-400" />
                                  </div>
                                  <div>
                                    <p className="font-display text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Chat with this file</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">Ask anything about the content</p>
                                  </div>
                                </div>
                              )}

                              {chatHistory.map((msg, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                      msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.07] text-zinc-800 dark:text-zinc-200 rounded-bl-sm'
                                    }`}
                                  >
                                    {msg.role === 'ai' ? (
                                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-1">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                      </div>
                                    ) : msg.text}
                                  </div>
                                </motion.div>
                              ))}

                              {chatLoading && (
                                <div className="flex justify-start">
                                  <div className="bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.07] rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
                                    <div className="flex gap-1">
                                      {[0, 1, 2].map((i) => (
                                        <motion.div
                                          key={i}
                                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleChatSubmit} className="relative">
                              <input
                                type="text"
                                placeholder="Ask about this file…"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 text-sm rounded-xl
                                  bg-zinc-100/80 dark:bg-white/[0.05]
                                  border border-zinc-200/80 dark:border-white/[0.08]
                                  text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600
                                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                                  transition-all font-sans"
                              />
                              <button
                                type="submit"
                                disabled={chatLoading || !chatInput.trim()}
                                className="absolute right-2 top-2 p-2 rounded-lg
                                  bg-indigo-600 hover:bg-indigo-500 text-white
                                  disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-glow-sm"
                              >
                                <Send size={14} />
                              </button>
                            </form>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
