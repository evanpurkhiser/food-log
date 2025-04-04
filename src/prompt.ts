import OpenAI from 'openai';
import type {FoodCategory, MealPhoto, MealResponse} from './types';

const client = new OpenAI({
  apiKey: process.env['OPEN_AI_KEY'],
});

const PROMPT = `
You are my personal meal cageorizeer and analyst. Your objective is to
categorize the given photos of food I ate in the past 24 hours. 

## RULES

 - Each date time is associated to the photos in their respective order.

 - Within the day there should almost always be a lunch and dinner. Remember to
   use the timestamps to help inform this category decision. Even if
   the type of food is typically lunch, if it's eaten at dinner time then
   categorize it as dinner.

 - In some scenarios if two photos are taken within minutes of each other and
   appear to be at the same place you should combine those into a single Meal
   result.

`;

const categories: FoodCategory[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'brunch',
  'dessert',
  'beverage',
  'late night',
];

const SCHEMA = {
  type: 'json_schema',
  name: 'meals',
  schema: {
    $defs: {
      Meal: {
        type: 'object',
        properties: {
          name: {
            description: 'A name for the meal. Short and sweet',
            type: 'string',
          },
          category: {
            description:
              "The 'category' of the meal. Use the date of the photo to help you determine this along with the contents of the food.",
            type: 'string',
            enum: categories,
          },
          cusine_type: {
            description:
              "A list of the 'cuisine' of food in the photo, try and look close at the photo to determine this. Here are various examples: italian, mexican, japanese, chinese, indian, mediterranean, korean, thai, french, greek, american, vietnamese, middle eastern. You do not have to pick ONLY from this list. It should ALWAYS be all lowercase.",
            type: 'array',
            items: {
              type: 'string',
              items: {type: 'string'},
            },
          },
          food_type: {
            description:
              "A list of the 'type' of food in the photo, try and look close at the photo to determine this. Here are various examples: burrito, sandwich, pasta, soup, salad, omelet, pizza, boba, stir-fry, sushi, taco, noodles, curry, wrap, dumplings, ramen, pancakes, burger, toast, cereal, steak, bbq, smoothie, ice cream, cake. You do not have to pick ONLY from this list.",
            type: 'array',
            items: {
              type: 'string',
              items: {type: 'string'},
            },
          },
          notes: {
            description: 'The detailed description of the food',
            type: 'string',
          },
        },
        required: ['name', 'category', 'cusine_type', 'food_type', 'notes'],
        additionalProperties: false,
      },
    },
    type: 'object',
    properties: {
      meals: {
        type: 'array',
        items: {$ref: '#/$defs/Meal'},
      },
    },
    required: ['meals'],
    additionalProperties: false,
  },
} as const;

export async function processMealPhotos(photos: MealPhoto[]): Promise<MealResponse> {
  const images = photos.map<OpenAI.Responses.ResponseInputImage>(photo => ({
    type: 'input_image',
    image_url: `data:image/jpeg;base64,${photo.image.toString('base64')}`,
    detail: 'high',
  }));
  const dates = photos.map(photo => photo.dateTaken.toString()).join('\n');

  const response = await client.responses.create({
    model: 'o1',
    text: {format: SCHEMA},
    input: [
      {
        role: 'system',
        content: [{type: 'input_text', text: PROMPT}],
      },
      {
        role: 'user',
        content: [{type: 'input_text', text: dates}, ...images],
      },
    ],
  });

  return JSON.parse(response.output_text);
}
