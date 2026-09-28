import React from 'react';
import { getBlendById, EmojiBlend } from '../data/emojiKitchen';

interface FormattedTextProps {
  text: string;
  className?: string;
  stickerSize?: 'sm' | 'md' | 'lg';
  onBlendClick?: (blend: EmojiBlend) => void;
}

/**
 * Parses text and converts:
 * 1. [kitchen:blend_id] => inline Emoji Kitchen sticker
 * 2. [emoji_blend:url:alt] => inline custom blend sticker
 * 3. normal text with hashtags
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className = '',
  stickerSize = 'sm',
  onBlendClick
}) => {
  if (!text) return null;

  // Pattern matches [kitchen:id] or [emoji_blend:url:name]
  const tokenRegex = /(\[kitchen:[a-zA-Z0-9_-]+\]|\[emoji_blend:[^\]]+\])/g;

  const parts = text.split(tokenRegex);

  const isPureSticker = parts.length === 3 && parts[0].trim() === '' && parts[2].trim() === '';

  const sizeClasses = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6 align-text-bottom',
    md: 'w-8 h-8 sm:w-10 sm:h-10 align-middle',
    lg: 'w-16 h-16 sm:w-20 sm:h-20'
  };

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('[kitchen:') && part.endsWith(']')) {
          const blendId = part.slice(9, -1);
          const blend = getBlendById(blendId);

          if (blend) {
            const actualSize = isPureSticker ? sizeClasses.lg : sizeClasses[stickerSize];
            return (
              <span
                key={index}
                className={`inline-flex items-center justify-center mx-0.5 align-middle ${
                  onBlendClick ? 'cursor-pointer' : ''
                }`}
                onClick={onBlendClick ? () => onBlendClick(blend) : undefined}
                title={`${blend.name} (${blend.emoji1} + ${blend.emoji2})`}
              >
                <img
                  src={blend.assetUrl}
                  alt={blend.name}
                  loading="lazy"
                  className={`${actualSize} object-contain inline-block drop-shadow-2xs select-none transition-transform hover:scale-125`}
                />
              </span>
            );
          }
          // Fallback if ID unknown: show clean token
          return <span key={index}>{part}</span>;
        }

        if (part.startsWith('[emoji_blend:') && part.endsWith(']')) {
          const content = part.slice(13, -1);
          const [url, alt] = content.split(':');
          if (url) {
            return (
              <span key={index} className="inline-flex items-center justify-center mx-0.5 align-middle">
                <img
                  src={url}
                  alt={alt || 'Emoji Blend'}
                  loading="lazy"
                  className={`${sizeClasses[stickerSize]} object-contain inline-block drop-shadow-2xs select-none`}
                />
              </span>
            );
          }
        }

        // Standard text part
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
