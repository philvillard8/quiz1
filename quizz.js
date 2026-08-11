import { createClient } from 'https://esm.sh';

// Sécurité : blocage si l'élève n'est pas passé par la page de connexion
const username = localStorage.getItem('user_session');
if (!username) {
    alert("Accès refusé. Veuillez vous connecter.");
    window.location.href = "index.html";
} else {
    const userElement = document.getElementById('currentUser');
    if (userElement) userElement.textContent = username;
}

// Configuration identique des clés Supabase
const SUPABASE_URL = "https://vdmktszqkkabrmvokbbz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkbWt0c3pxa2thYnJtdm9rYmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTYzMjcsImV4cCI6MjEwMjAzMjMyN30.VtAm6re1aC_xT2fy5PMg3hCtwgGzZFL-HboEECSZVC0";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('btnTerminer').addEventListener('click', async () => {
    const questions = document.querySelectorAll('.question');
    const testName = document.getElementById('quizTitle')?.textContent || "Test sans nom";
    let résultatsTableau = [];
    let totalFautes = 0;
    let toutesRepondues = true;

    // Validation : toutes les questions doivent être cochées
    questions.forEach(q => {
        const qId = q.getAttribute('data-q');
        const caseCochee = document.querySelector(`input[name="${qId}"]:checked`);
        if (!caseCochee) { toutesRepondues = false; }
    });

    if (!toutesRepondues) {
        alert("Veuillez répondre à toutes les questions avant de valider.");
        return;
    }

    document.getElementById('btnTerminer').disabled = true;

    // Calcul des points et affichage de la correction en couleur
    questions.forEach(q => {
        const qId = q.getAttribute('data-q');
        const bonneReponse = q.getAttribute('data-correct');
        const caseCochee = document.querySelector(`input[name="${qId}"]:checked`);
        
        const radios = document.querySelectorAll(`input[name="${qId}"]`);
        radios.forEach(r => r.disabled = true); // Fige les réponses

        const estJuste = (caseCochee.value === bonneReponse);
        résultatsTableau.push(`${qId}:${estJuste}`);

        const indication = document.createElement('span');
        indication.classList.add('statut-reponse');

        if (estJuste) {
            q.classList.add('correct');
            indication.style.color = "#28a745";
            indication.textContent = "✓ Correct !";
        } else {
            q.classList.add('incorrect');
            totalFautes++;
            indication.style.color = "#dc3545";
            indication.textContent = `✗ Incorrect. La bonne réponse était la (${bonneReponse}).`;
        }
        q.appendChild(indication);
    });

    // Établissement du bilan demandé (A, B ou C)
    let bilan = "C";
    if (totalFautes === 0) bilan = "A";
    else if (totalFautes <= 3) bilan = "B";

    résultatsTableau.push(`bilan:${bilan}`);
    const texteResultat = `{${résultatsTableau.join('; ')}}`;

    document.getElementById('message').style.color = "orange";
    document.getElementById('message').textContent = "Envoi des résultats...";

    // Envoi des données dans la table 'resultat'
    const { error } = await supabaseClient
        .from('resultat')
        .insert([{ username: username, result: texteResultat, test_name: testName }]);

    if (error) {
        document.getElementById('message').style.color = "red";
        document.getElementById('message').textContent = "Erreur d'enregistrement : " + error.message;
        document.getElementById('btnTerminer').disabled = false; 
    } else {
        document.getElementById('message').style.color = "green";
        
        // Déclenchement du compte à rebours de 20 secondes avant fermeture
        let tempsRestant = 20;
        document.getElementById('message').innerHTML = `
            Évaluation enregistrée ! Bilan : ${bilan} (${totalFautes} faute(s)).
            <span id="countdown">Fermeture automatique de la page dans ${tempsRestant} secondes.</span>
        `;

        const intervalle = setInterval(() => {
            tempsRestant--;
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) countdownElement.textContent = `Fermeture automatique de la page dans ${tempsRestant} secondes.`;

            if (tempsRestant <= 0) {
                clearInterval(intervalle);
                localStorage.removeItem('user_session');
                window.close();
            }
        }, 1000);
    }
});

