// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import {
  Shield,
  Lock,
  Eye,
  Sliders,
  Sparkles,
  HelpCircle,
  Settings,
  Bell,
  Camera,
  FolderLock,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Compass,
  UserCheck,
  FileText,
  KeyRound,
  Trash2,
  Mic,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';

export interface GuideTopicAction {
  label: string;
  actionKey: 'open_privacy' | 'open_security' | 'open_secret_code' | 'open_permissions' | 'open_create_post' | 'explore_feed' | 'open_profile_edit';
  icon?: string;
}

export interface SupportBotResponse {
  text: string;
  suggestedActions?: GuideTopicAction[];
  quickReplies?: string[];
}

export const SUPPORT_BOT_USER = {
  id: 'user_yaawp_support_bot',
  username: 'yaawp_support',
  name: 'yaawp_support bot',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=yaawp_support',
  isVerified: true
};

export const SUPPORT_BOT_WELCOME_MESSAGE = `👋 **Welcome to Yaawp!** I'm your dedicated **yaawp_support bot** — here to help you get the most out of the app.

I can guide you through:
• 🔒 **Privacy Controls** (Private accounts, hiding followers & concealment)
• 🗝️ **Secret Vault & Hidden Chats** (Hiding chats, stories, posts & custom secret codes)
• 🛡️ **App Permissions** (Microphone, Camera, Storage, Location)
• ⚙️ **Finding Settings** (Changing themes, languages, notifications, passwords)
• 🚀 **Getting Started** (Posting, sharing stories, scheduling messages & playing chat games)

Feel free to ask me anything or tap one of the suggested topics below!`;

export const SUPPORT_BOT_SUGGESTED_PROMPTS = [
  'How do I hide a chat?',
  'Where are my Privacy Settings?',
  'How do app permissions work?',
  'How to make my account private?',
  'How do I schedule a message?'
];

interface KnowledgePattern {
  keywords: string[];
  patterns?: RegExp[];
  response: string;
  suggestedActions?: GuideTopicAction[];
  quickReplies?: string[];
}

export const SUPPORT_BOT_KNOWLEDGE_BASE: KnowledgePattern[] = [
  // 1. Secret Vault & Hidden Chats
  {
    keywords: ['hide chat', 'hidden chat', 'secret code', 'vault', 'locked chat', 'unhide', 'hidden vault', 'hide post', 'hide story'],
    response: `🔒 **Secret Vault & Hidden Chats:**
Yaawp features a private vault that conceals sensitive conversations, stories, and posts:

1. **How to Hide a Chat:**
   • Open any chat or conversation menu (3 dots) in Messages.
   • Tap **"Hide Chat"**.
   • You can select whether to hide **Chat messages**, **Stories**, and/or **Feed posts**.
   • Enter your Secret Code to confirm.

2. **How to Access Your Hidden Vault:**
   • Go to **Messages**.
   • Type your **Secret Code** into the search bar at the top! The Hidden Vault will open immediately.

3. **Forgot or Want to Change Code?**
   • Go to **Profile → Settings (3-bar menu) → Privacy → Hidden Chat & Secret Vault** or tap the button below.`,
    suggestedActions: [
      { label: 'Manage Secret Code', actionKey: 'open_secret_code' },
      { label: 'Open Privacy Settings', actionKey: 'open_privacy' }
    ],
    quickReplies: ['How do I change my secret code?', 'Where are privacy settings?', 'How to unhide a chat?']
  },

  // 2. Change / Forgot Secret Code
  {
    keywords: ['change secret code', 'forgot code', 'reset code', 'forgot secret code', 'secret code reset', 'email code'],
    response: `🗝️ **Changing or Resetting Your Secret Code:**

• **If you know your current code:**
  Open your **Profile → 3-Bar Menu → Privacy → Hidden Chat & Secret Vault**. Enter your current code, then type your new security phrase/code.

• **If you forgot your code:**
  Tap **"Forgot Code?"** in the verification prompt. We will simulate sending a secure verification code to your registered email to let you reset your code safely without compromising any private chats!`,
    suggestedActions: [
      { label: 'Change Secret Code Now', actionKey: 'open_secret_code' }
    ],
    quickReplies: ['How do I hide a chat?', 'Where are privacy settings?']
  },

  // 3. Privacy Settings & Account Privacy
  {
    keywords: ['privacy', 'private account', 'make account private', 'hide follower', 'hide profile', 'privacy settings', 'who can see'],
    response: `🛡️ **Privacy & Account Protection:**

Yaawp gives you granular privacy settings:
• **Private Account:** When enabled, only people you approve can see your posts and stories.
• **Hidden Followers/Following:** You can selectively hide your followers list from specific users.
• **One-Way Profile Concealment:** Completely conceal your presence from specific users without alerting them.
• **Secondary Avatar Visibility:** Control who sees your secondary or close-friends avatar.

Tap the button below to jump directly to your Privacy Settings.`,
    suggestedActions: [
      { label: 'Open Privacy Settings', actionKey: 'open_privacy' },
      { label: 'View Security Suite', actionKey: 'open_security' }
    ],
    quickReplies: ['How do I hide a chat?', 'How do permissions work?']
  },

  // 4. Permissions (Just-in-Time)
  {
    keywords: ['permission', 'permissions', 'microphone', 'camera', 'storage', 'location', 'mic', 'photos access', 'deny permission'],
    response: `📱 **App Permissions Guide:**

Yaawp operates on a **strictly Just-In-Time privacy model**. We never trigger annoying popups on startup:
• 🎙️ **Microphone:** Only requested when you tap to record a voice note in chats.
• 📷 **Camera:** Only requested when capturing live photos or stories.
• 📁 **Storage:** Only requested when attaching images, documents, or music to messages.
• 📍 **Location:** Only requested when sharing your live coordinates in a conversation.

You can choose *"While using the app"*, *"Only this time"*, or *"Don't allow"*. To reset all permissions back to default, tap the action below.`,
    suggestedActions: [
      { label: 'Manage App Permissions', actionKey: 'open_permissions' },
      { label: 'Open Privacy Settings', actionKey: 'open_privacy' }
    ],
    quickReplies: ['Where are privacy settings?', 'How to schedule a message?']
  },

  // 5. Creating Posts & Stories
  {
    keywords: ['post', 'create post', 'share story', 'story', 'upload photo', 'upload video', 'caption'],
    response: `📸 **Creating Posts & Stories:**

• **To Create a Post:**
  Tap the **"+" (Create)** icon on the sidebar (desktop) or navigation bar (mobile). Choose your photo/video, write a caption, pick tags, and share to the feed.

• **To Share a Story:**
  Tap **"Your Story"** at the top of the Home Feed. You can customize duration (12h, 24h, 48h) and select between Public or Close Friends.`,
    suggestedActions: [
      { label: 'Create a Post', actionKey: 'open_create_post' },
      { label: 'Explore Feed', actionKey: 'explore_feed' }
    ],
    quickReplies: ['How do I hide a chat?', 'Where are privacy settings?']
  },

  // 6. Messaging Features (Scheduling, Voice Notes, Games)
  {
    keywords: ['schedule', 'schedule message', 'voice note', 'game', 'play game', 'chat game', 'poll', 'attachment'],
    response: `💬 **Rich Messaging Features:**

In any chat conversation, tap the **"+" (Attachments)** icon next to the message input to explore:
• ⏰ **Schedule Message:** Write a message and pick an exact future date & time to automatically deliver it.
• 🎙️ **Voice Notes:** Tap the microphone button to record high-fidelity voice notes with waveform playback.
• 🎮 **In-Chat Games:** Play interactive Turn-based Tic-Tac-Toe, Rock Paper Scissors, Connect 4, and Dots & Boxes directly with friends!
• 📊 **Polls & Attachments:** Create group voting polls, share locations, documents, and audio tracks.`,
    suggestedActions: [
      { label: 'Open Privacy Settings', actionKey: 'open_privacy' }
    ],
    quickReplies: ['How do I hide a chat?', 'How do permissions work?']
  },

  // 7. General Settings (Theme, Language, Account)
  {
    keywords: ['settings', 'theme', 'dark mode', 'light mode', 'language', 'change language', 'password', 'two factor', '2fa', 'delete account'],
    response: `⚙️ **Finding Specific Settings in Yaawp:**

To navigate to settings:
1. Tap your **Profile** tab in the navigation bar.
2. Click the **3-Bar Menu** in the top right corner.
3. You will find:
   • 🎨 **Display & Theme:** Switch between Dark and Light mode.
   • 🌐 **Language:** Pick from 30+ fully supported localizations.
   • 🔐 **Privacy & Security:** Account privacy, two-factor authentication, chat passcode lock, and Secret Vault.
   • 📦 **Data & Export:** Download your personal data archive.`,
    suggestedActions: [
      { label: 'Open Settings Menu', actionKey: 'open_privacy' },
      { label: 'Open Security Suite', actionKey: 'open_security' },
      { label: 'Edit Profile Info', actionKey: 'open_profile_edit' }
    ],
    quickReplies: ['Where are privacy settings?', 'How to make my account private?']
  },

  // 8. Security Suite & Two-Factor Authentication
  {
    keywords: ['security', 'passcode', 'lock chat', 'pin', 'two factor authentication', 'audit log'],
    response: `🔐 **Security Suite:**

Yaawp includes enterprise-grade local security:
• **Chat Passcode Lock:** Set a 4-digit PIN that locks the entire Messages inbox whenever you navigate away.
• **Two-Factor Authentication (2FA):** Extra verification for account operations.
• **Security Audit Logs:** View local timestamps and records of security events and logins.

Tap below to open the Security Suite dialog.`,
    suggestedActions: [
      { label: 'Open Security Suite', actionKey: 'open_security' },
      { label: 'Manage Secret Code', actionKey: 'open_secret_code' }
    ],
    quickReplies: ['How do I hide a chat?', 'Where are privacy settings?']
  }
];

export function getAutomatedBotResponse(userPrompt: string): SupportBotResponse {
  const query = userPrompt.toLowerCase().trim();

  // Guard against any queries trying to probe system internals or credentials
  const restrictedKeywords = ['api key', 'env', 'database password', 'secret key', 'service role', 'process.env', 'supabase_key', 'backend token', 'sql injection', 'schema'];
  if (restrictedKeywords.some(rk => query.includes(rk))) {
    return {
      text: `🔒 **Security Notice:**
All sensitive backend credentials, database records, and system configurations are strictly encrypted and protected. For your privacy and security, internal infrastructure parameters cannot be accessed or revealed.

If you have questions about user privacy or safeguarding your personal account data, I'm glad to assist!`,
      suggestedActions: [
        { label: 'Open Privacy Settings', actionKey: 'open_privacy' },
        { label: 'View Security Suite', actionKey: 'open_security' }
      ]
    };
  }

  // Find best knowledge match based on matched keywords count
  let bestMatch: KnowledgePattern | null = null;
  let highestScore = 0;

  for (const item of SUPPORT_BOT_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (query.includes(kw)) {
        score += kw.length; // weight longer specific phrases higher
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      text: bestMatch.response,
      suggestedActions: bestMatch.suggestedActions,
      quickReplies: bestMatch.quickReplies
    };
  }

  // Friendly conversational fallbacks
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return {
      text: `Hello there! 👋 How can I help you today? You can ask me how to hide chats with a secret code, adjust privacy options, manage permissions, or find any setting in Yaawp!`,
      suggestedActions: [
        { label: 'Open Privacy Settings', actionKey: 'open_privacy' },
        { label: 'Manage Secret Code', actionKey: 'open_secret_code' }
      ],
      quickReplies: ['How do I hide a chat?', 'Where are privacy settings?', 'How do permissions work?']
    };
  }

  if (query.includes('thank') || query.includes('thanks') || query.includes('cool') || query.includes('awesome')) {
    return {
      text: `You're very welcome! 😊 Remember, you can message me anytime right here if you ever have questions or need guidance finding any setting. Have fun on Yaawp!`,
      quickReplies: ['How do I hide a chat?', 'Where are privacy settings?']
    };
  }

  // Generic fallback with helpful guide options
  return {
    text: `I'm here to guide you with any features or settings in Yaawp! Here are the most common things users ask about:

• 🔒 **Hiding Chats & Secret Vault:** Hide chats from your inbox and unlock them by typing your Secret Code in search.
• 🛡️ **Privacy & Account Controls:** Control who views your profile, followers, or posts in **Settings → Privacy**.
• 📱 **Permissions:** Control camera, microphone, storage, and location access on a just-in-time basis.
• ⏰ **Scheduled Messages & Games:** Explore interactive features inside any conversation's attachment menu.

What would you like to explore?`,
    suggestedActions: [
      { label: 'Open Privacy Settings', actionKey: 'open_privacy' },
      { label: 'Manage Secret Code', actionKey: 'open_secret_code' },
      { label: 'Manage Permissions', actionKey: 'open_permissions' }
    ],
    quickReplies: [
      'How do I hide a chat?',
      'Where are my Privacy Settings?',
      'How do app permissions work?'
    ]
  };
}
