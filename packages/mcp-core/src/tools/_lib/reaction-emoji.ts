import { z } from 'zod';

// Keep inputs raw for Routes; pre-encoding can double-encode valid keycap emoji.
export const ReactionEmoji = z
  .string()
  .min(1)
  .max(128)
  .refine(
    (value) => value !== '.' && value !== '..' && !/[%/\\?\p{Cc}\p{Cs}]/u.test(value),
    'Use a raw Unicode emoji or name:id, without URL encoding, path syntax, or invalid Unicode',
  );
