// Draait automatisch na elke contactformulier-inzending (Netlify's ingebouwde
// "submission-created" hook — geen aparte configuratie nodig). Netlify heeft de
// notificatie-e-mail dan al verstuurd; deze functie verwijdert direct daarna de
// kopie uit het Forms-dashboard, zodat de gegevens alleen in de e-mail overblijven
// (AVG-dataminimalisatie: geen dubbele opslag die apart beheerd moet worden).
exports.handler = async (event) => {
  const { payload } = JSON.parse(event.body);
  const submissionId = payload.id;

  const token = process.env.NETLIFY_API_TOKEN;
  if (!token) {
    console.error(
      "NETLIFY_API_TOKEN ontbreekt als environment variable — submission " +
        submissionId +
        " is NIET verwijderd. Zie Site settings > Environment variables."
    );
    return { statusCode: 200, body: "ok" };
  }

  try {
    const response = await fetch(
      `https://api.netlify.com/api/v1/submissions/${submissionId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      console.error(
        `Verwijderen van submission ${submissionId} mislukt (status ${response.status}).`
      );
    }
  } catch (error) {
    console.error(`Fout bij verwijderen van submission ${submissionId}:`, error);
  }

  return { statusCode: 200, body: "ok" };
};
