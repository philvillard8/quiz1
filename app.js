// 1. Initialisation de Supabase
const SUPABASE_URL = "https://vdmktszqkkabrmvokbbz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkbWt0c3pxa2thYnJtdm9rYmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTYzMjcsImV4cCI6MjEwMjAzMjMyN30.VtAm6re1aC_xT2fy5PMg3hCtwgGzZFL-HboEECSZVC0";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    messageElement.style.color = "orange";
    messageElement.textContent = "Vérification...";

    try {
        // Appel direct de votre fonction SQL stockée dans Supabase
        const { data: estValide, error } = await supabase.rpc('verifier_utilisateur', { 
            username_saisi: usernameInput, 
            mdp_saisi: passwordInput 
        });

        if (error) throw error;

        if (estValide === true) {
            messageElement.style.color = "green";
            messageElement.textContent = "Connexion réussie !";
            
            // Stockage du nom de l'élève pour la page suivante
            localStorage.setItem('user_session', usernameInput);

            setTimeout(() => {
                window.location.href = "page_suivante.html";
            }, 1000);
        } else {
            messageElement.style.color = "red";
            messageElement.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
        }
    } catch (err) {
        messageElement.style.color = "red";
        messageElement.textContent = "Erreur technique de connexion.";
        console.error(err);
    }
});


