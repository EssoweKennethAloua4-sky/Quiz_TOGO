# app.py
# Serveur de la version web : sert le site et enregistre les questions proposées par les joueurs.
# Lancement : python app.py  puis ouvrir http://localhost:8000

import csv
import os
import threading
from datetime import date

from flask import Flask, jsonify, request, send_from_directory

DOSSIER = os.path.dirname(os.path.abspath(__file__))
FICHIER_QUESTIONS = os.path.join(DOSSIER, "questions_togo.csv")
FICHIER_PROPOSEES = os.path.join(DOSSIER, "questions_proposees.csv")
# Réponses du sondage : elles n'entrent pas dans le jeu avant d'être vérifiées
FICHIER_SONDAGE = os.path.join(DOSSIER, "questions_sondage.csv")

COLONNES = ["Catégorie", "Question", "Option 1", "Option 2", "Option 3", "Réponse Correcte"]
COLONNES_PROPOSEES = COLONNES + ["Proposé par", "Date"]

# Seuls ces fichiers du dossier sont accessibles depuis le navigateur
FICHIERS_PUBLICS = {"index.html", "style.css", "script.js", "sondage.html", "questions_togo.csv", "questions_proposees.csv"}

LONGUEUR_MAX_QUESTION = 200
LONGUEUR_MAX_REPONSE = 80
LONGUEUR_MAX_PSEUDO = 40

app = Flask(__name__)
verrou = threading.Lock()


def lire_csv(chemin):
    if not os.path.exists(chemin):
        return []
    with open(chemin, encoding="utf-8", newline="") as f:
        return [ligne for ligne in csv.DictReader(f) if ligne.get("Question")]


def nettoyer(texte, longueur_max):
    texte = " ".join(str(texte or "").split())
    # Empêche Excel d'interpréter le texte comme une formule
    texte = texte.lstrip("=+-@ ")
    return texte[:longueur_max]


@app.route("/")
def accueil():
    return send_from_directory(DOSSIER, "index.html")


@app.route("/sondage")
def page_sondage():
    return send_from_directory(DOSSIER, "sondage.html")


@app.route("/<nom>")
def fichier(nom):
    if nom not in FICHIERS_PUBLICS:
        return "Introuvable", 404
    if nom == "questions_proposees.csv" and not os.path.exists(FICHIER_PROPOSEES):
        return "", 204
    reponse = send_from_directory(DOSSIER, nom)
    reponse.headers["Cache-Control"] = "no-cache"
    return reponse


@app.route("/proposer", methods=["POST"])
def proposer():
    return enregistrer_question(FICHIER_PROPOSEES)


@app.route("/sondage", methods=["POST"])
def sondage():
    return enregistrer_question(FICHIER_SONDAGE)


def enregistrer_question(fichier):
    donnees = request.get_json(silent=True) or {}

    # Champ piège invisible : seuls les robots le remplissent
    if donnees.get("site_web"):
        return jsonify(ok=True)

    categories = {q["Catégorie"] for q in lire_csv(FICHIER_QUESTIONS)}

    categorie = nettoyer(donnees.get("categorie"), 40)
    question = nettoyer(donnees.get("question"), LONGUEUR_MAX_QUESTION)
    options = [nettoyer(o, LONGUEUR_MAX_REPONSE) for o in donnees.get("options", [])][:3]
    pseudo = nettoyer(donnees.get("pseudo"), LONGUEUR_MAX_PSEUDO) or "Anonyme"

    try:
        index_bonne = int(donnees.get("bonne_reponse"))
    except (TypeError, ValueError):
        index_bonne = -1

    if categorie not in categories:
        return jsonify(ok=False, erreur="Choisis une catégorie."), 400
    if len(question) < 10:
        return jsonify(ok=False, erreur="La question est trop courte."), 400
    if len(options) != 3 or not all(options):
        return jsonify(ok=False, erreur="Remplis les trois réponses."), 400
    if len({o.lower() for o in options}) != 3:
        return jsonify(ok=False, erreur="Les trois réponses doivent être différentes."), 400
    if index_bonne not in (0, 1, 2):
        return jsonify(ok=False, erreur="Indique la bonne réponse."), 400

    with verrou:
        existantes = lire_csv(FICHIER_QUESTIONS) + lire_csv(FICHIER_PROPOSEES) + lire_csv(FICHIER_SONDAGE)
        if any(q["Question"].strip().lower() == question.lower() for q in existantes):
            return jsonify(ok=False, erreur="Cette question existe déjà."), 400

        nouveau_fichier = not os.path.exists(fichier)
        with open(fichier, "a", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            if nouveau_fichier:
                writer.writerow(COLONNES_PROPOSEES)
            writer.writerow([categorie, question, *options, options[index_bonne], pseudo, date.today().isoformat()])

    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 8000)))
