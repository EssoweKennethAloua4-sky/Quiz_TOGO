# 🌍 Guide — Mettre le quiz et le sondage en ligne sur PythonAnywhere

Dans ce guide, remplace **TONPSEUDO** par ton nom d'utilisateur PythonAnywhere.

---

## ÉTAPE 1 — Envoyer le code sur GitHub

Dans un terminal, dans le dossier `Quiz_TOGO` :

```bash
git add .
git commit -m "Version web, propositions de questions et sondage"
git push
```

> Les fichiers `questions_proposees.csv` et `questions_sondage.csv` ne partent pas sur GitHub (ils sont dans `.gitignore`) : c'est voulu.

---

## ÉTAPE 2 — Créer le compte PythonAnywhere

1. Va sur https://www.pythonanywhere.com
2. Clique sur **Pricing & signup** puis **Create a Beginner account** (gratuit)
3. Choisis bien ton nom d'utilisateur : il sera dans l'adresse du site (`TONPSEUDO.pythonanywhere.com`)

---

## ÉTAPE 3 — Récupérer le code

1. Dans le tableau de bord, onglet **Consoles**, clique sur **Bash**
2. Tape :

```bash
git clone https://github.com/kennethaloua00-spec/Quiz_TOGO.git
pip3.13 install --user flask
```

> Si le dépôt GitHub est **privé**, GitHub demandera un identifiant et un *token* à la place du mot de passe.
> Le plus simple est de laisser le dépôt public.

---

## ÉTAPE 4 — Créer l'application web

1. Onglet **Web** → **Add a new web app** → **Next**
2. Choisis **Manual configuration** (pas « Flask ») → **Python 3.13** → **Next**
3. Sur la page de l'application, section **Code** :
   - **Source code** : `/home/TONPSEUDO/Quiz_TOGO`
   - **Working directory** : `/home/TONPSEUDO/Quiz_TOGO`
4. Clique sur le lien du **WSGI configuration file** (`/var/www/TONPSEUDO_pythonanywhere_com_wsgi.py`),
   **efface tout** son contenu et remplace-le par :

```python
import sys

sys.path.insert(0, "/home/TONPSEUDO/Quiz_TOGO")

from app import app as application
```

5. Clique sur **Save**, puis reviens sur l'onglet **Web** et clique sur le gros bouton vert **Reload**
6. (Conseillé) Section **Security** : active **Force HTTPS**

---

## ÉTAPE 5 — Tester

- Le jeu : https://TONPSEUDO.pythonanywhere.com
- Le sondage : https://TONPSEUDO.pythonanywhere.com/sondage

Envoie une question de test dans le sondage, puis vérifie à l'étape 6 qu'elle est bien arrivée.

> En cas de page d'erreur : onglet **Web** → section **Log files** → ouvre l'**error log** et regarde les dernières lignes.

---

## ÉTAPE 6 — Récupérer les réponses

1. Onglet **Files** → dossier `Quiz_TOGO`
2. Clique sur l'icône de téléchargement à côté de :
   - `questions_sondage.csv` → les réponses au sondage
   - `questions_proposees.csv` → les questions proposées en fin de partie
3. Ouvre-les dans Excel ou LibreOffice, garde les bonnes lignes et colle-les dans `questions_togo.csv`
   **sans les deux dernières colonnes** (« Proposé par » et « Date »)

---

## Mettre à jour le site plus tard

Après avoir modifié le code et fait `git push` sur ton ordinateur :

1. Sur PythonAnywhere, ouvre une console **Bash** et tape :

```bash
cd Quiz_TOGO
git pull
```

2. Onglet **Web** → **Reload**

> Les réponses déjà reçues ne sont pas touchées par `git pull`.
> ⚠️ Si tu ajoutes des questions à `questions_togo.csv`, fais-le sur ton ordinateur puis `git push` / `git pull`,
> pas directement sur PythonAnywhere, sinon `git pull` refusera de se lancer.

---

## ⏰ À ne pas oublier

Avec le compte gratuit, le site s'arrête au bout de **3 mois** sans action.
Un e-mail te prévient avant : il suffit d'aller dans l'onglet **Web** et de cliquer sur
**Run until 3 months from today**.
