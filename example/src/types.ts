export interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
  isLiked: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  author: string;
  avatar: string;
  content: string;
  time: string;
  isRead: boolean;
}

export interface Page {
  id: string;
  title: string;
  icon: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
}
