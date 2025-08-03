import { supabase } from './lib/supabaseClient';
import type { Subject, Topic, Message, Profile } from './database';
import type { User, Session, RealtimeChannel } from '@supabase/supabase-js';

// --- DOM ELEMENTS ---
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const googleLoginBtn = document.getElementById('google-login-btn');
const subjectsList = document.getElementById('subjects-list');
const addSubjectBtn = document.getElementById('add-subject-btn');
const subjectNameEl = document.getElementById('subject-name');
const topicsList = document.getElementById('topics-list');
const currentUsernameEl = document.getElementById('current-username');
const logoutBtn = document.getElementById('logout-btn');
const messagesView = document.getElementById('messages-view');
const topicNameEl = document.getElementById('topic-name');
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form') as HTMLFormElement;
const messageInput = document.getElementById('message-input') as HTMLInputElement;
const chatWindow = document.getElementById('chat-window');

// --- STATE ---
let currentUser: User | null = null;
let currentProfile: Profile | null = null;
let currentSubjectId: number | null = null;
let currentTopicId: number | null = null;
let messageSubscription: RealtimeChannel | null = null;

// --- UI ---
const showAuthView = () => { if (authView) authView.style.display = 'flex'; if (appView) appView.style.display = 'none'; };
const showAppView = () => { if (authView) authView.style.display = 'none'; if (appView) appView.style.display = 'flex'; };

const renderSubjects = (subjects: Subject[]) => {
  if (!subjectsList || !addSubjectBtn) return;
  subjectsList.querySelectorAll('.subject-btn').forEach(btn => btn.remove());
  subjects.forEach(subject => {
    const button = document.createElement('button');
    button.textContent = subject.subject_name.charAt(0).toUpperCase();
    button.title = subject.subject_name;
    button.className = `subject-btn w-12 h-12 flex items-center justify-center text-xl font-bold bg-white/10 hover:bg-white/20 border border-solid border-white/30 rounded-full transition-colors`;
    if (subject.id === currentSubjectId) button.classList.add('bg-blue-500/70', 'ring-2', 'ring-white');
    button.onclick = () => selectSubject(subject.id);
    subjectsList.insertBefore(button, addSubjectBtn);
  });
};

const renderTopics = (topics: Topic[]) => {
  if (!topicsList) return;
  topicsList.innerHTML = topics.length === 0 ? `<p class="p-4 text-sm text-white/50">No topics yet.</p>` : '';
  topics.forEach(topic => {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = `# ${topic.topic_name}`;
    a.className = `block px-4 py-2 rounded-lg hover:bg-white/20 transition-colors text-white/85`;
    if (topic.id === currentTopicId) a.classList.add('bg-white/20', 'font-semibold');
    a.onclick = (e) => { e.preventDefault(); selectTopic(topic.id); };
    topicsList.appendChild(a);
  });
};

const renderMessage = (message: Message) => {
  if (!messagesContainer || !chatWindow) return;
  const messageDiv = document.createElement('div');
  const username = message.profiles?.username || '...';
  const timestamp = new Date(message.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageDiv.innerHTML = `<div class="flex items-start gap-3"><div class="w-8 h-8 flex-shrink-0 bg-white/10 rounded-full flex items-center justify-center font-bold text-sm">${username.charAt(0).toUpperCase()}</div><div><div class="flex items-baseline gap-2"><span class="font-bold text-white">${username}</span><span class="text-xs text-white/50">${timestamp}</span></div><p class="text-white/90">${message.message_text}</p></div></div>`;
  messagesContainer.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

// --- DATA ---
const fetchSubjects = async () => {
  const { data: subjects } = await supabase.from('subjects').select('*');
  if (subjects) renderSubjects(subjects);
  if (subjects && subjects.length > 0 && !currentSubjectId) selectSubject(subjects[0].id);
  else if (!subjects || subjects.length === 0) {
    if (subjectNameEl) subjectNameEl.textContent = 'Create a subject!';
    if (topicsList) topicsList.innerHTML = '';
    if (messagesView) messagesView.style.display = 'none';
  }
};

const selectSubject = async (subjectId: number) => {
  if (currentSubjectId === subjectId) return;
  currentSubjectId = subjectId;
  currentTopicId = null;
  if (messagesView) messagesView.style.display = 'none';
  const { data: allSubjects } = await supabase.from('subjects').select('*');
  if(allSubjects) renderSubjects(allSubjects);
  const { data: subject } = await supabase.from('subjects').select('subject_name').eq('id', subjectId).single();
  if (subject && subjectNameEl) subjectNameEl.textContent = subject.subject_name;
  const { data: topics } = await supabase.from('topics').select('*').eq('subject_id', subjectId);
  if(topics) renderTopics(topics);
  if (topics && topics.length > 0) selectTopic(topics[0].id);
  else { if (topicNameEl) topicNameEl.textContent = ''; if (messagesContainer) messagesContainer.innerHTML = ''; }
};

const selectTopic = async (topicId: number) => {
  if (currentTopicId === topicId) return;
  currentTopicId = topicId;
  if (messagesView) messagesView.style.display = 'flex';
  const { data: topics } = await supabase.from('topics').select('*').eq('subject_id', currentSubjectId!);
  if(topics) renderTopics(topics);
  const { data: topic } = await supabase.from('topics').select('topic_name').eq('id', topicId).single();
  if (topic && topicNameEl) topicNameEl.textContent = `# ${topic.topic_name}`;
  if (messagesContainer) messagesContainer.innerHTML = '<p class="text-center text-white/50">Loading messages...</p>';
  const { data: messages } = await supabase.from('messages').select('*, profiles(username)').eq('topic_id', topicId).order('created_at', { ascending: true }).limit(100);
  if (messagesContainer) messagesContainer.innerHTML = '';
  if (messages) messages.forEach(msg => renderMessage(msg as unknown as Message));
  if (messageSubscription) messageSubscription.unsubscribe();
  messageSubscription = supabase.channel(`messages:topic_id=eq.${topicId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `topic_id=eq.${topicId}` }, async (payload) => {
    const { data: newMessage } = await supabase.from('messages').select('*, profiles(username)').eq('id', payload.new.id).single();
    if (newMessage) renderMessage(newMessage as unknown as Message);
  }).subscribe();
};

// --- AUTH ---
const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({ provider: 'google' });
};

const handleAuth = async (session: Session | null) => {
  currentUser = session?.user || null;
  if (currentUser) {
    const username = currentUser.user_metadata.full_name || currentUser.user_metadata.name || currentUser.email?.split('@')[0];
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (!profile && username) {
        const { data: newProfile } = await supabase.from('profiles').insert({ id: currentUser.id, username: username }).select().single();
        currentProfile = newProfile;
    } else {
        currentProfile = profile;
    }
    if (currentProfile) {
      if (currentUsernameEl) currentUsernameEl.textContent = currentProfile.username;
      showAppView();
      await fetchSubjects();
    } else {
      await supabase.auth.signOut();
    }
  } else {
    showAuthView();
    currentSubjectId = null; currentTopicId = null; currentProfile = null;
    if (messageSubscription) messageSubscription.unsubscribe();
  }
};

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', () => supabase.auth.signOut());
  if (messageForm) messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (text && currentTopicId && currentUser) {
      await supabase.from('messages').insert({ message_text: text, topic_id: currentTopicId, user_id: currentUser.id });
      messageInput.value = '';
    }
  });
  if (addSubjectBtn) addSubjectBtn.addEventListener('click', async () => {
    const subjectName = prompt("Enter a new subject name (e.g., 'Algebra II'):");
    if (subjectName && currentProfile) {
      const { data } = await supabase.from('subjects').insert({ subject_name: subjectName, owner_id: currentProfile.id }).select().single();
      if (data) { await fetchSubjects(); selectSubject(data.id); }
      else alert('Failed to create subject.');
    }
  });

  supabase.auth.onAuthStateChange((_event, session) => handleAuth(session));
});
