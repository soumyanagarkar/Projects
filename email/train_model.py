import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report
from pickle import dump
import spacy

# load data
data = pd.read_csv("spam.csv")

# load spacy model
nlp = spacy.load("en_core_web_lg")

def clean_function(text):
    text = text.lower()
    text = nlp(text)
    text = [t for t in text]
    text = [t for t in text if not t.is_punct]
    text = [t for t in text if not t.is_stop]
    text = [t.lemma_ for t in text]
    text = [str(t) for t in text]
    text = " ".join(text)
    return text

# clean text
data["clean_review"] = data["review"].apply(clean_function)

# vectorize
tv = TfidfVectorizer()
vector = tv.fit_transform(data["clean_review"])
features = pd.DataFrame(vector.toarray(), columns=tv.get_feature_names_out())
target = data["result"]

# train model
model = MultinomialNB()
model.fit(features.values, target)

# ===== ADD CLASSIFICATION REPORT =====
pred = model.predict(features.values)
print(classification_report(target, pred))

# save model
with open("model1.pkl","wb") as f:
    dump(model,f)

with open("vector1.pkl","wb") as f:
    dump(tv,f)
