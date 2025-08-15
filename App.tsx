// Tag‑Along Dating App — React Native (Expo) MVP
// -------------------------------------------------
// One-file MVP you can run on iOS & Android with Expo.
// Features:
// - Discover: list of posted hangouts (time, place, tags, compatibility)
// - Create: post a new hangout (date/time picker, 1‑on‑1 vs group, visibility)
// - Inbox: approve/decline incoming Tag‑Alongs + reminders
// - Profile: basic profile with reliability score and interests
// - Tag‑Along flow: friendly join action with double opt‑in modal
//
// Quick Start (from your terminal):
// 1) Install Expo CLI if needed:  npm i -g expo-cli  (optional; npx works too)
// 2) Create app:                 npx create-expo-app tagalong-mvp
// 3) Replace the generated App.(js/tsx) with THIS file's content
// 4) Start dev server:           cd tagalong-mvp && npm run start
// 5) Open on device:             Scan QR in Expo Go (iOS/Android)
//
// Notes:
// - This MVP uses only React Native core APIs — no extra deps.
// - The "date/time" input uses a simple text field for speed. Swap with
//   @react-native-community/datetimepicker later.
// - All data is in-memory. Wire to Supabase/Firebase when ready.

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';

// Theme types
type Theme = 'dark' | 'light';

// Theme colors
const themes = {
  dark: {
    background: '#0b0b0c',
    surface: '#181a1f',
    primary: '#5561ff',
    text: '#ffffff',
    textSecondary: '#b7beca',
    textMuted: '#9aa3af',
    border: '#262a33',
    card: '#181a1f',
    topbar: '#111214',
    brand: '#c9cbff',
  },
  light: {
    background: '#f0f8ff',
    surface: '#eaf2ff',
    primary: '#3b82f6',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    border: '#e2e8f0',
    card: '#eaf2ff',
    topbar: '#ffffff',
    brand: '#3b82f6',
  },
};

// -----------------------------
// Types
// -----------------------------

type User = {
  id: string;
  name: string;
  age: number;
  mbti: string;
  reliability: number; // 0..5
  avatar: any; // Local image require
  images: any[]; // Array of local images
  bio: string;
  interests: string[];
};

type Hangout = {
  id: string;
  host: User;
  title: string;
  tags: string[];
  when: string;       // e.g., 'Sat, Aug 16 · 4:00 PM'
  where: string;      // venue name
  distance: string;   // e.g., '1.2 km'
  compatibility: number; // 0..100
  isGroup: boolean;
  slots: number;      // for group
  visibility: 'matches' | 'matches+compat';
};

type TagAlongRequest = {
  id: string;
  hangoutId: string;
  from: User;
  note?: string;
  when: string;
  where: string;
  status: 'pending' | 'accepted' | 'declined';
};

// -----------------------------
// Seed Data
// -----------------------------

const you: User = {
  id: 'you',
  name: 'You',
  age: 26,
  mbti: 'ENTP',
  reliability: 5.0,
        avatar: require('./assets/profiles/boys/boy_3/boy_3.jpg'),
      images: [
        require('./assets/profiles/boys/boy_3/boy_3.jpg'),
      ],
  bio: 'Powerlifting nerd · Coffee > Tea · Learning LangChain',
  interests: ['Gym', 'Books', 'Anime', 'Coffee', 'Technology'],
};

const seedHangouts: Hangout[] = [
  {
    id: 'h1',
    host: { 
      id: 'u1', 
      name: 'Ava', 
      age: 27, 
      mbti: 'ENFP', 
      reliability: 4.9,
      avatar: require('./assets/profiles/girl/girl_1/girl_1.png'),
      images: [
        require('./assets/profiles/girl/girl_1/girl_1.png'),
        require('./assets/profiles/girl/girl_1/f_1.png'),
      ],
      bio: 'Coffee enthusiast and book lover. Always up for deep conversations and exploring new cafes around the city.',
      interests: ['Coffee', 'Books', 'Travel', 'Photography', 'Yoga'],
    },
    title: 'Coffee & Slow Chats',
    tags: ['Coffee', 'Books', 'Chill'],
    when: 'Today · 4:30 PM',
    where: 'Java House, Thamel',
    distance: '1.2 km',
    compatibility: 92,
    isGroup: false,
    slots: 1,
    visibility: 'matches',
  },
  {
    id: 'h2',
    host: { 
      id: 'u2', 
      name: 'Niraj', 
      age: 29, 
      mbti: 'INTJ', 
      reliability: 4.7,
      avatar: require('./assets/profiles/boys/boy_1/boy_1.jpg'),
      images: [
        require('./assets/profiles/boys/boy_1/boy_1.jpg'),
      ],
      bio: 'Street photographer and urban explorer. Love capturing the city\'s hidden moments and sharing stories through images.',
      interests: ['Photography', 'Urban Exploration', 'Coffee', 'Music', 'Art'],
    },
    title: 'Evening Photo Walk',
    tags: ['Photography', 'Sunset', 'City'],
    when: 'Tomorrow · 6:00 PM',
    where: 'Patan Durbar Square',
    distance: '4.4 km',
    compatibility: 88,
    isGroup: true,
    slots: 2,
    visibility: 'matches+compat',
  },
  {
    id: 'h3',
    host: { 
      id: 'u3', 
      name: 'Maya', 
      age: 26, 
      mbti: 'ISFJ', 
      reliability: 5.0,
      avatar: require('./assets/profiles/girl/girl_2/girl_2.png'),
      images: [
        require('./assets/profiles/girl/girl_2/girl_2.png'),
        require('./assets/profiles/girl/girl_2/f_2.png'),
      ],
      bio: 'Board game enthusiast and tea connoisseur. Looking for people who appreciate strategic thinking and cozy vibes.',
      interests: ['Board Games', 'Tea', 'Strategy Games', 'Cozy Cafes', 'Reading'],
    },
    title: 'Board Games + Tea',
    tags: ['Coffee', 'Books', 'Chill'],
    when: 'Sun · 5:30 PM',
    where: 'Kawa Tea House, Lazimpat',
    distance: '2.1 km',
    compatibility: 85,
    isGroup: true,
    slots: 3,
    visibility: 'matches+compat',
  },
];

const seedIncoming: TagAlongRequest[] = [
  { 
    id: 'r1', 
    hangoutId: 'your-h1', 
    from: { 
      id: 'u4', 
      name: 'Kriti', 
      age: 25, 
      mbti: 'INFJ', 
      reliability: 4.8,
      avatar: require('./assets/profiles/girl/girl_3/girl_3.png'),
      images: [
        require('./assets/profiles/girl/girl_3/girl_3.png'),
        require('./assets/profiles/girl/girl_3/f_3.png'),
      ],
      bio: 'Book lover and coffee addict. Always looking for meaningful conversations.',
      interests: ['Books', 'Coffee', 'Writing', 'Travel'],
    }, 
    note: 'Love Murakami too', 
    when: 'Sat 4:00 PM', 
    where: 'Java House', 
    status: 'pending' 
  },
  { 
    id: 'r2', 
    hangoutId: 'your-h2', 
    from: { 
      id: 'u5', 
      name: 'Arun', 
      age: 28, 
      mbti: 'ENTP', 
      reliability: 4.6,
      avatar: require('./assets/profiles/boys/boy_2/boy_2.jpg'),
      images: [
        require('./assets/profiles/boys/boy_2/boy_2.jpg'),
      ],
      bio: 'Street photography enthusiast and urban explorer.',
      interests: ['Photography', 'Urban Exploration', 'Coffee', 'Music'],
    }, 
    note: 'Street photo buddy', 
    when: 'Sun 6:30 PM', 
    where: 'Patan Walk', 
    status: 'pending' 
  },
];

// -----------------------------
// Helper UI
// -----------------------------

const Pill = ({ children, theme }: { children: React.ReactNode; theme?: Theme }) => {
  const currentTheme = themes[theme || 'dark'];
  return (
    <View style={[styles.pill, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
      <Text style={[styles.pillText, { color: currentTheme.textSecondary }]}>{children}</Text>
    </View>
  );
};

const Section = ({ title, children, theme }: { title: string; children: React.ReactNode; theme?: Theme }) => {
  const currentTheme = themes[theme || 'dark'];
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{title}</Text>
      {children}
    </View>
  );
};

// -----------------------------
// Screens
// -----------------------------

function DiscoverScreen({ onOpen, theme }: { onOpen: (h: Hangout) => void; theme: Theme }) {
  const currentTheme = themes[theme];
  
  return (
    <FlatList
      data={seedHangouts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onOpen(item)} activeOpacity={0.8}>
          <View style={[styles.card, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            {/* Profile Picture and Basic Info */}
            <View style={styles.profileHeader}>
              <Image source={item.host.avatar} style={styles.profilePic} />
              <View style={styles.profileInfo}>
                              <Text style={[styles.profileName, { color: currentTheme.text }]}>{item.host.name}, {item.host.age}</Text>
              <Text style={[styles.profileMbti, { color: currentTheme.textSecondary }]}>{item.host.mbti} · ⭐ {item.host.reliability.toFixed(1)}</Text>
              <Text style={[styles.profileBio, { color: currentTheme.textMuted }]} numberOfLines={2}>{item.host.bio}</Text>
              </View>
              <View style={[styles.compatibilityBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.compatibilityText}>{item.compatibility}%</Text>
                <Text style={styles.compatibilityLabel}>Match</Text>
              </View>
            </View>

            {/* Hangout Details */}
            <View style={styles.hangoutDetails}>
              <Text style={[styles.cardTitle, { color: currentTheme.text }]}>{item.title}</Text>
              <View style={styles.rowWrap}>
                {item.tags.map((t) => <Pill key={t} theme={theme}>{t}</Pill>)}
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: currentTheme.textMuted }]}>⏰ {item.when}</Text>
                <Text style={[styles.meta, { color: currentTheme.textMuted }]}>📍 {item.where} · {item.distance}</Text>
              </View>
              <View style={styles.cardRowBetween}>
                <Text style={[styles.meta, { color: currentTheme.textMuted }]}>{item.isGroup ? `${item.slots} spots` : '1‑on‑1'}</Text>
                <View style={[styles.tagAlongBtn, { backgroundColor: currentTheme.primary }]}>
                  <Text style={styles.tagAlongText}>Tag‑Along</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

function CreateScreen({ onCreated, theme, myHangouts, onUpdateHangout, onRemoveHangout }: { 
  onCreated: (h: Hangout) => void; 
  theme: Theme;
  myHangouts: Hangout[];
  onUpdateHangout: (id: string, updates: Partial<Hangout>) => void;
  onRemoveHangout: (id: string) => void;
}) {
  const currentTheme = themes[theme];
  const [title, setTitle] = useState('');
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [slots, setSlots] = useState('2');
  const [visibility, setVisibility] = useState<Hangout['visibility']>('matches');
  const [notes, setNotes] = useState('');
  const [editingHangout, setEditingHangout] = useState<Hangout | null>(null);
  const [selectedHangout, setSelectedHangout] = useState<Hangout | null>(null);
  const [showHangoutDetail, setShowHangoutDetail] = useState(false);
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editWhere, setEditWhere] = useState('');
  const [editWhen, setEditWhen] = useState('');
  const [editIsGroup, setEditIsGroup] = useState(false);
  const [editSlots, setEditSlots] = useState('2');
  const [editVisibility, setEditVisibility] = useState<Hangout['visibility']>('matches');

  const canPost = title.trim() && where.trim() && when.trim();

  const post = () => {
    if (!canPost) return Alert.alert('Add details', 'Title, location, and time are required.');
    
    if (editingHangout) {
      // Update existing hangout
      onUpdateHangout(editingHangout.id, { title, where, when, isGroup, slots: Number(slots || '2'), visibility });
      setEditingHangout(null);
      Alert.alert('Updated', 'Your hangout has been updated.');
    } else {
      // Create new hangout
      const newH: Hangout = {
        id: Math.random().toString(36).slice(2),
        host: you,
        title,
        tags: ['Casual', 'Vibes'],
        when,
        where,
        distance: '~',
        compatibility: 100,
        isGroup,
        slots: Number(slots || '2'),
        visibility,
      };
      onCreated(newH);
      Alert.alert('Posted', 'Your hangout is live. Matches can Tag‑Along.');
    }
    
    // Reset form
    setTitle(''); setWhere(''); setWhen(''); setNotes(''); setIsGroup(false); setSlots('2'); setVisibility('matches');
  };

  const editHangout = (hangout: Hangout) => {
    setEditingHangout(hangout);
    setTitle(hangout.title);
    setWhere(hangout.where);
    setWhen(hangout.when);
    setIsGroup(hangout.isGroup);
    setSlots(hangout.slots.toString());
    setVisibility(hangout.visibility);
  };

  const cancelEdit = () => {
    setEditingHangout(null);
    setTitle(''); setWhere(''); setWhen(''); setNotes(''); setIsGroup(false); setSlots('2'); setVisibility('matches');
  };

  const openHangoutDetail = (hangout: Hangout) => {
    setSelectedHangout(hangout);
    setShowHangoutDetail(true);
    setIsEditingInModal(false);
  };

  const startEditingInModal = (hangout: Hangout) => {
    setEditTitle(hangout.title);
    setEditWhere(hangout.where);
    setEditWhen(hangout.when);
    setEditIsGroup(hangout.isGroup);
    setEditSlots(hangout.slots.toString());
    setEditVisibility(hangout.visibility);
    setIsEditingInModal(true);
  };

  const saveEditInModal = () => {
    if (selectedHangout && editTitle.trim() && editWhere.trim() && editWhen.trim()) {
      onUpdateHangout(selectedHangout.id, {
        title: editTitle,
        where: editWhere,
        when: editWhen,
        isGroup: editIsGroup,
        slots: Number(editSlots || '2'),
        visibility: editVisibility,
      });
      setIsEditingInModal(false);
      Alert.alert('Updated', 'Your hangout has been updated.');
    } else {
      Alert.alert('Add details', 'Title, location, and time are required.');
    }
  };

  const cancelEditInModal = () => {
    setIsEditingInModal(false);
  };

  const removeHangout = (id: string) => {
    Alert.alert(
      'Remove Hangout',
      'Are you sure you want to remove this hangout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            onRemoveHangout(id);
            Alert.alert('Removed', 'Hangout has been removed.');
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <Section title="New Hangout" theme={theme}>
        <TextInput 
          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
          placeholder="Title (e.g., Coffee & chats)" 
          placeholderTextColor={currentTheme.textMuted}
          value={title} 
          onChangeText={setTitle} 
        />
        <TextInput 
          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
          placeholder="Location (e.g., Java House, Thamel)" 
          placeholderTextColor={currentTheme.textMuted}
          value={where} 
          onChangeText={setWhere} 
        />
        <TextInput 
          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
          placeholder="When (e.g., Sat · 4:30 PM)" 
          placeholderTextColor={currentTheme.textMuted}
          value={when} 
          onChangeText={setWhen} 
        />
        <View style={styles.rowBetween}>
          <TouchableOpacity 
            onPress={() => setVisibility('matches')} 
            style={[
              styles.toggle, 
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
              visibility==='matches' && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
            ]}
          >
            <Text style={[
              styles.toggleText, 
              { color: currentTheme.textMuted },
              visibility==='matches' && { color: '#ffffff' }
            ]}>Matches only</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setVisibility('matches+compat')} 
            style={[
              styles.toggle, 
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
              visibility==='matches+compat' && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
            ]}
          >
            <Text style={[
              styles.toggleText, 
              { color: currentTheme.textMuted },
              visibility==='matches+compat' && { color: '#ffffff' }
            ]}>Matches + compat</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowBetween}>
          <TouchableOpacity 
            onPress={() => setIsGroup(false)} 
            style={[
              styles.toggle, 
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
              !isGroup && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
            ]}
          >
            <Text style={[
              styles.toggleText, 
              { color: currentTheme.textMuted },
              !isGroup && { color: '#ffffff' }
            ]}>1‑on‑1</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsGroup(true)} 
            style={[
              styles.toggle, 
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
              isGroup && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
            ]}
          >
            <Text style={[
              styles.toggleText, 
              { color: currentTheme.textMuted },
              isGroup && { color: '#ffffff' }
            ]}>Group</Text>
          </TouchableOpacity>
        </View>
        {isGroup && (
          <TextInput 
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
            placeholder="Group size (2‑4)" 
            placeholderTextColor={currentTheme.textMuted}
            keyboardType="number-pad" 
            value={slots} 
            onChangeText={setSlots} 
          />
        )}
        <TextInput 
          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border, height: 90, textAlignVertical: 'top' }]} 
          placeholder="Notes (optional)" 
          placeholderTextColor={currentTheme.textMuted}
          multiline 
          value={notes} 
          onChangeText={setNotes} 
        />
        <TouchableOpacity 
          onPress={post} 
          style={[styles.primaryBtn, { backgroundColor: currentTheme.primary, marginTop: 8 }]}
        >
          <Text style={styles.primaryBtnText}>{editingHangout ? 'Update Hangout' : 'Post Hangout'}</Text>
        </TouchableOpacity>
        
        {editingHangout && (
          <TouchableOpacity 
            onPress={cancelEdit} 
            style={[styles.btn, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, marginTop: 8 }]}
          >
            <Text style={[styles.outlineBtnText, { color: currentTheme.text }]}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </Section>

      <Section title="My Hangouts" theme={theme}>
        {myHangouts.length === 0 ? (
          <Text style={[styles.meta, { color: currentTheme.textMuted, textAlign: 'center' }]}>No hangouts posted yet</Text>
        ) : (
          myHangouts.map((h) => (
            <TouchableOpacity key={h.id} onPress={() => openHangoutDetail(h)} activeOpacity={0.8}>
              <View style={[styles.myHangoutCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
                <Text style={[styles.cardTitle, { color: currentTheme.text }]}>{h.title}</Text>
                <Text style={[styles.meta, { color: currentTheme.textMuted }]}>📍 {h.where} · ⏰ {h.when}</Text>
                <Text style={[styles.meta, { color: currentTheme.textMuted }]}>{h.isGroup ? `${h.slots} spots` : '1‑on‑1'}</Text>
                <View style={styles.rowEnd}>
                  <TouchableOpacity 
                    onPress={(e) => { 
                      e.stopPropagation(); 
                      openHangoutDetail(h);
                      startEditingInModal(h);
                    }} 
                    style={[styles.btn, { backgroundColor: currentTheme.primary, marginRight: 8 }]}
                  >
                    <Text style={styles.primaryBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={(e) => { e.stopPropagation(); removeHangout(h.id); }} 
                    style={[styles.btn, { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
                  >
                    <Text style={styles.primaryBtnText}>🗑️ Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Section>

      <Section title="Your Personality" theme={theme}>
        <View style={styles.rowWrap}>
          {['ENFP','INFJ','INTJ','ENTP','ISFJ','ISTP','ESFP','ENTJ'].map((p) => (
            <Pill key={p} theme={theme}>{p}</Pill>
          ))}
        </View>
        <View style={[styles.rowWrap, { marginTop: 8 }]}>
          {['Books & Lit','Strength Training','Photography','Anime & Manga','Hiking','Coffee Snob'].map((i) => (
            <Pill key={i} theme={theme}>{i}</Pill>
          ))}
        </View>
      </Section>

      {/* Hangout Detail Modal */}
      <Modal visible={showHangoutDetail} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={[styles.modalSheet, { backgroundColor: currentTheme.background }]}>
            {/* Header with Back Button */}
            <View style={[styles.modalTopBar, { borderBottomColor: currentTheme.border }]}>
              <TouchableOpacity onPress={() => setShowHangoutDetail(false)} style={[styles.backButton, { backgroundColor: currentTheme.surface }]}>
                <Text style={[styles.backButtonText, { color: currentTheme.text }]}>← Back</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTopTitle, { color: currentTheme.text }]}>
                {isEditingInModal ? 'Edit Hangout' : 'Hangout Details'}
              </Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={styles.modalScrollContent}
              contentContainerStyle={styles.modalScrollContentContainer}
            >
              {selectedHangout && (
                <>
                  {isEditingInModal ? (
                    /* Edit Mode */
                    <>
                      <Section title="Edit Hangout" theme={theme}>
                        <TextInput 
                          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
                          placeholder="Title" 
                          placeholderTextColor={currentTheme.textMuted}
                          value={editTitle} 
                          onChangeText={setEditTitle} 
                        />
                        <TextInput 
                          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
                          placeholder="Location" 
                          placeholderTextColor={currentTheme.textMuted}
                          value={editWhere} 
                          onChangeText={setEditWhere} 
                        />
                        <TextInput 
                          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
                          placeholder="When" 
                          placeholderTextColor={currentTheme.textMuted}
                          value={editWhen} 
                          onChangeText={setEditWhen} 
                        />
                        
                        <View style={styles.rowBetween}>
                          <TouchableOpacity 
                            onPress={() => setEditVisibility('matches')} 
                            style={[
                              styles.toggle, 
                              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
                              editVisibility==='matches' && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
                            ]}
                          >
                            <Text style={[
                              styles.toggleText, 
                              { color: currentTheme.textMuted },
                              editVisibility==='matches' && { color: '#ffffff' }
                            ]}>Matches only</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => setEditVisibility('matches+compat')} 
                            style={[
                              styles.toggle, 
                              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
                              editVisibility==='matches+compat' && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
                            ]}
                          >
                            <Text style={[
                              styles.toggleText, 
                              { color: currentTheme.textMuted },
                              editVisibility==='matches+compat' && { color: '#ffffff' }
                            ]}>Matches + compat</Text>
                          </TouchableOpacity>
                        </View>
                        
                        <View style={styles.rowBetween}>
                          <TouchableOpacity 
                            onPress={() => setEditIsGroup(false)} 
                            style={[
                              styles.toggle, 
                              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
                              !editIsGroup && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
                            ]}
                          >
                            <Text style={[
                              styles.toggleText, 
                              { color: currentTheme.textMuted },
                              !editIsGroup && { color: '#ffffff' }
                            ]}>1‑on‑1</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => setEditIsGroup(true)} 
                            style={[
                              styles.toggle, 
                              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
                              editIsGroup && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }
                            ]}
                          >
                            <Text style={[
                              styles.toggleText, 
                              { color: currentTheme.textMuted },
                              editIsGroup && { color: '#ffffff' }
                            ]}>Group</Text>
                          </TouchableOpacity>
                        </View>
                        
                        {editIsGroup && (
                          <TextInput 
                            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
                            placeholder="Group size (2‑4)" 
                            placeholderTextColor={currentTheme.textMuted}
                            keyboardType="number-pad" 
                            value={editSlots} 
                            onChangeText={setEditSlots} 
                          />
                        )}
                      </Section>

                      {/* Edit Action Buttons */}
                      <View style={styles.rowBetween}>
                        <TouchableOpacity 
                          onPress={cancelEditInModal} 
                          style={[styles.btn, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, flex: 1, marginRight: 8 }]}
                        >
                          <Text style={[styles.outlineBtnText, { color: currentTheme.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={saveEditInModal} 
                          style={[styles.btn, { backgroundColor: currentTheme.primary, flex: 1, marginLeft: 8 }]}
                        >
                          <Text style={styles.primaryBtnText}>Save Changes</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    /* View Mode */
                    <>
                      {/* Hangout Details */}
                      <View style={styles.hangoutModalDetails}>
                        <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{selectedHangout.title}</Text>
                        <View style={styles.rowWrap}>
                          {selectedHangout.tags.map((t) => <Pill key={t} theme={theme}>{t}</Pill>)}
                        </View>
                        <Text style={[styles.meta, { color: currentTheme.textMuted }]}>⏰ {selectedHangout.when}</Text>
                        <Text style={[styles.meta, { color: currentTheme.textMuted }]}>📍 {selectedHangout.where} · {selectedHangout.distance}</Text>
                        <Text style={[styles.meta, { color: currentTheme.textMuted }]}>{selectedHangout.isGroup ? `${selectedHangout.slots} spots` : '1‑on‑1'}</Text>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.rowBetween}>
                        <TouchableOpacity 
                          onPress={() => startEditingInModal(selectedHangout)} 
                          style={[styles.btn, { backgroundColor: currentTheme.primary, flex: 1, marginRight: 8 }]}
                        >
                          <Text style={styles.primaryBtnText}>✏️ Edit Hangout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => { 
                            setShowHangoutDetail(false); 
                            removeHangout(selectedHangout.id); 
                          }} 
                          style={[styles.btn, { backgroundColor: '#ef4444', flex: 1, marginLeft: 8 }]}
                        >
                          <Text style={styles.primaryBtnText}>🗑️ Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InboxScreen({ theme }: { theme: Theme }) {
  const currentTheme = themes[theme];
  const [incoming, setIncoming] = useState<TagAlongRequest[]>(seedIncoming);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{id: string, message: string, isFromUser: boolean}[]>([]);

  const act = (id: string, status: 'accepted' | 'declined') => {
    setIncoming((prev) => prev.map(r => r.id === id ? { ...r, status } : r));
    if (status === 'accepted') {
      Alert.alert('Accepted', 'You accepted the Tag-Along request!');
    } else {
      Alert.alert('Declined', 'You declined the Tag-Along request.');
    }
  };

  const openProfile = (user: User) => {
    setSelectedProfile(user);
    setShowProfile(true);
  };

  const openChat = (user: User) => {
    setSelectedProfile(user);
    setShowChat(true);
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Math.random().toString(36).slice(2),
        message: chatMessage.trim(),
        isFromUser: true
      };
      setChatHistory(prev => [...prev, newMessage]);
      setChatMessage('');
      // Simulate response after 1 second
      setTimeout(() => {
        const responseMessage = {
          id: Math.random().toString(36).slice(2),
          message: `Thanks for the message! I'll get back to you soon.`,
          isFromUser: false
        };
        setChatHistory(prev => [...prev, responseMessage]);
      }, 1000);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <Section title="Your Matches" theme={theme}>
        {incoming.map((r) => (
          <View key={r.id} style={[styles.reqCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <TouchableOpacity onPress={() => openProfile(r.from)} style={styles.profileRow}>
              <Image 
                source={r.from.avatar} 
                style={[
                  styles.inboxAvatar, 
                  { 
                    borderColor: r.status === 'accepted' ? '#10b981' : 
                                r.status === 'declined' ? '#f97316' : 
                                currentTheme.primary 
                  }
                ]} 
              />
              <View style={styles.inboxProfileInfo}>
                <Text style={[styles.reqName, { color: currentTheme.text }]}>{r.from.name}</Text>
                <Text style={[styles.meta, { color: currentTheme.textMuted }]}>{r.when} · {r.where}</Text>
                {r.note ? <Text style={[styles.note, { color: currentTheme.text }]}>"{r.note}"</Text> : null}
              </View>
            </TouchableOpacity>
            
            <View style={styles.rowEnd}>
              <TouchableOpacity onPress={() => openChat(r.from)} style={[styles.btn, { backgroundColor: currentTheme.primary, marginRight: 8 }]}>
                <Text style={styles.primaryBtnText}>💬 Chat</Text>
              </TouchableOpacity>
              {r.status === 'pending' ? (
                <>
                  <TouchableOpacity onPress={() => act(r.id, 'declined')} style={[styles.btn, styles.outlineBtn, { borderColor: currentTheme.border, marginRight: 8 }]}>
                    <Text style={[styles.outlineBtnText, { color: currentTheme.text }]}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => act(r.id, 'accepted')} style={[styles.btn, { backgroundColor: currentTheme.primary }]}>
                    <Text style={styles.primaryBtnText}>Accept</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => act(r.id, r.status === 'accepted' ? 'declined' : 'accepted')} 
                    style={[
                      styles.btn, 
                      { 
                        backgroundColor: r.status === 'accepted' ? '#ef4444' : '#10b981',
                        marginRight: 8,
                        borderWidth: 2,
                        borderColor: r.status === 'accepted' ? '#dc2626' : '#059669'
                      }
                    ]}
                  >
                    <Text style={styles.primaryBtnText}>
                      {r.status === 'accepted' ? 'Decline' : 'Accept'}
                    </Text>
                  </TouchableOpacity>
                  <View style={[styles.statusBadge, { backgroundColor: r.status === 'accepted' ? '#10b981' : '#f97316' }]}>
                    <Text style={styles.statusBadgeText}>{r.status.toUpperCase()}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        ))}
      </Section>

      <Section title="Reminders" theme={theme}>
        <Text style={[styles.meta, { color: currentTheme.textMuted }]}>⏰ Check‑in available for “Coffee & Slow Chats” in 30 min</Text>
        <Text style={[styles.meta, { color: currentTheme.textMuted }]}>⭐ Rate your last hangout to boost Reliability</Text>
      </Section>

      {/* Profile Modal */}
      <Modal visible={showProfile} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={[styles.modalSheet, { backgroundColor: currentTheme.background }]}>
            {/* Header with Back Button */}
            <View style={[styles.modalTopBar, { borderBottomColor: currentTheme.border }]}>
              <TouchableOpacity onPress={() => setShowProfile(false)} style={[styles.backButton, { backgroundColor: currentTheme.surface }]}>
                <Text style={[styles.backButtonText, { color: currentTheme.text }]}>← Back</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTopTitle, { color: currentTheme.text }]}>Profile</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={styles.modalScrollContent}
              contentContainerStyle={styles.modalScrollContentContainer}
            >
              {selectedProfile && (
                <>
                  {/* Profile Pictures Carousel */}
                  <View style={styles.carouselContainer}>
                    <Text style={[styles.carouselTitle, { color: currentTheme.text }]}>Photos</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.imageCarousel}
                      contentContainerStyle={styles.carouselContent}
                    >
                      {selectedProfile.images.map((image, index) => (
                        <View key={index} style={styles.imageWrapper}>
                          <Image source={image} style={styles.carouselImage} resizeMode="cover" />
                          <Text style={[styles.imageNumber, { color: currentTheme.textMuted }]}>{index + 1} of {selectedProfile.images.length}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Profile Info */}
                  <View style={styles.profileModalHeader}>
                    <Image source={selectedProfile.avatar} style={styles.modalProfilePic} />
                    <View style={styles.modalProfileInfo}>
                      <Text style={[styles.modalProfileName, { color: currentTheme.text }]}>{selectedProfile.name}, {selectedProfile.age}</Text>
                      <Text style={[styles.modalProfileMbti, { color: currentTheme.textSecondary }]}>{selectedProfile.mbti} · ⭐ {selectedProfile.reliability.toFixed(1)}</Text>
                    </View>
                  </View>

                  {/* Bio */}
                  <Text style={[styles.modalBio, { color: currentTheme.text }]}>{selectedProfile.bio}</Text>

                  {/* Interests */}
                  <View style={styles.interestsSection}>
                    <Text style={[styles.interestsTitle, { color: currentTheme.text }]}>Interests</Text>
                    <View style={styles.rowWrap}>
                      {selectedProfile.interests.map((interest) => <Pill key={interest} theme={theme}>{interest}</Pill>)}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.rowBetween}>
                    <TouchableOpacity 
                      onPress={() => { 
                        setShowProfile(false); 
                        openChat(selectedProfile); 
                      }} 
                      style={[styles.btn, { backgroundColor: currentTheme.primary, flex: 1 }]}
                    >
                      <Text style={styles.primaryBtnText}>💬 Start Chat</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal visible={showChat} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={[styles.modalSheet, { backgroundColor: currentTheme.background }]}>
            {/* Header with Back Button */}
            <View style={[styles.modalTopBar, { borderBottomColor: currentTheme.border }]}>
              <TouchableOpacity onPress={() => setShowChat(false)} style={[styles.backButton, { backgroundColor: currentTheme.surface }]}>
                <Text style={[styles.backButtonText, { color: currentTheme.text }]}>← Back</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTopTitle, { color: currentTheme.text }]}>Chat with {selectedProfile?.name}</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Chat Messages */}
            <ScrollView 
              style={styles.chatContainer}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
            >
              {chatHistory.map((msg) => (
                <View key={msg.id} style={[
                  styles.chatMessage,
                  msg.isFromUser ? styles.userMessage : styles.otherMessage,
                  msg.isFromUser ? { backgroundColor: currentTheme.primary } : { backgroundColor: currentTheme.surface }
                ]}>
                  <Text style={[
                    styles.chatMessageText,
                    { color: msg.isFromUser ? '#ffffff' : currentTheme.text }
                  ]}>
                    {msg.message}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Chat Input */}
            <View style={[styles.chatInputContainer, { borderTopColor: currentTheme.border }]}>
              <TextInput 
                style={[styles.chatInput, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
                placeholder="Type a message..." 
                placeholderTextColor={currentTheme.textMuted}
                value={chatMessage} 
                onChangeText={setChatMessage} 
                multiline
              />
              <TouchableOpacity 
                onPress={sendMessage} 
                style={[styles.sendButton, { backgroundColor: currentTheme.primary }]}
                disabled={!chatMessage.trim()}
              >
                <Text style={styles.primaryBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <Section title="You">
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statNum}>5.0</Text><Text style={styles.statLbl}>Reliability</Text></View>
          <View style={styles.statBox}><Text style={styles.statNum}>92%</Text><Text style={styles.statLbl}>Avg Match</Text></View>
          <View style={styles.statBox}><Text style={styles.statNum}>7</Text><Text style={styles.statLbl}>Hangouts</Text></View>
        </View>
        <TextInput style={[styles.input, { marginTop: 8 }]} defaultValue="Powerlifting nerd · Coffee > Tea · Learning LangChain" />
        <View style={styles.rowBetween}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 6 }]} defaultValue="183 cm" />
          <TextInput style={[styles.input, { flex: 1, marginLeft: 6 }]} defaultValue="Gym, Books, Anime" />
        </View>
        <View style={styles.rowEnd}>
          <TouchableOpacity style={[styles.btn, styles.primaryBtn]}><Text style={styles.primaryBtnText}>Save</Text></TouchableOpacity>
        </View>
      </Section>
    </ScrollView>
  );
}

// -----------------------------
// Hangout Detail (Modal)
// -----------------------------

function HangoutDetail({ visible, onClose, hangout, theme }: { visible: boolean; onClose: () => void; hangout?: Hangout | null; theme: Theme }) {
  const currentTheme = themes[theme];
  const [note, setNote] = useState('');
  if (!hangout) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalWrap}>
        <View style={[styles.modalSheet, { backgroundColor: currentTheme.background }]}>
          {/* Header with Back Button */}
          <View style={[styles.modalTopBar, { borderBottomColor: currentTheme.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: currentTheme.surface }]}>
              <Text style={[styles.backButtonText, { color: currentTheme.text }]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTopTitle, { color: currentTheme.text }]}>Profile</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            style={styles.modalScrollContent}
            contentContainerStyle={styles.modalScrollContentContainer}
          >
            {/* Profile Pictures Carousel */}
            <View style={styles.carouselContainer}>
              <Text style={[styles.carouselTitle, { color: currentTheme.text }]}>Photos</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.imageCarousel}
                contentContainerStyle={styles.carouselContent}
              >
                {hangout.host.images.map((image, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={image} style={styles.carouselImage} resizeMode="cover" />
                    <Text style={[styles.imageNumber, { color: currentTheme.textMuted }]}>{index + 1} of {hangout.host.images.length}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Profile Info */}
            <View style={styles.profileModalHeader}>
              <Image source={hangout.host.avatar} style={styles.modalProfilePic} />
              <View style={styles.modalProfileInfo}>
                <Text style={[styles.modalProfileName, { color: currentTheme.text }]}>{hangout.host.name}, {hangout.host.age}</Text>
                <Text style={[styles.modalProfileMbti, { color: currentTheme.textSecondary }]}>{hangout.host.mbti} · ⭐ {hangout.host.reliability.toFixed(1)}</Text>
              </View>
              <View style={[styles.modalCompatibilityBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.modalCompatibilityText}>{hangout.compatibility}%</Text>
                <Text style={styles.modalCompatibilityLabel}>Match</Text>
              </View>
            </View>

            {/* Bio */}
            <Text style={[styles.modalBio, { color: currentTheme.text }]}>{hangout.host.bio}</Text>

            {/* Interests */}
            <View style={styles.interestsSection}>
              <Text style={[styles.interestsTitle, { color: currentTheme.text }]}>Interests</Text>
              <View style={styles.rowWrap}>
                {hangout.host.interests.map((interest) => <Pill key={interest} theme={theme}>{interest}</Pill>)}
              </View>
            </View>

            {/* Hangout Details */}
            <View style={styles.hangoutModalDetails}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{hangout.title}</Text>
              <View style={styles.rowWrap}>{hangout.tags.map((t) => <Pill key={t} theme={theme}>{t}</Pill>)}</View>
              <Text style={[styles.meta, { color: currentTheme.textMuted }]}>⏰ {hangout.when}</Text>
              <Text style={[styles.meta, { color: currentTheme.textMuted }]}>📍 {hangout.where} · {hangout.distance}</Text>
            </View>

            <View style={[styles.safetyBox, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
              <Text style={[styles.safetyHdr, { color: currentTheme.textSecondary }]}>Safety</Text>
              <Text style={[styles.meta, { color: currentTheme.textMuted }]}>First meets are public‑venue only. Share ETA with a friend.</Text>
            </View>

            <Text style={[styles.label, { color: currentTheme.text }]}>Say something (optional)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }]} 
              placeholder="I'd love to tag‑along — fellow book nerd here!" 
              placeholderTextColor={currentTheme.textMuted}
              value={note} 
              onChangeText={setNote} 
            />

            <View style={styles.rowBetween}>
              <Text style={[styles.meta, { color: currentTheme.textMuted }]}>Double opt‑in required · No spam DMs</Text>
              <TouchableOpacity onPress={() => { onClose(); Alert.alert('Sent', `Tag‑Along sent to ${hangout.host.name}.`); }} style={[styles.btn, styles.primaryBtn, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.primaryBtnText}>Tag‑Along</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// -----------------------------
// App Shell with Custom Tabs
// -----------------------------

const TABS = ['Discover', 'Create', 'Matches', 'Profile'] as const;

type TabKey = typeof TABS[number];

export default function App() {
  const [tab, setTab] = useState<TabKey>('Discover');
  const [theme, setTheme] = useState<Theme>('dark');
  const [myHangouts, setMyHangouts] = useState<Hangout[]>(seedHangouts);
  const [active, setActive] = useState<Hangout | null>(null);
  const [open, setOpen] = useState(false);

  const TopBar = useMemo(() => (
    <View style={[styles.topbar, { backgroundColor: themes[theme].topbar }]}>
      <View style={styles.topbarLeft}>
        <Text style={[styles.brand, { color: themes[theme].brand }]}>Tag‑Along</Text>
      </View>
      <Text style={[styles.topTitle, { color: themes[theme].text }]}>{tab}</Text>
      <View style={styles.topbarRight}>
        <TouchableOpacity onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={[styles.themeToggle, { backgroundColor: themes[theme].primary }]}>
          <Text style={styles.themeToggleText}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [tab, theme]);

  const openHangout = (h: Hangout) => { setActive(h); setOpen(true); };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themes[theme].background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      {TopBar}

      <View style={{ flex: 1 }}>
        {tab === 'Discover' && <DiscoverScreen onOpen={openHangout} theme={theme} />}
        {tab === 'Create' && (
          <CreateScreen 
            onCreated={(h) => { setMyHangouts((prev) => [h, ...prev]); setTab('Discover'); }} 
            theme={theme}
            myHangouts={myHangouts}
            onUpdateHangout={(id, updates) => {
              setMyHangouts((prev) => prev.map(h => h.id === id ? { ...h, ...updates } : h));
            }}
            onRemoveHangout={(id) => {
              setMyHangouts((prev) => prev.filter(h => h.id !== id));
            }}
          />
        )}
        {tab === 'Matches' && <InboxScreen theme={theme} />}
        {tab === 'Profile' && <ProfileScreen />}
      </View>

      <View style={[styles.tabbar, { backgroundColor: themes[theme].topbar, borderTopColor: themes[theme].border }]}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabItem, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, { color: themes[theme].textMuted }, tab === t && { color: themes[theme].primary }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <HangoutDetail visible={open} onClose={() => setOpen(false)} hangout={active} theme={theme} />
    </SafeAreaView>
  );
}

// -----------------------------
// Styles
// -----------------------------

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0b0c' },
  topbar: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topbarLeft: { flex: 1 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { fontWeight: '700', fontSize: 18 },
  topTitle: { fontWeight: '600', flex: 1, textAlign: 'center' },
  themeToggle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  themeToggleText: { fontSize: 18 },

  card: { borderRadius: 16, padding: 16, marginBottom: 16, gap: 12, borderWidth: 1 },
  cardRowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  
  // Profile Header Styles
  profileHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  profilePic: { width: 60, height: 60, borderRadius: 30, marginRight: 12, borderWidth: 2, borderColor: '#5561ff' },
  profileInfo: { flex: 1, marginRight: 8 },
  profileName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  profileMbti: { fontSize: 14, marginBottom: 6 },
  profileBio: { fontSize: 12, lineHeight: 16 },
  compatibilityBadge: { alignItems: 'center', backgroundColor: '#5561ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, minWidth: 60 },
  compatibilityText: { fontSize: 16, fontWeight: '800' },
  compatibilityLabel: { fontSize: 10, opacity: 0.8 },
  
  // Hangout Details
  hangoutDetails: { gap: 8 },
  hostLine: { color: '#b7beca', fontSize: 12 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 2 },
  metaRow: { gap: 4 },
  match: { color: '#aaddff', fontWeight: '700' },
  meta: { color: '#9aa3af', fontSize: 12 },
  tagAlongBtn: { backgroundColor: '#5561ff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 },
  tagAlongText: { color: '#fff', fontWeight: '700' },

  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  input: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  rowEnd: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 8 },

  toggle: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  toggleOn: { backgroundColor: '#2a2f39', borderColor: '#3a4250' },
  toggleText: { fontWeight: '600' },
  toggleTextOn: { color: '#e3e6ed' },

  reqCard: { backgroundColor: '#181a1f', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#262a33' },
  myHangoutCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  inboxAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2 },
  inboxProfileInfo: { flex: 1 },
  reqName: { color: '#fff', fontWeight: '700' },
  note: { color: '#d0d7e2', marginTop: 4 },
  status: { fontWeight: '800', marginTop: 6 },
  accepted: { color: '#58d08f' },
  declined: { color: '#ff6b6b' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statBox: { backgroundColor: '#181a1f', padding: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#262a33', width: '32%' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLbl: { color: '#9aa3af', marginTop: 4 },

  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  primaryBtn: { backgroundColor: '#5561ff' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  outlineBtn: { borderWidth: 1, borderColor: '#3a4250' },
  outlineBtnText: { color: '#e3e6ed' },

  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600' },

  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, height: '80%', minHeight: 600 },
  
  // Modal Scrollable Content
  modalScrollContent: { flex: 1 },
  modalScrollContentContainer: { paddingBottom: 40 },
  
  // Modal Top Bar
  modalTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  backButtonText: { fontWeight: '600' },
  modalTopTitle: { fontSize: 18, fontWeight: '700' },
  
  // Image Carousel
  carouselContainer: { marginBottom: 20 },
  carouselTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  imageCarousel: { height: 420 },
  carouselContent: { paddingRight: 16 },
  imageWrapper: { alignItems: 'center' },
  carouselImage: { width: 300, height: 400, borderRadius: 16, marginRight: 16, borderWidth: 1, borderColor: '#262a33' },
  imageNumber: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  
  // Profile Modal Header
  profileModalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalProfilePic: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, borderColor: '#5561ff' },
  modalProfileInfo: { flex: 1 },
  modalProfileName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalProfileMbti: { fontSize: 14 },
  modalCompatibilityBadge: { alignItems: 'center', backgroundColor: '#5561ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, minWidth: 60 },
  modalCompatibilityText: { fontSize: 16, fontWeight: '800' },
  modalCompatibilityLabel: { fontSize: 10, opacity: 0.8 },
  
  // Modal Content
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalBio: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  interestsSection: { marginBottom: 16 },
  interestsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  hangoutModalDetails: { marginBottom: 16 },
  safetyBox: { borderRadius: 12, padding: 10, borderWidth: 1, marginTop: 6 },
  safetyHdr: { fontSize: 12, marginBottom: 4 },
  label: { fontWeight: '700', marginTop: 8 },
  
  // Close Button
  closeBtn: { backgroundColor: '#262a33', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  closeText: { color: '#fff', fontWeight: '700' },

  tabbar: { flexDirection: 'row', borderTopWidth: 1 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { backgroundColor: 'transparent' },
  tabText: { fontWeight: '700' },

  // Chat Styles
  chatContainer: { flex: 1, padding: 16 },
  chatContent: { paddingBottom: 20 },
  chatMessage: { 
    maxWidth: '80%', 
    padding: 12, 
    borderRadius: 16, 
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  userMessage: { 
    alignSelf: 'flex-end',
    backgroundColor: '#5561ff'
  },
  otherMessage: { 
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9'
  },
  chatMessageText: { 
    fontSize: 14, 
    lineHeight: 18 
  },
  chatInputContainer: { 
    flexDirection: 'row', 
    padding: 16, 
    borderTopWidth: 1, 
    alignItems: 'flex-end',
    gap: 8
  },
  chatInput: { 
    flex: 1, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderWidth: 1,
    maxHeight: 100,
    textAlignVertical: 'top'
  },
  sendButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center'
  },
  sendButtonText: { 
    color: '#ffffff', 
    fontWeight: '600' 
  },

  // Status Badge Styles
  statusBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBadgeText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 12 
  },
});
