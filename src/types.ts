export type FoodCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'brunch'
  | 'dessert'
  | 'beverage'
  | 'late night';

export interface MealResponse {
  meals: MealInfo[];
}

export interface MealInfo {
  name: string;
  category: FoodCategory;
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
  image: Buffer;
}
