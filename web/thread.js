function messageHandler(event) {
    // On récupère le message envoyé par la page principale
    var messageSent = event.data;
    // On prépare le message de retour
    var messageReturned = "Bonjour " + messageSent + " depuis un thread séparé !";
    // On renvoit le tout à la page principale
    this.postMessage(messageReturned);
}