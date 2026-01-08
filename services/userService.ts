import { User, Post, Comment, Conversation } from '../types';

/**
 * COSMIC DATABASE SERVICE (Virtual DB)
 * Gestión de persistencia local para usuarios, comunidad y chats privados.
 */

const DB_KEY = 'COSMIC_DB_V1';
const COMMUNITY_KEY = 'COSMIC_COMMUNITY_V1';
const CHAT_DB_KEY = 'COSMIC_CHAT_HISTORY_V1';
const STATS_KEY = 'COSMIC_STATS_V1';
const ADMIN_EMAIL = 'darwinflorentino63@gmail.com';

export const dbService = {
  // --- GESTIÓN DE ESTADÍSTICAS ---
  getStats: () => {
    try {
      const data = localStorage.getItem(STATS_KEY);
      return data ? JSON.parse(data) : { visits: 0, interactions: 0 };
    } catch (e) {
      return { visits: 0, interactions: 0 };
    }
  },

  incrementVisits: () => {
    const stats = dbService.getStats();
    stats.visits += 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats.visits;
  },

  incrementInteractions: () => {
    const stats = dbService.getStats();
    stats.interactions += 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  },

  // --- GESTIÓN DE USUARIOS ---
  getAllUsers: (): User[] => {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error accediendo a la DB", e);
      return [];
    }
  },

  registerUser: (newUser: User): { success: boolean; message: string } => {
    const users = dbService.getAllUsers();
    if (users.find(u => u.name.trim().toLowerCase() === newUser.name.trim().toLowerCase())) {
      return { success: false, message: 'El nombre de usuario ya está en uso.' };
    }
    if (users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      return { success: false, message: 'El correo ya está registrado.' };
    }
    
    // Asignación automática de ADMIN por correo
    if (newUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      newUser.role = 'admin';
    }

    users.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    return { success: true, message: 'Registro completado.' };
  },

  updateUser: (currentUser: User, updatedData: Partial<User>): { success: boolean; user?: User } => {
    const users = dbService.getAllUsers();
    let index = users.findIndex(u => u.email === currentUser.email);
    
    const oldName = currentUser.name;
    let newUser: User;

    if (index === -1) {
      newUser = { ...currentUser, ...updatedData };
      // Asegurar rol admin en actualización si es el correo designado
      if (newUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) newUser.role = 'admin';
      users.push(newUser);
    } else {
      newUser = { ...users[index], ...updatedData };
      if (newUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) newUser.role = 'admin';
      users[index] = newUser;
    }
    
    localStorage.setItem(DB_KEY, JSON.stringify(users));

    // Sincronización PROFUNDA en comunidad al cambiar nombre o avatar
    if (updatedData.name || updatedData.avatarUrl) {
      const posts = dbService.getPosts();
      const updatedPosts = posts.map(post => {
        // Actualizar autor de post
        if (post.userName === oldName) {
            post.userName = newUser.name;
            post.userRole = newUser.role || 'invitado';
        }
        // Actualizar likes
        if (updatedData.name) {
          post.likes = post.likes.map(likeName => likeName === oldName ? newUser.name : likeName);
        }
        // Actualizar comentarios
        post.comments = post.comments.map(comment => {
          if (comment.userName === oldName) {
            comment.userName = newUser.name;
            comment.userRole = newUser.role || 'invitado';
          }
          return comment;
        });
        return post;
      });
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(updatedPosts));
    }

    return { success: true, user: newUser };
  },

  authenticate: (identifier: string, password: string): { success: boolean; user?: User; message: string } => {
    const users = dbService.getAllUsers();
    const idLower = identifier.trim().toLowerCase();
    const user = users.find(u => 
      (u.name.toLowerCase() === idLower || u.email.toLowerCase() === idLower) && 
      u.password === password
    );
    if (user) {
      // Doble verificación de rol Admin por seguridad
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
        user.role = 'admin';
        localStorage.setItem(DB_KEY, JSON.stringify(users));
      }
      return { success: true, user, message: 'Acceso concedido.' };
    }
    return { success: false, message: 'Credenciales inválidas.' };
  },

  // --- GESTIÓN DE HISTORIAL DE CHAT (PER-USER) ---
  getUserConversations: (email: string): Conversation[] => {
    try {
      const allChats = JSON.parse(localStorage.getItem(CHAT_DB_KEY) || '{}');
      return allChats[email] || [];
    } catch (e) {
      return [];
    }
  },

  saveUserConversations: (email: string, conversations: Conversation[]) => {
    try {
      const allChats = JSON.parse(localStorage.getItem(CHAT_DB_KEY) || '{}');
      allChats[email] = conversations;
      localStorage.setItem(CHAT_DB_KEY, JSON.stringify(allChats));
    } catch (e) {
      console.error("Error al guardar historial de chat", e);
    }
  },

  // --- GESTIÓN DE COMUNIDAD ---
  getPosts: (): Post[] => {
    try {
      const data = localStorage.getItem(COMMUNITY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addPost: (post: Post) => {
    const posts = dbService.getPosts();
    posts.unshift(post);
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
    dbService.incrementInteractions();
  },

  likePost: (postId: string, userName: string) => {
    const posts = dbService.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      const index = post.likes.indexOf(userName);
      if (index === -1) post.likes.push(userName);
      else post.likes.splice(index, 1);
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
      dbService.incrementInteractions();
    }
  },

  addComment: (postId: string, comment: Comment) => {
    const posts = dbService.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.comments.push(comment);
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
      dbService.incrementInteractions();
    }
  }
};