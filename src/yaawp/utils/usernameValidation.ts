import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Standard allowed characters: lowercase letters, numbers, underscores, periods
export function sanitizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_.]/g, '');
}

export interface UsernameValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  error?: string;
  suggestions: string[];
}

/**
 * Generates alternative creative suggestions based on the base username
 * that are currently available in the system.
 */
export function generateUsernameSuggestions(
  baseInput: string,
  takenUsernames: Set<string>,
  count: number = 4
): string[] {
  const base = sanitizeUsername(baseInput) || 'creator';
  const cleanBase = base.slice(0, 18);

  const currentYear = new Date().getFullYear();
  const shortYear = currentYear.toString().slice(-2);

  const candidatePool: string[] = [
    `${cleanBase}_`,
    `the_${cleanBase}`,
    `real_${cleanBase}`,
    `its_${cleanBase}`,
    `hey_${cleanBase}`,
    `i_am_${cleanBase}`,
    `${cleanBase}_official`,
    `${cleanBase}_hq`,
    `${cleanBase}.yaawp`,
    `${cleanBase}_${shortYear}`,
    `${cleanBase}${Math.floor(10 + Math.random() * 89)}`,
    `${cleanBase}_${Math.floor(100 + Math.random() * 899)}`,
    `${cleanBase}_art`,
    `${cleanBase}_vibes`,
    `daily_${cleanBase}`
  ];

  const uniqueSuggestions: string[] = [];
  for (const candidate of candidatePool) {
    const clean = sanitizeUsername(candidate);
    if (
      clean.length >= 3 &&
      clean.length <= 30 &&
      !takenUsernames.has(clean) &&
      !uniqueSuggestions.includes(clean)
    ) {
      uniqueSuggestions.push(clean);
      if (uniqueSuggestions.length >= count) {
        break;
      }
    }
  }

  // Fallback random padding if pool exhausted
  while (uniqueSuggestions.length < count) {
    const fallback = `${cleanBase}${Math.floor(1000 + Math.random() * 9000)}`;
    if (!takenUsernames.has(fallback) && !uniqueSuggestions.includes(fallback)) {
      uniqueSuggestions.push(fallback);
    }
  }

  return uniqueSuggestions;
}

/**
 * Checks if a username is valid and available locally and in Supabase database.
 * Does NOT reveal other users' credentials.
 */
export async function checkUsernameAvailability(
  rawUsername: string,
  allLocalProfiles: Record<string, UserProfile> | UserProfile[],
  currentUserId?: string
): Promise<UsernameValidationResult> {
  const clean = sanitizeUsername(rawUsername);

  if (!clean) {
    return {
      isValid: false,
      isAvailable: false,
      error: 'Username cannot be empty.',
      suggestions: []
    };
  }

  if (clean.length < 3) {
    return {
      isValid: false,
      isAvailable: false,
      error: 'Username must be at least 3 characters long.',
      suggestions: []
    };
  }

  if (clean.length > 30) {
    return {
      isValid: false,
      isAvailable: false,
      error: 'Username must be 30 characters or fewer.',
      suggestions: []
    };
  }

  // Collect all taken usernames locally
  const profilesArray = Array.isArray(allLocalProfiles)
    ? allLocalProfiles
    : Object.values(allLocalProfiles);

  const takenSet = new Set<string>();
  for (const p of profilesArray) {
    if (p && p.username) {
      const u = p.username.toLowerCase();
      // Allow user to keep their current username
      if (currentUserId && p.id === currentUserId) {
        continue;
      }
      takenSet.add(u);
    }
  }

  let isTaken = takenSet.has(clean);

  // Check Supabase database if configured
  if (!isTaken && isSupabaseConfigured) {
    try {
      // First try RPC check_username_available if trigger/function is installed
      const { data: rpcAvailable, error: rpcError } = await supabase.rpc('check_username_available', {
        check_username: clean,
        exclude_user_id: currentUserId || null
      });

      if (!rpcError && typeof rpcAvailable === 'boolean') {
        if (!rpcAvailable) {
          isTaken = true;
          takenSet.add(clean);
        }
      } else {
        // Fallback to direct query on profiles
        const query = supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', clean)
          .limit(1);

        if (currentUserId) {
          query.neq('id', currentUserId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          isTaken = true;
          takenSet.add(clean);
        }
      }
    } catch {
      // In case of network issue, local check already performed
    }
  }

  if (isTaken) {
    const suggestions = generateUsernameSuggestions(clean, takenSet, 4);
    return {
      isValid: true,
      isAvailable: false,
      error: `This username @${clean} is already taken.`,
      suggestions
    };
  }

  return {
    isValid: true,
    isAvailable: true,
    suggestions: []
  };
}
