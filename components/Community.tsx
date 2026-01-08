import React, { useState, useEffect } from 'react';
import { dbService } from '../services/userService';
import { Post, User } from '../types';

interface CommunityProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const Community: React.FC<CommunityProps> = ({ isOpen, onClose, currentUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [postType, setPostType] = useState<Post['type']>('opinion');
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const loadPosts = () => {
    const data = dbService.getPosts();
    setPosts(data);
  };

  // Recargar posts cada vez que el modal se abre o el usuario cambia
  useEffect(() => {
    if (isOpen) {
      loadPosts();
    }
  }, [isOpen, currentUser.name]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      userName: currentUser.name, 
      userRole: currentUser.role || 'invitado',
      text: newPostText,
      type: postType,
      likes: [],
      comments: [],
      timestamp: Date.now()
    };

    dbService.addPost(newPost);
    setNewPostText('');
    loadPosts();
  };

  const handleLike = (postId: string) => {
    dbService.likePost(postId, currentUser.name);
    loadPosts();
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    const comment = {
      id: Date.now().toString(),
      userName: currentUser.name, 
      userRole: currentUser.role || 'invitado',
      text: commentText,
      timestamp: Date.now()
    };
    dbService.addComment(postId, comment);
    setCommentText('');
    loadPosts();
  };

  const getTypeStyle = (type: Post['type']) => {
    switch (type) {
      case 'opinion': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'idea': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'aprendizaje': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cambio': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    }
  };

  const getRoleBg = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-amber-600 shadow-amber-500/20';
      case 'estudiante': return 'bg-cyan-600 shadow-cyan-500/20';
      default: return 'bg-purple-600 shadow-purple-500/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl h-[85vh] bg-slate-900/60 border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fadeIn flex flex-col ring-1 ring-white/20">
        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600"></div>
        
        {/* Header */}
        <div className="p-6 md:px-10 md:pt-10 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              <span className="text-purple-500">Comunidad</span> Estelar
            </h2>
            <p className="text-[10px] text-slate-400 font-mono tracking-[0.3em] uppercase">Red Neuronal // Diálogo Estelar</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-white transition-all border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:px-10 space-y-8 custom-scrollbar">
          {/* Formulario de Posteo */}
          <form onSubmit={handleCreatePost} className="bg-slate-800/40 p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl">
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder={`Comparte tus ideas o aprendizajes, ${currentUser.name}...`}
              className="w-full h-24 bg-slate-950/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none placeholder:text-slate-600 shadow-inner"
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                {(['opinion', 'idea', 'aprendizaje', 'cambio'] as Post['type'][]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPostType(t)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${postType === t ? getTypeStyle(t) + ' ring-1 ring-current' : 'text-slate-500 border-transparent hover:bg-white/5'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button 
                type="submit"
                disabled={!newPostText.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40"
              >
                Publicar
              </button>
            </div>
          </form>

          {/* Feed de Posts */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-20 text-slate-500 italic">
                <p>No hay mensajes en el canal. Sé el primero.</p>
              </div>
            ) : (
              posts.map(post => {
                return (
                  <div key={post.id} className="bg-slate-800/20 border border-white/5 rounded-3xl p-6 space-y-4 animate-fadeIn group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${getRoleBg(post.userRole)}`}>
                          {post.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                             {post.userName}
                             {post.userRole === 'admin' && <span className="text-[7px] bg-amber-500 text-slate-950 px-1 rounded font-black uppercase">Admin</span>}
                          </h4>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">{post.userRole} • {new Date(post.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${getTypeStyle(post.type)}`}>
                            {post.type}
                          </span>
                      </div>
                    </div>

                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>

                    <div className="pt-4 border-t border-white/5 flex items-center gap-6">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-xs font-bold transition-all ${post.likes.includes(currentUser.name) ? 'text-rose-500 scale-105' : 'text-slate-500 hover:text-rose-400'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={post.likes.includes(currentUser.name) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {post.likes.length}
                      </button>
                      <button 
                        onClick={() => setActiveComments(activeComments === post.id ? null : post.id)}
                        className={`flex items-center gap-2 text-xs font-bold transition-all ${activeComments === post.id ? 'text-cyan-400' : 'text-slate-500 hover:text-cyan-400'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 0.5 0 00.412.774 7.737 7.737 0 003.885-1.12 0.485 0.485 0 01.356-.044 8.291 8.291 0 002.408.354z" />
                        </svg>
                        {post.comments.length}
                      </button>
                    </div>

                    {/* Sección de Comentarios */}
                    {activeComments === post.id && (
                      <div className="pt-4 space-y-4 animate-slideDown">
                        <div className="space-y-3">
                          {post.comments.map(comment => {
                            return (
                              <div key={comment.id} className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 flex items-start gap-3 group/comment shadow-md">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${getRoleBg(comment.userRole)}`}>
                                  {comment.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-white">{comment.userName}</span>
                                      {comment.userRole === 'admin' && <span className="text-[6px] bg-amber-500 text-slate-950 px-1 rounded font-black uppercase">Admin</span>}
                                      <span className="text-[8px] text-slate-500 uppercase">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder="Escribe una respuesta..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentText.trim()}
                            className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all shadow-md disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 text-center bg-slate-950/20">
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
            Protocolo de Seguridad: Activo // República Dominicana
          </p>
        </div>
      </div>
    </div>
  );
};

export default Community;