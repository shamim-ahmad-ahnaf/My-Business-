/**
 * Image processing utilities for Shop Logo upload and resizing
 */

export function resizeImageFile(file: File, maxWidth = 256, maxHeight = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('দয়া করে একটি সঠিক ছবি (JPG, PNG, WebP) নির্বাচন করুন।'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ক্যানভাস তৈরি করা সম্ভব হয়নি।'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error('ছবিটি লোড করা যায়নি।'));
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে।'));
    };
    reader.readAsDataURL(file);
  });
}

// Preset logos using high-quality SVG data URIs
export const PRESET_SHOP_LOGOS = [
  {
    id: 'arat-store',
    name: 'আড়ত স্টোর',
    icon: '🏪',
    bg: 'bg-emerald-700'
  },
  {
    id: 'fresh-veggie',
    name: 'তাজা সবজি',
    icon: '🥬',
    bg: 'bg-green-600'
  },
  {
    id: 'scale-balance',
    name: 'ডিজিটাল পাল্লা',
    icon: '⚖️',
    bg: 'bg-amber-600'
  },
  {
    id: 'potato-onion',
    name: 'আলু-পেঁয়াজ আড়ত',
    icon: '🥔',
    bg: 'bg-amber-700'
  },
  {
    id: 'truck-mukam',
    name: 'মোকাম চালান',
    icon: '🚚',
    bg: 'bg-blue-600'
  }
];
