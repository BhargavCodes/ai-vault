import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import { UploadCloud, Trash2, FileText, Search, Sparkles, RefreshCw, Loader2, X, Eye, MessageSquare, Edit2, Check, Wand2, RotateCcw, Send } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // ... (Chat/Modal State - Same as before)
  const [activeTab, setActiveTab] = useState('details');
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renamingLoading, setRenamingLoading] = useState(false);

  const getDownloadUrl = (url) => url ? url.replace('/upload/', '/upload/fl_attachment/') : "";

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files/list');
      setFiles(res.data.files);
    } catch (err) {
      console.error(err);
      toast.error("Could not load files.");
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  useEffect(() => {
    if (selectedFile) {
        setChatHistory([]);
        setChatInput("");
        setActiveTab('details');
        setIsRenaming(false); 
        setRenameValue(selectedFile.filename);
    }
  }, [selectedFile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeTab]);

  // --- Upload Logic ---
  const uploadFile = async (file) => {
    setUploading(true);
    const loadingToast = toast.loading(`Uploading ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/files/upload', formData);
      await fetchFiles();
      toast.success("File uploaded!", { id: loadingToast });
    } catch (err) {
      toast.error("Upload failed.", { id: loadingToast });
    } finally { setUploading(false); }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
    e.target.value = null; 
  };

  // --- Drag & Drop Logic ---
  const onDrop = useCallback((acceptedFiles) => { 
      if (acceptedFiles?.length > 0) uploadFile(acceptedFiles[0]); 
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    noClick: true, // 👈 IMPORTANT: Allows buttons inside to be clicked!
    noKeyboard: true,
    accept: { 'image/*': [], 'application/pdf': [], 'text/plain': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] } 
  });

  // ... (Keep AI, Chat, Delete, Rename logic exactly same as before) ...
  const runAI = async (fileId) => {
    setAnalyzing(fileId);
    const loadingToast = toast.loading("Analyzing with AI...");
    try {
      const res = await api.post(`/files/${fileId}/analyze`);
      const updatedFile = res.data.file;
      setFiles(prev => prev.map(f => f.id === fileId ? updatedFile : f));
      if (selectedFile?.id === fileId) setSelectedFile(updatedFile);
      toast.success("Analysis Complete!", { id: loadingToast });
    } catch (err) { toast.error(err.response?.data?.error || "Analysis Failed", { id: loadingToast }); } finally { setAnalyzing(null); }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput; setChatInput(""); 
    setChatHistory(prev => [...prev, { role: 'user', text: q }]); setChatLoading(true);
    try {
        const res = await api.post(`/files/${selectedFile.id}/chat`, { question: q });
        setChatHistory(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) { setChatHistory(prev => [...prev, { role: 'ai', text: "Error getting answer." }]); } finally { setChatLoading(false); }
  };

  const deleteFile = async (fileId) => {
    if (!confirm("Delete file?")) return;
    try {
      await api.delete(`/files/delete/${fileId}`);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (selectedFile?.id === fileId) setSelectedFile(null);
      toast.success("Deleted.");
    } catch (err) { toast.error("Delete failed."); }
  };

  const saveRename = async () => {
    if (!renameValue.trim()) return;
    try {
        const res = await api.put(`/files/${selectedFile.id}/rename`, { filename: renameValue });
        const newName = res.data.file.filename;
        setSelectedFile(prev => ({ ...prev, filename: newName }));
        setFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, filename: newName } : f));
        setIsRenaming(false);
        toast.success("Renamed!");
    } catch (err) { toast.error("Rename failed."); }
  };

  const suggestName = async () => {
    if (!selectedFile.is_analyzed) { toast.error("Run AI Analysis first!"); return; }
    setRenamingLoading(true);
    try {
        const res = await api.post(`/files/${selectedFile.id}/suggest_name`);
        setRenameValue(res.data.suggested_name);
        toast.success("Name suggested!");
    } catch (err) { toast.error("Failed to suggest name"); } finally { setRenamingLoading(false); }
  };

  const filteredFiles = files.filter(f => 
    f.filename.toLowerCase().includes(search.toLowerCase()) ||
    f.ai_tags?.toLowerCase().includes(search.toLowerCase()) ||
    f.summary?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Wrap the ENTIRE Dashboard in Dropzone */}
      <div {...getRootProps()} className="relative min-h-[80vh] outline-none">
        <input {...getInputProps()} />

        {/* 🔵 Drag Overlay (Only shows when dragging file) */}
        {isDragActive && (
            <div className="absolute inset-0 z-50 bg-blue-500/10 border-4 border-blue-500 border-dashed rounded-3xl flex items-center justify-center backdrop-blur-sm transition-all">
                <div className="bg-white p-8 rounded-full shadow-xl animate-bounce">
                    <UploadCloud size={64} className="text-blue-600" />
                </div>
            </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition" size={20} />
                <input type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            
            <label className={`flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg border-2 border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600`}>
                <input type="file" className="hidden" onChange={handleFileInputChange} disabled={uploading} />
                {uploading ? <RefreshCw className="animate-spin" size={20}/> : <UploadCloud size={20} />}
                <span className="font-medium">{uploading ? "Uploading..." : "Upload New File"}</span>
            </label>
        </div>

        {/* Files Grid */}
        {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 dark:bg-gray-700">
                    <UploadCloud size={48} className="text-blue-100 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No files found</h3>
                <p className="text-sm dark:text-gray-500">Drag & Drop a file here to upload instantly.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                {filteredFiles.map(file => (
                    <div key={file.id} onClick={() => setSelectedFile(file)} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                        {/* Preview */}
                        <div className="h-48 bg-gray-100 relative overflow-hidden border-b border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                            {file.file_type.startsWith('image') ? <img src={file.url} alt={file.filename} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200 dark:bg-gray-700 dark:text-gray-500"><FileText size={64} /></div>}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><span className="text-white font-medium flex items-center gap-2"><Eye size={16}/> View</span></div>
                        </div>
                        {/* Body */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-gray-800 truncate flex-1 pr-2 dark:text-gray-200" title={file.filename}>{file.filename}</h3>
                                <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex-1">
                                {file.is_analyzed ? (
                                    <div className="space-y-3 animate-in fade-in duration-500">
                                        {file.ai_tags && <div className="flex flex-wrap gap-1">{file.ai_tags.split(',').slice(0, 2).map((tag, i) => <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded dark:bg-blue-900/30 dark:text-blue-300">{tag.trim()}</span>)}</div>}
                                        {file.summary && <p className="text-xs text-gray-500 line-clamp-3 bg-gray-50 p-2 rounded border border-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400 mt-1">{file.summary.replace(/\*/g, '').substring(0, 150)}...</p>}
                                    </div>
                                ) : (
                                    <button onClick={(e) => { e.stopPropagation(); runAI(file.id); }} disabled={analyzing === file.id} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:border-blue-300 hover:text-blue-600 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400">
                                        {analyzing === file.id ? <Loader2 size={14} className="animate-spin text-blue-500" /> : <Sparkles size={14} className="text-purple-500" />}
                                        {analyzing === file.id ? "Analyzing..." : "Run AI Analysis"}
                                    </button>
                                )}
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-[10px] text-gray-400 font-medium dark:border-gray-700"><span className="uppercase">{file.file_type.split('/')[1] || 'FILE'}</span><span>{new Date(file.uploaded_at).toLocaleDateString()}</span></div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Modal (Selected File) */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedFile(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] h-auto overflow-hidden flex flex-col md:flex-row dark:bg-gray-800" onClick={e => e.stopPropagation()}>
                {/* Left Preview */}
                <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-4 border-r border-gray-200 relative dark:bg-gray-900 dark:border-gray-700 min-h-[300px]">
                    {selectedFile.file_type.startsWith('image') ? <img src={selectedFile.url} className="max-w-full max-h-[70vh] object-contain shadow-sm rounded" /> : <div className="text-center"><FileText size={96} className="text-gray-300 mx-auto mb-4 dark:text-gray-600" /><p className="text-gray-500 dark:text-gray-400">Preview unavailable</p></div>}
                    <a href={getDownloadUrl(selectedFile.url)} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 text-xs font-bold rounded-full shadow hover:bg-white flex items-center gap-2 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"><UploadCloud size={14} className="rotate-180" /> Download</a>
                </div>

                {/* Right Content */}
                <div className="w-full md:w-1/2 flex flex-col h-[600px] md:h-auto">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start shrink-0 gap-4">
                        <div className="flex-1">
                            {isRenaming ? (
                                <div className="flex items-center gap-2">
                                    <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" autoFocus />
                                    <button onClick={suggestName} disabled={renamingLoading} className="p-1.5 bg-purple-100 text-purple-600 rounded hover:bg-purple-200">{renamingLoading ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16}/>}</button>
                                    <button onClick={saveRename} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"><Check size={16}/></button>
                                    <button onClick={() => setIsRenaming(false)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><X size={16}/></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <h2 className="text-xl font-bold text-gray-800 break-all dark:text-white line-clamp-1" title={selectedFile.filename}>{selectedFile.filename}</h2>
                                    <button onClick={() => setIsRenaming(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition"><Edit2 size={14}/></button>
                                </div>
                            )}
                            <div className="flex gap-4 mt-4">
                                <button onClick={() => setActiveTab('details')} className={`text-sm font-bold pb-1 border-b-2 transition ${activeTab === 'details' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>Details</button>
                                <button onClick={() => setActiveTab('chat')} className={`text-sm font-bold pb-1 border-b-2 transition flex items-center gap-2 ${activeTab === 'chat' ? 'text-purple-600 border-purple-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}><Sparkles size={14} /> Chat</button>
                            </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white"><X size={24}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'details' ? (
                            !selectedFile.is_analyzed ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 mb-4 dark:text-gray-400">Analysis pending.</p>
                                    <button onClick={() => runAI(selectedFile.id)} disabled={analyzing} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">{analyzing ? "Running..." : "✨ Run Analysis"}</button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in">
                                    {selectedFile.ai_tags && <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Tags</h4><div className="flex flex-wrap gap-2">{selectedFile.ai_tags.split(',').map((tag, i) => <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">{tag.trim()}</span>)}</div></div>}
                                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 dark:bg-purple-900/10 dark:border-purple-800"><div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-400"><Sparkles size={18} /><h4 className="font-bold uppercase tracking-wide text-sm">AI Summary</h4></div><div className="prose prose-sm text-gray-700 leading-relaxed dark:text-gray-300 dark:prose-invert max-w-none"><ReactMarkdown>{selectedFile.summary || selectedFile.vision_analysis}</ReactMarkdown></div></div>
                                    {selectedFile.ocr_text && <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Raw Text</h4><p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg font-mono border border-gray-200 max-h-32 overflow-y-auto dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">{selectedFile.ocr_text}</p></div>}
                                </div>
                            )
                        ) : (
                            <div className="h-full flex flex-col">
                                {!selectedFile.is_analyzed ? <div className="text-center py-10 text-gray-400"><p>Please run analysis first.</p></div> : <><div className="flex-1 space-y-4 mb-4">{chatHistory.length === 0 && <div className="text-center text-gray-400 text-sm mt-10"><MessageSquare size={32} className="mx-auto mb-2 opacity-20" /><p>Ask me anything about this file!</p></div>}{chatHistory.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{msg.role === 'ai' ? <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.text}</ReactMarkdown></div> : msg.text}</div></div>))}{chatLoading && <div className="flex justify-start"><div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500 flex items-center gap-2 dark:bg-gray-700"><Loader2 size={14} className="animate-spin"/> AI is thinking...</div></div>}<div ref={chatEndRef} /></div><form onSubmit={handleChatSubmit} className="relative mt-auto"><input type="text" placeholder="Type a question..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" /><button type="submit" disabled={chatLoading || !chatInput.trim()} className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"><Send size={16} /></button></form></>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;