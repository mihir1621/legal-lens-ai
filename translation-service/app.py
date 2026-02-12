from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pickle
from huggingface_hub import hf_hub_download
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "LegalLens Translation Service is running"}

# Load model
model_path = hf_hub_download(
    repo_id="Daksh0505/Seq2Seq-LSTM-MultiHeadAttention",
    filename="seq2seq-lstm-multiheadattention-12.3.keras"
)

tokenizer_path = hf_hub_download(
    repo_id="Daksh0505/Seq2Seq-LSTM-MultiHeadAttention",
    filename="seq2seq-tokenizers-12.3M.pkl"
)

model = load_model(model_path)

with open(tokenizer_path, "rb") as f:
    tokenizer = pickle.load(f)

tokenizer_en = tokenizer["english"]
tokenizer_hi = tokenizer["hindi"]

MAX_LEN = 40

class TranslationRequest(BaseModel):
    text: str

# In-memory cache for translations
translation_cache = {}

def preprocess(sentence):
    oov_idx = tokenizer_en.word_index.get("<OOV>", 1)
    seq = [
        tokenizer_en.word_index.get(w.lower(), oov_idx)
        for w in sentence.split()
    ]
    return pad_sequences([seq], maxlen=MAX_LEN, padding="post")

@app.post("/translate")
def translate(req: TranslationRequest):
    # Check cache first
    sentence = req.text.strip()
    if sentence in translation_cache:
        print(f"Returning cached translation for: {sentence[:50]}...")
        return {"translation": translation_cache[sentence]}

    try:
        input_seq = preprocess(sentence)
        
        # Greedy decoding logic
        # We start with the <start> token (index 2)
        start_token = tokenizer_hi.word_index.get("<start>", 2)
        end_token = tokenizer_hi.word_index.get("<end>", 3)
        
        translated_tokens = [start_token]
        
        for _ in range(MAX_LEN):
            # Prepare decoder input (padded to MAX_LEN)
            target_seq = pad_sequences([translated_tokens], maxlen=MAX_LEN, padding='post')
            
            # Predict next token
            try:
                preds = model.predict([input_seq, target_seq], verbose=0)
            except Exception:
                preds = model.predict(input_seq, verbose=0)
            
            # Get the token for the current position
            curr_pos = len(translated_tokens) - 1
            if len(preds.shape) == 3:
                next_token = np.argmax(preds[0, curr_pos, :])
            else:
                next_token = np.argmax(preds[0, :])
            
            if next_token == end_token or next_token == 0:
                break
                
            translated_tokens.append(int(next_token))
            
            if len(translated_tokens) >= MAX_LEN:
                break
        
        # Convert tokens back to words
        result_words = []
        for t in translated_tokens:
            if t not in [start_token, end_token, 0]:
                word = tokenizer_hi.index_word.get(t, "")
                if word:
                    result_words.append(word)
        
        result = " ".join(result_words)
        
        # Store in cache
        translation_cache[sentence] = result
        
    except Exception as e:
        return {"error": str(e), "translation": ""}

    return {"translation": result}
