**
 * Let's create a callback function for rendering the card for a 
 * specific Gmail Message
 * @param {Object} e The event object
 * 
 */
function onGmailMessage(e) {
  console.log(e);

  // Let's get the ID of the Gmail Message(content) that the user has opened up
  var messageId = e.gmail.messageId;

  var accessToken = e.gmail.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  // Get the subject of the email.
  var message = GmailApp.getMessageById(messageId);
  var subject = message.getThread().getFirstMessageSubject();

  // Remove labels and prefixes
  subject = subject
    .replace(/^([rR][eE]|[fF][wW][dD])\:\s*/, '')
    .replace(/^\[.*?\]\s*/, '');

  // If necessary, truncate the subject to fit into the image
  subject.truncate(subject);

  return createCatCard(subject);
}


function onGmailCompose(e) {
  console.log(e)
}
