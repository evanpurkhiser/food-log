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
  category: FoodCategory;
  cusine_type: string[];
  food_type: string[];
}

export interface MealPhoto {
  dateTaken: Date;
  image: Buffer;
}
