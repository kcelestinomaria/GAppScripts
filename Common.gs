/**
 * ABOUT THE WHOLE PROJECT
 * We'll learn how to create homepages, contextual triggers, and connecting to third-party APIs for our Google Workspace Add-On.
 * 
 * This Add-On creates contextual & non-contextual interfaces in Gmail, Calendar, and Drive.
 * The Add-On displays a random image of a Cat with some text overlaying the image.
 * This text is either static for homepages or taken from the host application context for contextual triggers
 * 
 * 
 */


function onHomePage(e) {
  console.log(e);

  var hour = Number(Utilities.formatDate(new Date(), e.userTimezone.id, 'H'));

  var message;
  if (hour >= 6 && hour < 12) {
    message = "Good Morning!";
  } else if (hour >= 12 && hour < 18) {
    message = "Good Afternoon!";
  } else {
    message = "Good Night!";
  }
  message += ' ' + e.hostApp;

  return createCatCard(message, true);
}

/**
 * This function creates the card displaying the cat's image, with an overlaying text on it.
 * @param {String} text The text to overlay on the image.
 * @param {Boolean} isHomepage True if the card created here is a homepage;
 *      false otherwise. Defaults to false.
 * @return {CardService.Card} The assembled card.
 */
function createCatCard(text, isHomePage) {
  // Explicitly set the value of isHomePage as false if null or undefined
  if (!isHomePage) {
    isHomePage = false;
  }

  // Let's now integrate a Third-Party API - the 'Cat as a service' API
  // We GET the Cat Image, and we also add a 'time' URL parameter to act as a cache buster
  var now = new Date();

  // Replace the forward slashes in the text, as they break the CataaS API
  var caption = text.replace(/\//g, ' ');
  var imageUrl =
      Utilities.formatString('https://cataas.com/cat/says/%s?time=%s', 
      encodeURIComponent(caption), now.getTime());

  var image = CardService.newImage()
      .setImageUrl(imageUrl)
      .setAltText('Meow')

  // Let's create a button that changes the Cat Image when clicked
  // Note: Action parameters keys and values must be strings
  var action = CardService.newAction()
      .setFunctionName('onChangeCat')
      .setParameters({text: text, isHomePage: isHomePage.toString()});

  var button = CardService.newTextButton()
      .setText('Change Cat')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);

  var buttonSet = CardService.newButtonSet()
      .addButton(button)

  
  // Let's create a footer at the bottom of the card display
  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton() 
          .setText('Powered by cataas.com')
          .setOpenLink(CardService.newOpenLink()
              .setUrl('https://cataas.com')));

  // Now assemble the widgets, and return the card
  var section = CardService.newCardSection()
      .addWidget(image)
      .addWidget(buttonsSet);

  var card = CardService.newCardBuilder()
      .addSection(section)
      .setFixedFooter(footer);

  if (!isHomePage) {
    // Let's create the header that is shown when the Card is minimized, but only
    // when the Card is a contextual card. Peek headers, like this one, are never used
    // by non-contextual cards like HomePages

    var peekHeader = CardService.newCardHeader()
      .setTitle('Contextual Card')
      .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/pets_black_48dp.png')
      .setSubtitle(text);
    card.setPeekCardHeader(peekHeader)
  }
  return card.build();
}

/**
 * This is a Callback function, for the "Change Cat" button
 * @param {Object} e The event object, documented {@link
 *     https://developers.google.com/gmail/add-ons/concepts/actions#action_event_objects
 *     here}.
 * @return {CardService.ActionResponse} The action response to apply.
 */
function onChangeCat(e) {
  console.log(e);

  // Let's get the text that was shown in the current cat image. This was passed as a parameter on the Action set for the button
  var text = e.parameters.text;

  // The isHomePage parameter is passed as a string, so convert to a boolean
  var isHomePage = e.parameters.isHomepage === 'true';

  // Create a new card with the same text
  var card = createCatCard(text, isHomePage);

  // Create an action response that instructs the add-on to replace 
  // the current card with a new one
  var navigation = CardService.newNavigation()
      .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
      .setNavigation(navigation);
  return actionResponse.build();
}

/**
 * Helper function to truncate a message that will fit in the Cat image
 */
function truncate(message) {
  if (message.length > MAX_MESSAGE_LENGTH) {
    message = message.slice(0, MAX_MESSAGE_LENGTH);
    message = message.slice(0, message.lastIndexOf(' ')) + '...';
  }
  return message;
}
