from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the model and necessary data
model = load_model('collaborative_model.h5')
recipes_df = pd.read_csv('recipes_cleaned_with_ids.csv')  # Update path as needed
ratings_df = pd.read_csv('ratings_dataset.csv')  # Update path as needed

# Initialize and fit encoders
user_encoder = LabelEncoder()
recipe_encoder = LabelEncoder()
user_encoder.fit(ratings_df['userId'])
recipe_encoder.fit(ratings_df['recipeId'])

# Initialize and fit TF-IDF vectorizer
tfidf_vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
tfidf_matrix = tfidf_vectorizer.fit_transform(recipes_df['Ingredients'])

def get_content_based_recommendations(user_ingredients, top_n=10):
    user_tfidf = tfidf_vectorizer.transform([user_ingredients])
    cosine_sim = cosine_similarity(user_tfidf, tfidf_matrix)
    similar_indices = cosine_sim.argsort().flatten()[::-1][:top_n]
    return recipes_df.iloc[similar_indices]

def get_tensorflow_recommendations(user_id, top_n=10):
    try:
        user_idx = user_encoder.transform([user_id])[0]
    except:
        # Handle new users
        user_idx = 0  # Default to first user or implement cold start strategy
        
    recipe_ids = np.arange(recipes_df['recipeId'].nunique())
    user_array = np.array([user_idx] * len(recipe_ids))
    predictions = model.predict([user_array, recipe_ids])
    top_indices = predictions.flatten().argsort()[-top_n:][::-1]
    recommended_recipe_ids = recipe_encoder.inverse_transform(top_indices)
    return recipes_df[recipes_df['recipeId'].isin(recommended_recipe_ids)]

def filter_by_ingredients(recipes, ingredients_str):
    ingredients_set = set(ingredients_str.lower().split(', '))
    return recipes[
        recipes['Ingredients'].apply(lambda x: bool(ingredients_set & set(x.lower().split(', '))))
    ]

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        ingredients = data.get('ingredients')
        top_n = data.get('topN', 10)

        if not user_id or not ingredients:
            return jsonify({
                'error': 'Missing required parameters: userId and ingredients'
            }), 400

        # Step 1: Get content-based recommendations
        content_recs = get_content_based_recommendations(ingredients, top_n)
        
        # Step 2: Get collaborative recommendations
        collaborative_recs = get_tensorflow_recommendations(user_id, top_n * 2)
        
        # Step 3: Filter collaborative recommendations by ingredients
        collaborative_recs_filtered = filter_by_ingredients(collaborative_recs, ingredients)
        
        # Step 4: Combine and deduplicate recommendations
        combined_recs = pd.concat([content_recs, collaborative_recs_filtered]).drop_duplicates('recipeId')
        
        # Step 5: Select necessary fields
        final_recommendations = combined_recs.head(top_n)[
            [
                "Category",
                "Description",
                "Image",
                "Ingredient Groups",
                "Instructions",
                "Ratings",
                "Status",
                "Title",
                "Total Time",
                "Yields",
                "recipeId"
            ]
        ].to_dict('records')

        return jsonify({
            'success': True,
            'recommendations': final_recommendations
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)