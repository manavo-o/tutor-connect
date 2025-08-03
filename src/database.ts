export interface Profile { id: string; username: string; updated_at?: string; }
export interface Subject { id: number; subject_name: string; owner_id: string; created_at?: string; }
export interface Topic { id: number; topic_name: string; subject_id: number; created_at?: string; }
export interface Message { id: number; message_text: string; topic_id: number; user_id: string; created_at?: string; profiles?: { username: string; }; }
