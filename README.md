# 🇹🇬 Quiz TOGO — Connais-tu le Togo ?

Un quiz interactif sur le Togo disponible en **version web**, en **version terminal** et en **version graphique (Tkinter)**, avec près de **200 questions** réparties en plusieurs catégories.

---

## 📁 Structure du projet

```
Quiz_TOGO/
│
├── questions_togo.csv     # Base de données des questions (vérifiées)
├── questions_proposees.csv# Questions proposées par les joueurs (créé automatiquement)
├── questions_sondage.csv  # Réponses au sondage (créé automatiquement)
├── sondage.html           # Formulaire de sondage pour récolter des questions
├── app.py                 # Serveur de la version web
├── index.html             # Version web : page
├── style.css              # Version web : apparence
├── script.js              # Version web : logique du quiz
├── quiz.py                # Version terminal (console)
├── quiz_tkinter.py        # Version graphique (interface Tkinter)
├── server.py              # Serveur Flask (bot WhatsApp)
├── requirements.txt       # Dépendances Python
└── README.md              # Ce fichier
```

---

## 🗂️ Catégories disponibles

| Catégorie     | Description                              |
|---------------|------------------------------------------|
| 📜 Histoire   | Colonisation, indépendance, présidents   |
| 🌍 Géographie | Villes, fleuves, régions, frontières     |
| 🏆 Sport      | Football, Jeux Olympiques, athlètes      |
| 🏛️ Institutions | Constitution, gouvernement, drapeau   |

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/EssoweKennethAloua4-sky/Quiz_TOGO.git
cd Quiz_TOGO
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

---

## ▶️ Lancer le quiz

### Version terminal (console)

```bash
python quiz.py
```

### Version graphique (Tkinter)

```bash
python quiz_tkinter.py
```

> **Note :** Tkinter est inclus par défaut avec Python. Si ce n'est pas le cas :
> ```bash
> sudo apt install python3-tk  # Linux
> ```

### Version web (navigateur)

```bash
python app.py
```

Puis ouvrir http://localhost:8000.

À la fin de chaque partie, le joueur peut **rejouer** ou **proposer une question**.
Les questions proposées sont enregistrées dans `questions_proposees.csv` et entrent **tout de suite** dans le jeu,
avec la mention « Proposée par … · pas encore vérifiée ».

> Pour que les propositions soient conservées en ligne, il faut un hébergement Python avec un disque permanent
> (par exemple PythonAnywhere). GitHub Pages ne peut pas enregistrer de propositions.

#### ✅ Vérification mensuelle des propositions

1. Ouvrir `questions_proposees.csv` (Excel, LibreOffice ou un éditeur de texte).
2. Supprimer les lignes fausses, en double ou inappropriées.
3. Corriger les fautes si besoin.
4. Copier les lignes validées à la fin de `questions_togo.csv` **sans les deux dernières colonnes** (« Proposé par » et « Date »).
5. Supprimer ces lignes de `questions_proposees.csv` (ou supprimer le fichier : il sera recréé à la prochaine proposition).

Les questions recopiées dans `questions_togo.csv` n'affichent plus la mention « pas encore vérifiée ».

### 📝 Sondage pour récolter des questions

Un formulaire simple est disponible sur http://localhost:8000/sondage (même serveur que le jeu).
Les réponses sont enregistrées dans `questions_sondage.csv`.
Contrairement aux propositions de fin de partie, **elles n'entrent pas dans le jeu** tant qu'elles ne sont pas recopiées
dans `questions_togo.csv` (même méthode que la vérification mensuelle).

### Serveur Flask (bot WhatsApp)

```bash
python server.py
```

---

## 📊 Format du fichier CSV

Le fichier `questions_togo.csv` suit ce format :

| Catégorie | Question | Option 1 | Option 2 | Option 3 | Réponse Correcte |
|-----------|----------|----------|----------|----------|------------------|
| Histoire  | Qui fut le premier président du Togo ? | Sylvanus Olympio | Gnassingbé Eyadéma | Faure Gnassingbé | Sylvanus Olympio |

---

## 🛠️ Technologies utilisées

- **Python 3**
- **Pandas** — lecture du fichier CSV
- **Tkinter** — interface graphique
- **Flask** — serveur web léger

---

## 📄 Licence

Ce projet est open-source sous licence [MIT](LICENSE).

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour ajouter des questions :

1. Fork le dépôt
2. Modifie `questions_togo.csv` en respectant le format
3. Crée une Pull Request

---

> Fait avec ❤️ pour valoriser la culture et l'histoire du Togo 🇹🇬
