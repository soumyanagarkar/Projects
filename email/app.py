from flask import *
import spacy
from pickle import load
from reader import read_latest
import threading
import time

nlp = spacy.load("en_core_web_lg")

# Using 'with' is safer for file handling
with open("model.pkl", "rb") as f:
    model = load(f)
with open("vector.pkl", "rb") as f:
    tv = load(f)

def clean_function(text):
    if not text: return ""
    text = text.lower()
    doc = nlp(text)
    # Lemmatize and remove stop words/punctuation
    tokens = [t.lemma_ for t in doc if not t.is_punct and not t.is_stop]
    return " ".join(tokens)

app = Flask(__name__)

latest_body = None
live_result = None
started = False


def analyze_text(text):
    clean_text = clean_function(text)
    vector_text = tv.transform([clean_text])
    raw_result = model.predict(vector_text)[0]
    result = "Not Spam" if str(raw_result).lower() == "ham" else "Spam"

    confidence = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(vector_text)[0]
        class_names = [str(c).lower() for c in model.classes_]
        try:
            class_idx = class_names.index(str(raw_result).lower())
            confidence = float(probs[class_idx]) * 100.0
        except ValueError:
            confidence = float(max(probs)) * 100.0

    keywords = []
    if hasattr(model, "feature_log_prob_") and hasattr(tv, "get_feature_names_out"):
        try:
            feature_names = tv.get_feature_names_out()
            class_list = list(model.classes_)
            class_idx = class_list.index(raw_result)
            row = vector_text.tocsr()
            # Approximate feature contribution for the predicted class.
            weighted_terms = []
            for idx, value in zip(row.indices, row.data):
                score = float(value * model.feature_log_prob_[class_idx][idx])
                weighted_terms.append((feature_names[idx], score))
            weighted_terms.sort(key=lambda item: item[1], reverse=True)
            keywords = [token for token, _ in weighted_terms[:5]]
        except Exception:
            keywords = []

    return {
        "result": result,
        "confidence": confidence,
        "keywords": keywords
    }
def live_check():
    global latest_body, live_result
    print("Live check background thread started...")
    while True:
        try:
            subject, body = read_latest()
            # Process only if the body is NEW (different from latest_body)
            if body and body != latest_body:
                latest_body = body
                analysis = analyze_text(body)
                live_result = {
                    "subject": subject,
                    "body": body,
                    "result": analysis["result"],
                    "confidence": analysis["confidence"],
                    "keywords": analysis["keywords"]
                }
                print(f"--- New email found: {subject} ---")
                print(f"Result is: {analysis['result']}")
        except Exception as exc:
            live_result = {
                "subject": "",
                "body": "",
                "result": f"Live check error: {exc}",
                "confidence": None,
                "keywords": []
            }
        time.sleep(10)

@app.route("/live-result")
def live_result_api():
    global live_result
    if live_result:
        return jsonify(live_result)
    else:
        return jsonify({"result": None})

@app.route("/live")
def live():
    global started
    if not started:
        started = True
        threading.Thread(target=live_check, daemon=True).start()
        return render_template("home.html", result="Live Analysis Started", live_started=started, confidence=None, keywords=[])
    else:
        return render_template("home.html", result="Already started", live_started=started, confidence=None, keywords=[])

@app.route("/check-recent")
def check():
    try:
        subject, body = read_latest()
    except Exception as exc:
        return render_template("home.html", result=f"Email read error: {exc}", live_started=started, confidence=None, keywords=[])

    if not body:
        return render_template("home.html", result="No emails found", live_started=started, confidence=None, keywords=[])

    analysis = analyze_text(body)
    return render_template(
        "home.html",
        result=analysis["result"],
        body=body,
        live_started=started,
        confidence=analysis["confidence"],
        keywords=analysis["keywords"]
    )

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        text = request.form.get("text", "")
        analysis = analyze_text(text)
        return render_template(
            "home.html",
            result=analysis["result"],
            text=text,
            live_started=started,
            confidence=analysis["confidence"],
            keywords=analysis["keywords"]
        )
    return render_template("home.html", live_started=started, confidence=None, keywords=[])

if __name__ == "__main__":
    # use_reloader=False is important when using Threads in Flask
    app.run(debug=True, use_reloader=False)
