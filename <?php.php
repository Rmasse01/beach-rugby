<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $teamName = $_POST['teamName'];
    $jersey = $_POST['jersey'];
    $names = $_POST['name'];
    $sizes = $_POST['size'];
    $numbers = $_POST['number'];
    $anecdotes = $_POST['anecdote'];
    $email = $_POST['email'];

    $subject = "Nouvelle inscription d'équipe - Occitan Beach Rugby";
    $message = "Nom de l'équipe: " . $teamName . "\n";
    $message .= "Maillot choisi: " . $jersey . "\n\n";
    $message .= "Informations des joueurs:\n";
    for ($i = 0; $i < count($names); $i++) {
        $message .= "Nom/Surnom: " . $names[$i] . "\n";
        $message .= "Taille: " . $sizes[$i] . "\n";
        $message .= "Numéro: " . $numbers[$i] . "\n";
        $message .= "Anecdote: " . $anecdotes[$i] . "\n\n";
    }
    $message .= "\nAdresse e-mail du capitaine: " . $email . "\n";

    $to = "rudy.masse@gmail.com"; // Remplacez par votre adresse e-mail
    $headers = "From: inscription@occitanbeachrugby.fr"; // Remplacez par une adresse d'envoi

    if (mail($to, $subject, $message, $headers)) {
        // L'e-mail a été envoyé avec succès
        header("Location: inscription_reussie.html"); // Créez une page de confirmation
        exit();
    } else {
        // Erreur lors de l'envoi de l'e-mail
        echo "Une erreur est survenue lors de l'envoi de l'e-mail.";
    }
} else {
    // Si on accède directement au script sans soumettre le formulaire
    header("HTTP/1.1 403 Forbidden");
    echo "Accès interdit.";
    exit();
}
?>