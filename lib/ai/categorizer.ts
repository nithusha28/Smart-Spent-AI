import { ExpenseCategory } from '../types';

const categoryKeywords: { [key in ExpenseCategory]: string[] } = {
  Food: [
    'coffee',
    'restaurant',
    'pizza',
    'burger',
    'lunch',
    'dinner',
    'breakfast',
    'food',
    'grocery',
    'supermarket',
    'cafe',
    'bakery',
    'delivery',
    'uber eats',
    'doordash',
    'grubhub',
    'milk',
    'bread',
    'fruit',
    'vegetable',
  ],
  Transport: [
    'bus',
    'taxi',
    'uber',
    'lyft',
    'gas',
    'petrol',
    'parking',
    'train',
    'subway',
    'metro',
    'fuel',
    'toll',
    'transit',
    'transportation',
    'flight',
    'airline',
  ],
  Education: [
    'school',
    'course',
    'tuition',
    'textbook',
    'book',
    'university',
    'college',
    'class',
    'lesson',
    'learning',
    'education',
    'udemy',
    'coursera',
    'study',
    'exam',
  ],
  Entertainment: [
    'movie',
    'cinema',
    'theater',
    'concert',
    'game',
    'netflix',
    'spotify',
    'hulu',
    'disney',
    'streaming',
    'ticket',
    'show',
    'entertainment',
    'podcast',
  ],
  Utilities: [
    'electricity',
    'water',
    'gas',
    'internet',
    'phone',
    'bill',
    'utility',
    'power',
    'broadband',
    'cable',
    'telecom',
    'provider',
  ],
  Shopping: [
    'mall',
    'shop',
    'store',
    'amazon',
    'ebay',
    'target',
    'walmart',
    'shopping',
    'clothes',
    'dress',
    'shoe',
    'fashion',
    'apparel',
    'retail',
    'purchase',
    'fashion',
  ],
  Health: [
    'doctor',
    'hospital',
    'pharmacy',
    'medicine',
    'health',
    'gym',
    'fitness',
    'yoga',
    'medical',
    'clinic',
    'dental',
    'dentist',
    'prescription',
    'healthcare',
  ],
  Other: ['misc', 'other', 'miscellaneous'],
};

export function categorizeExpense(description: string): ExpenseCategory {
  const lowerDescription = description.toLowerCase();

  // Score each category based on matching keywords
  const scores: { [key in ExpenseCategory]: number } = {
    Food: 0,
    Transport: 0,
    Education: 0,
    Entertainment: 0,
    Utilities: 0,
    Shopping: 0,
    Health: 0,
    Other: 0,
  };

  // Count keyword matches for each category
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerDescription.includes(keyword)) {
        scores[category as ExpenseCategory] += 1;
      }
    });
  });

  // Find category with highest score
  let maxScore = 0;
  let bestCategory: ExpenseCategory = 'Other';

  Object.entries(scores).forEach(([category, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category as ExpenseCategory;
    }
  });

  return maxScore > 0 ? bestCategory : 'Other';
}

// Alternative: Use a more sophisticated pattern matching
export function categorizeExpenseAdvanced(description: string): {
  category: ExpenseCategory;
  confidence: number;
} {
  const category = categorizeExpense(description);

  const lowerDescription = description.toLowerCase();
  const keywords = categoryKeywords[category] || [];

  const matchCount = keywords.filter((k) => lowerDescription.includes(k)).length;
  const confidence = Math.min(100, (matchCount * 25) + 25); // Base 25% to 100%

  return { category, confidence };
}
