// Version web du quiz : même logique que quiz_tkinter.py

const NOMBRE_QUESTIONS = 10;

let toutesLesQuestions = [];
let categoriesOfficielles = [];
let categorieChoisie = null;
let questions = [];
let questionIndex = 0;
let score = 0;
let mauvaisesReponses = [];

const ecrans = {
    accueil: document.getElementById("ecran-accueil"),
    question: document.getElementById("ecran-question"),
    fin: document.getElementById("ecran-fin"),
    proposer: document.getElementById("ecran-proposer"),
};

// ------------------------------
// CHARGEMENT DU CSV
// ------------------------------

// Découpe une ligne CSV en gérant les champs entre guillemets (qui peuvent contenir des virgules)
function decouperLigne(ligne) {
    const valeurs = [];
    let valeur = "";
    let entreGuillemets = false;

    for (let i = 0; i < ligne.length; i++) {
        const c = ligne[i];
        if (entreGuillemets) {
            if (c === '"' && ligne[i + 1] === '"') { valeur += '"'; i++; }
            else if (c === '"') entreGuillemets = false;
            else valeur += c;
        } else if (c === '"' && valeur === "") entreGuillemets = true;
        else if (c === ",") { valeurs.push(valeur); valeur = ""; }
        else valeur += c;
    }
    valeurs.push(valeur);
    return valeurs;
}

function lireCSV(texte) {
    const lignes = texte.split(/\r?\n/).filter((ligne) => ligne.trim() !== "");
    if (!lignes.length) return [];
    const entetes = decouperLigne(lignes[0]);

    return lignes.slice(1).map((ligne) => {
        const valeurs = decouperLigne(ligne);
        const objet = {};
        entetes.forEach((entete, i) => (objet[entete.trim()] = (valeurs[i] || "").trim()));
        return objet;
    });
}

// On ignore les questions dont la bonne réponse ne fait pas partie des options
function questionValide(q) {
    const valide = [q["Option 1"], q["Option 2"], q["Option 3"]].includes(q["Réponse Correcte"]);
    if (!valide) console.warn("Question ignorée (réponse absente des options) :", q.Question);
    return valide;
}

async function chargerQuestions() {
    try {
        const reponse = await fetch("questions_togo.csv", { cache: "no-cache" });
        if (!reponse.ok) throw new Error();
        toutesLesQuestions = lireCSV(await reponse.text()).filter(questionValide);
        categoriesOfficielles = [...new Set(toutesLesQuestions.map((q) => q["Catégorie"]))];

        // Questions proposées par les joueurs (absentes si le site tourne sans le serveur Flask)
        try {
            const reponseProposees = await fetch("questions_proposees.csv", { cache: "no-cache" });
            if (reponseProposees.ok) {
                const proposees = lireCSV(await reponseProposees.text())
                    .filter((q) => categoriesOfficielles.includes(q["Catégorie"]))
                    .filter(questionValide)
                    .map((q) => ({ ...q, proposee: true }));
                toutesLesQuestions = toutesLesQuestions.concat(proposees);
            }
        } catch {
            // Pas de questions proposées : on joue avec les questions officielles
        }

        afficherCategories();
        remplirCategoriesFormulaire();
    } catch {
        const erreur = document.getElementById("erreur-chargement");
        erreur.textContent = "Impossible de charger questions_togo.csv.";
        erreur.hidden = false;
    }
}

// ------------------------------
// ACCUEIL
// ------------------------------

function afficherCategories() {
    const conteneur = document.getElementById("categories");
    conteneur.innerHTML = "";
    const categories = [...categoriesOfficielles, "Toutes"];

    categories.forEach((categorie) => {
        const nombre = categorie === "Toutes"
            ? toutesLesQuestions.length
            : toutesLesQuestions.filter((q) => q["Catégorie"] === categorie).length;

        const bouton = document.createElement("button");
        bouton.className = "categorie";
        const compteur = document.createElement("small");
        compteur.textContent = `${nombre} questions`;
        bouton.append(categorie, compteur);
        bouton.addEventListener("click", () => {
            document.querySelectorAll(".categorie").forEach((b) => b.classList.remove("choisie"));
            bouton.classList.add("choisie");
            categorieChoisie = categorie;
            document.getElementById("bouton-commencer").disabled = false;
        });
        conteneur.appendChild(bouton);
    });
}

function montrerEcran(nom) {
    Object.entries(ecrans).forEach(([cle, ecran]) => (ecran.hidden = cle !== nom));
}

function melanger(tableau) {
    const copie = [...tableau];
    for (let i = copie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
}

// ------------------------------
// QUIZ
// ------------------------------

function commencerQuiz() {
    const filtrees = categorieChoisie === "Toutes"
        ? toutesLesQuestions
        : toutesLesQuestions.filter((q) => q["Catégorie"] === categorieChoisie);

    questions = melanger(filtrees).slice(0, NOMBRE_QUESTIONS);
    questionIndex = 0;
    score = 0;
    mauvaisesReponses = [];

    montrerEcran("question");
    afficherQuestion();
}

function afficherQuestion() {
    const question = questions[questionIndex];

    document.getElementById("progression").textContent = `Question ${questionIndex + 1} / ${questions.length}`;
    document.getElementById("score").textContent = `Score : ${score}`;
    document.getElementById("barre-remplie").style.width = `${(questionIndex / questions.length) * 100}%`;
    document.getElementById("question").textContent = question.Question;

    const badge = document.getElementById("badge-proposee");
    badge.hidden = !question.proposee;
    badge.textContent = `💡 Proposée par ${question["Proposé par"] || "un joueur"} · pas encore vérifiée`;
    document.getElementById("retour").textContent = "";
    document.getElementById("bouton-suivant").hidden = true;

    const conteneur = document.getElementById("reponses");
    conteneur.innerHTML = "";

    const options = melanger([question["Option 1"], question["Option 2"], question["Option 3"]]);

    options.forEach((option, i) => {
        const bouton = document.createElement("button");
        bouton.className = "reponse";
        bouton.textContent = `${"ABC"[i]}. ${option}`;
        bouton.dataset.valeur = option;
        bouton.addEventListener("click", () => verifierReponse(option));
        conteneur.appendChild(bouton);
    });
}

function verifierReponse(reponseChoisie) {
    const question = questions[questionIndex];
    const bonneReponse = question["Réponse Correcte"];
    const retour = document.getElementById("retour");

    document.querySelectorAll(".reponse").forEach((bouton) => {
        bouton.disabled = true;
        if (bouton.dataset.valeur === bonneReponse) bouton.classList.add("correcte");
        else if (bouton.dataset.valeur === reponseChoisie) bouton.classList.add("fausse");
    });

    if (reponseChoisie === bonneReponse) {
        score++;
        retour.textContent = "✅ Bonne réponse !";
        retour.style.color = "var(--vert)";
    } else {
        mauvaisesReponses.push({ question: question.Question, bonneReponse });
        retour.textContent = `❌ Mauvaise réponse ! Bonne réponse : ${bonneReponse}`;
        retour.style.color = "var(--rouge)";
    }

    document.getElementById("score").textContent = `Score : ${score}`;

    const boutonSuivant = document.getElementById("bouton-suivant");
    boutonSuivant.textContent = questionIndex + 1 < questions.length ? "Question suivante ➜" : "Voir le résultat 🏁";
    boutonSuivant.hidden = false;
    boutonSuivant.focus();
}

function questionSuivante() {
    questionIndex++;
    if (questionIndex >= questions.length) finQuiz();
    else afficherQuestion();
}

// ------------------------------
// FIN DU QUIZ
// ------------------------------

function finQuiz() {
    montrerEcran("fin");

    document.getElementById("score-final").textContent = `${score} / ${questions.length}`;

    let message;
    if (score === questions.length) message = "🔥 Incroyable !";
    else if (score >= 7) message = "👏 Excellent niveau !";
    else if (score >= 5) message = "👍 Pas mal du tout !";
    else message = "📚 Continue d'apprendre sur le Togo !";
    document.getElementById("message-final").textContent = message;

    const conteneur = document.getElementById("erreurs");
    conteneur.innerHTML = "";

    if (mauvaisesReponses.length) {
        const titre = document.createElement("p");
        titre.innerHTML = "<strong>📚 Questions ratées :</strong>";
        conteneur.appendChild(titre);

        mauvaisesReponses.forEach((erreur) => {
            const item = document.createElement("div");
            item.className = "erreur-item";
            item.textContent = `❓ ${erreur.question}\n✅ ${erreur.bonneReponse}`;
            item.style.whiteSpace = "pre-line";
            conteneur.appendChild(item);
        });
    }
}

// ------------------------------
// PROPOSER UNE QUESTION
// ------------------------------

function remplirCategoriesFormulaire() {
    const select = document.getElementById("champ-categorie");
    select.innerHTML = "";
    categoriesOfficielles.forEach((categorie) => select.add(new Option(categorie, categorie)));
}

function ouvrirFormulaire() {
    document.getElementById("formulaire").reset();
    document.getElementById("formulaire").hidden = false;
    document.getElementById("message-formulaire").textContent = "";
    document.getElementById("message-merci").hidden = true;
    if (categorieChoisie && categorieChoisie !== "Toutes") {
        document.getElementById("champ-categorie").value = categorieChoisie;
    }
    montrerEcran("proposer");
}

async function envoyerProposition(evenement) {
    evenement.preventDefault();

    const message = document.getElementById("message-formulaire");
    const boutonEnvoyer = document.getElementById("bouton-envoyer");
    const options = [...document.querySelectorAll(".champ-option")].map((champ) => champ.value.trim());
    const bonne = document.querySelector('input[name="bonne"]:checked');

    boutonEnvoyer.disabled = true;
    message.style.color = "var(--texte)";
    message.textContent = "Envoi en cours…";

    try {
        const reponse = await fetch("proposer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categorie: document.getElementById("champ-categorie").value,
                question: document.getElementById("champ-question").value.trim(),
                options,
                bonne_reponse: bonne ? Number(bonne.value) : null,
                pseudo: document.getElementById("champ-pseudo").value.trim(),
                site_web: document.getElementById("champ-site-web").value,
            }),
        });
        const resultat = await reponse.json().catch(() => ({}));

        if (!reponse.ok || !resultat.ok) {
            message.style.color = "var(--rouge)";
            message.textContent = `❌ ${resultat.erreur || "L'envoi n'a pas marché, réessaie plus tard."}`;
            return;
        }

        document.getElementById("formulaire").hidden = true;
        document.getElementById("message-merci").hidden = false;
        await chargerQuestions();
    } catch {
        message.style.color = "var(--rouge)";
        message.textContent = "❌ L'envoi n'a pas marché, réessaie plus tard.";
    } finally {
        boutonEnvoyer.disabled = false;
    }
}

// ------------------------------
// LANCEMENT
// ------------------------------

document.getElementById("bouton-commencer").addEventListener("click", commencerQuiz);
document.getElementById("bouton-suivant").addEventListener("click", questionSuivante);
document.getElementById("bouton-rejouer").addEventListener("click", () => montrerEcran("accueil"));
document.getElementById("bouton-rejouer-2").addEventListener("click", () => montrerEcran("accueil"));
document.getElementById("bouton-proposer").addEventListener("click", ouvrirFormulaire);
document.getElementById("formulaire").addEventListener("submit", envoyerProposition);

chargerQuestions();
