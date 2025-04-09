export type FoodCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snack'
  | 'Brunch'
  | 'Dessert'
  | 'Beverage'
  | 'Coffee'
  | 'Late Night';

export type FoodGroup =
  | 'Fruits'
  | 'Vegetables'
  | 'Grains'
  | 'Protein'
  | 'Dairy'
  | 'Oils and Fats'
  | 'Sweets and Added Sugars'
  | 'Beverages'
  | 'Legumes'
  | 'Nuts and Seeds';

export interface MealResponse {
  meals: MealInfo[];
}

export interface MealInfo {
  name: string;
  category: FoodCategory;
  foodGroups: FoodGroup[];
  cusineType: string[];
  foodType: string[];
  notes: string;
  photosIndexes: number[];
}

export interface MealPhoto {
  /**
   * The ISO8601 date provided by the iOS shortcut
   */
  dateTaken: string;
  /**
   * The binary data of the image
   */
  image: Buffer;
}

export interface StoredPhoto {
  /**
   * The path to the stored photo
   */
  filename: string;
  /**
   * The ISO8601 date provided by the iOS shortcut
   */
  dateTaken: string;
}
